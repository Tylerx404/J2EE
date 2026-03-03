package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "oldPassword is required")
        @Size(max = 72, message = "oldPassword must be at most 72 characters")
        String oldPassword,

        @NotBlank(message = "newPassword is required")
        @Size(min = 6, max = 72, message = "newPassword must be 6-72 characters")
        String newPassword) {
}
