package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin hồ sơ người dùng.")
public class UserProfileResponse {
    @Schema(description = "ID người dùng.", example = "1")
    private Long id;
    @Schema(description = "Username.", example = "tyler_01")
    private String username;
    @Schema(description = "Email.", example = "tyler@example.com")
    private String email;
    @Schema(description = "Họ tên hiển thị.", example = "Tyler Nguyen")
    private String fullName;
    @Schema(description = "URL avatar.", example = "https://cdn.example.com/avatar.png")
    private String avatarUrl;
    @Schema(description = "Nhà cung cấp đăng nhập.", example = "LOCAL")
    private String provider;
    @Schema(description = "Thời điểm tạo tài khoản.", example = "2026-03-01T10:00:00")
    private java.time.LocalDateTime createdAt;
}
