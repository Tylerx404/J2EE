package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

@Schema(description = "Yeu cau tao loi khuyen AI theo ky bao cao.")
public record AiGenerateAdviceRequest(
        @Schema(description = "Ky bao cao theo dinh dang YYYY-MM. Bo trong de dung thang hien tai.", example = "2026-03")
        @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "period must be in format YYYY-MM")
        String period,
        @Schema(description = "Loc theo vi cu the. Bo trong de phan tich tat ca vi.", example = "1")
        @Positive(message = "walletId must be positive")
        Long walletId) {
}
