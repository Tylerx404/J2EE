package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "username is required")
        @Size(min = 3, max = 50, message = "username must be 3-50 characters")
        @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "username contains invalid characters")
        String username,

        @NotBlank(message = "email is required")
        @Email(message = "email is invalid")
        @Size(max = 100, message = "email must be at most 100 characters")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 6, max = 72, message = "password must be 6-72 characters")
        String password,

        @NotBlank(message = "fullName is required")
        @Size(max = 100, message = "fullName must be at most 100 characters")
        String fullName) {
}
