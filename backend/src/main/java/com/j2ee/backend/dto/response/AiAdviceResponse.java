package com.j2ee.backend.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AiAdviceResponse {
    Long id;
    String adviceText;
    LocalDateTime generatedAt;
    String period;
}
