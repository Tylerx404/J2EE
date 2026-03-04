package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu đổi mật khẩu tài khoản local.")
public record ChangePasswordRequest(
        @Schema(description = "Mật khẩu hiện tại.", example = "oldPassword123")
        @NotBlank(message = "oldPassword is required")
        @Size(max = 72, message = "oldPassword must be at most 72 characters")
        String oldPassword,

        @Schema(description = "Mật khẩu mới.", example = "newStrongPassword123")
        @NotBlank(message = "newPassword is required")
        @Size(min = 6, max = 72, message = "newPassword must be 6-72 characters")
        String newPassword) {
}
