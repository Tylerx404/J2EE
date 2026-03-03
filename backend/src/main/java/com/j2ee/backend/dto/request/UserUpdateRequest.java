package com.j2ee.backend.dto.request;

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
public class UserUpdateRequest {
    @Size(max = 100, message = "fullName must be at most 100 characters")
    private String fullName;

    @Email(message = "email is invalid")
    @Size(max = 100, message = "email must be at most 100 characters")
    private String email;

    @Size(max = 255, message = "avatarUrl must be at most 255 characters")
    private String avatarUrl;
}
