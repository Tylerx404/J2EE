package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu phân tích giao dịch từ text giọng nói.")
public record VoiceParseRequest(
        @Schema(description = "Nội dung speech-to-text cần phân tích.", example = "Chi 50 nghìn ăn sáng")
        @NotBlank(message = "voiceText is required")
        @Size(max = 2000, message = "voiceText must be at most 2000 characters")
        String voiceText) {
}
