package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.ChangePasswordRequest;
import com.j2ee.backend.dto.request.DeleteAccountRequest;
import com.j2ee.backend.dto.request.UserUpdateRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.UserProfileResponse;
import com.j2ee.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "API quản lý hồ sơ người dùng.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Lấy hồ sơ người dùng hiện tại")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<UserProfileResponse> getMyProfile(@Parameter(hidden = true) Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getMyProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật hồ sơ người dùng")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công", content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request) {
        String username = authentication.getName();
        UserProfileResponse updated = userService.updateProfile(username, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực hoặc sai mật khẩu", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> changePassword(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        userService.changePassword(username, request.oldPassword(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/account")
    @Operation(summary = "Xóa tài khoản hiện tại")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa tài khoản thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực hoặc sai mật khẩu", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> deleteAccount(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody DeleteAccountRequest request) {
        String username = authentication.getName();
        userService.deleteAccount(username, request.password());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
