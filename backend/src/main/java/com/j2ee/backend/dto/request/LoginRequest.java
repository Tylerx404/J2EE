package com.j2ee.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

public record LoginRequest(
                @JsonAlias({
                                "username", "email" }) String usernameOrEmail,
                String password) {
}