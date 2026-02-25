package com.j2ee.backend.dto.request;

public record RegisterRequest(
        String username,
        String email,
        String password,
        String fullName) {
}