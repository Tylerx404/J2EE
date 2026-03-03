package com.j2ee.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @JsonAlias({ "username", "email" })
        @NotBlank(message = "usernameOrEmail is required")
        @Size(max = 100, message = "usernameOrEmail must be at most 100 characters")
        String usernameOrEmail,

        @NotBlank(message = "password is required")
        @Size(max = 72, message = "password must be at most 72 characters")
        String password) {
}
