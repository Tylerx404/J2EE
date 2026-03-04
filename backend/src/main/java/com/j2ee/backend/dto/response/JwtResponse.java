package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Kết quả xác thực trả về JWT token.")
public class JwtResponse {
    @Schema(description = "Access token JWT.", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;
    @Schema(description = "Loại token.", example = "Bearer")
    private String type = "Bearer";
    @Schema(description = "Email người dùng.", example = "tyler@example.com")
    private String email;
    @Schema(description = "Tên hiển thị người dùng.", example = "Tyler Nguyen")
    private String name;

    public JwtResponse(String accessToken, String email, String name) {
        this.token = accessToken;
        this.email = email;
        this.name = name;
    }
}
