package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.Size;

public record DeleteAccountRequest(
        @Size(max = 72, message = "password must be at most 72 characters")
        String password) {
}
