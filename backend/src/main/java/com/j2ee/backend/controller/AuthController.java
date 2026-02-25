package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.GoogleLoginRequest;
import com.j2ee.backend.dto.request.LoginRequest;
import com.j2ee.backend.dto.request.RegisterRequest;
import com.j2ee.backend.dto.response.JwtResponse;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<JwtResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @GetMapping("/my-profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(authService.getMyProfile(username));
    }

}