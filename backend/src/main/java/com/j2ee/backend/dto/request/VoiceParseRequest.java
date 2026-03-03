package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoiceParseRequest(
        @NotBlank(message = "voiceText is required")
        @Size(max = 2000, message = "voiceText must be at most 2000 characters")
        String voiceText) {
}
