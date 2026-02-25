package com.j2ee.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.j2ee.backend.dto.request.GoogleLoginRequest;
import com.j2ee.backend.dto.request.LoginRequest;
import com.j2ee.backend.dto.request.RegisterRequest;
import com.j2ee.backend.dto.response.JwtResponse;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WalletService walletService;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username đã tồn tại!");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email đã tồn tại!");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .provider("LOCAL")
                .build();

        user = userRepository.save(user);

        // Tự động tạo ví mặc định cho user mới
        walletService.createDefaultWallet(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return new JwtResponse(token, user.getEmail(), user.getFullName());
    }

    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Username hoặc email không tồn tại!"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Mật khẩu không đúng!");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return new JwtResponse(token, user.getEmail(), user.getFullName());
    }

    @Transactional
    public JwtResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            // Verify Google ID Token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.idToken());
            if (idToken == null) {
                throw new BadCredentialsException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String providerId = payload.getSubject(); // Google user ID

            // Tìm user theo email (CÁCH ĐƠN GIẢN - nếu email tồn tại thì login luôn)
            User user = userRepository.findByEmail(email).orElse(null);

            boolean isNewUser = false;
            if (user == null) {
                // Email chưa tồn tại → tạo user mới với provider="GOOGLE"
                user = User.builder()
                        .username(email.split("@")[0] + "_" + System.currentTimeMillis()) // username unique từ email
                        .email(email)
                        .fullName(name)
                        .provider("GOOGLE")
                        .providerId(providerId)
                        .passwordHash(null) // Google user không cần password
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                user = userRepository.save(user);
                isNewUser = true;
            } else {
                // Email đã tồn tại → login luôn với user đó
                // (Có thể update provider nếu muốn "nâng cấp" từ LOCAL lên GOOGLE)
                if ("LOCAL".equals(user.getProvider())) {
                    user.setProvider("GOOGLE");
                    user.setProviderId(providerId);
                    user = userRepository.save(user);
                }
            }

            // Tự động tạo ví mặc định cho user mới
            if (isNewUser) {
                walletService.createDefaultWallet(user);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            return new JwtResponse(token, user.getEmail(), user.getFullName());

        } catch (Exception e) {
            throw new BadCredentialsException("Google login failed: " + e.getMessage());
        }
    }

    public UserProfileResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}