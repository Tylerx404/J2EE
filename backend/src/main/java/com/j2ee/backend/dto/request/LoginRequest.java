package com.j2ee.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu đăng nhập bằng username hoặc email.")
public record LoginRequest(
        @Schema(description = "Username hoặc email đăng nhập.", example = "tyler@example.com")
        @JsonAlias({ "username", "email" })
        @NotBlank(message = "usernameOrEmail is required")
        @Size(max = 100, message = "usernameOrEmail must be at most 100 characters")
        String usernameOrEmail,

        @Schema(description = "Mật khẩu.", example = "myPassword123")
        @NotBlank(message = "password is required")
        @Size(max = 72, message = "password must be at most 72 characters")
        String password) {
}
