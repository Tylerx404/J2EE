package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu xóa tài khoản.")
public record DeleteAccountRequest(
        @Schema(description = "Mật khẩu xác nhận (đối với tài khoản local).", example = "myPassword123")
        @Size(max = 72, message = "password must be at most 72 characters")
        String password) {
}
