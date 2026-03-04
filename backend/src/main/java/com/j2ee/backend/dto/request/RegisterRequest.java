package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu đăng ký tài khoản local.")
public record RegisterRequest(
        @Schema(description = "Username duy nhất.", example = "tyler_01")
        @NotBlank(message = "username is required")
        @Size(min = 3, max = 50, message = "username must be 3-50 characters")
        @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "username contains invalid characters")
        String username,

        @Schema(description = "Email người dùng.", example = "tyler@example.com")
        @NotBlank(message = "email is required")
        @Email(message = "email is invalid")
        @Size(max = 100, message = "email must be at most 100 characters")
        String email,

        @Schema(description = "Mật khẩu.", example = "myPassword123")
        @NotBlank(message = "password is required")
        @Size(min = 6, max = 72, message = "password must be 6-72 characters")
        String password,

        @Schema(description = "Họ tên hiển thị.", example = "Tyler Nguyen")
        @NotBlank(message = "fullName is required")
        @Size(max = 100, message = "fullName must be at most 100 characters")
        String fullName) {
}
