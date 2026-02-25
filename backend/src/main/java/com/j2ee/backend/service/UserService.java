package com.j2ee.backend.service;

import com.j2ee.backend.dto.request.UserUpdateRequest;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UserService - Xử lý logic liên quan đến User profile
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy thông tin profile của user hiện tại
     */
    public UserProfileResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return toProfileResponse(user);
    }

    /**
     * Cập nhật thông tin profile
     */
    @Transactional
    public UserProfileResponse updateProfile(String username, UserUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Update các field được phép
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Kiểm tra email đã tồn tại chưa
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi user khác!");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    /**
     * Đổi mật khẩu (chỉ cho local accounts)
     */
    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Chỉ cho phép đổi password nếu là local account
        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw new IllegalArgumentException("Không thể đổi mật khẩu cho tài khoản OAuth!");
        }

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không đúng!");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Xóa tài khoản (cần cẩn thận - cascade delete)
     */
    @Transactional
    public void deleteAccount(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Verify password trước khi xóa (nếu là local account)
        if ("LOCAL".equalsIgnoreCase(user.getProvider())) {
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new IllegalArgumentException("Mật khẩu không đúng!");
            }
        }

        // Xóa user (cascade sẽ xóa wallets, transactions, categories...)
        userRepository.delete(user);
    }

    /**
     * Lấy thông tin user theo ID (admin feature)
     */
    public UserProfileResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return toProfileResponse(user);
    }

    /**
     * Convert User entity sang UserProfileResponse
     */
    private UserProfileResponse toProfileResponse(User user) {
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
