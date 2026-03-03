package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.Pattern;

public record AiGenerateAdviceRequest(
        @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "period must be in format YYYY-MM")
        String period) {
}
