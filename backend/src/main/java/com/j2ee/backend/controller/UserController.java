package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.UserUpdateRequest;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * UserController - Endpoints cho quản lý thông tin User
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/user/profile - Lấy thông tin profile của user hiện tại
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getMyProfile(username);
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/user/profile - Cập nhật thông tin profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UserUpdateRequest request) {
        String username = authentication.getName();
        UserProfileResponse updated = userService.updateProfile(username, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/user/change-password - Đổi mật khẩu
     * Body: { "oldPassword": "xxx", "newPassword": "yyy" }
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        userService.changePassword(username, oldPassword, newPassword);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    /**
     * DELETE /api/user/account - Xóa tài khoản
     * Body: { "password": "xxx" }
     */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String password = request.get("password");

        userService.deleteAccount(username, password);

        return ResponseEntity.ok(Map.of("message", "Xóa tài khoản thành công!"));
    }
}
