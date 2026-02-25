package com.j2ee.backend.dto.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;

    public JwtResponse(String accessToken, String email, String name) {
        this.token = accessToken;
        this.email = email;
        this.name = name;
    }
}