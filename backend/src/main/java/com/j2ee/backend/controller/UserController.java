package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.ChangePasswordRequest;
import com.j2ee.backend.dto.request.DeleteAccountRequest;
import com.j2ee.backend.dto.request.UserUpdateRequest;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getMyProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request) {
        String username = authentication.getName();
        UserProfileResponse updated = userService.updateProfile(username, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        userService.changePassword(username, request.oldPassword(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            Authentication authentication,
            @Valid @RequestBody DeleteAccountRequest request) {
        String username = authentication.getName();
        userService.deleteAccount(username, request.password());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
