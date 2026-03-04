package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu đăng nhập bằng Google.")
public record GoogleLoginRequest(
        @Schema(description = "Google ID token nhận từ client.", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...")
        @NotBlank(message = "idToken is required")
        String idToken) {
}
