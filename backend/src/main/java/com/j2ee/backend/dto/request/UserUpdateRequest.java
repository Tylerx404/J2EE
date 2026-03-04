package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu cập nhật thông tin hồ sơ người dùng.")
public class UserUpdateRequest {
    @Schema(description = "Họ tên hiển thị.", example = "Tyler Nguyen")
    @Size(max = 100, message = "fullName must be at most 100 characters")
    private String fullName;

    @Schema(description = "Email mới.", example = "tyler.new@example.com")
    @Email(message = "email is invalid")
    @Size(max = 100, message = "email must be at most 100 characters")
    private String email;

    @Schema(description = "URL ảnh đại diện.", example = "https://cdn.example.com/avatar.png")
    @Size(max = 255, message = "avatarUrl must be at most 255 characters")
    private String avatarUrl;
}
