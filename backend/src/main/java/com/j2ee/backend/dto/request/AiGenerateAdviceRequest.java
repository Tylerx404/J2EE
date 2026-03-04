package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Yêu cầu tạo lời khuyên AI theo kỳ báo cáo.")
public record AiGenerateAdviceRequest(
        @Schema(description = "Kỳ báo cáo theo định dạng YYYY-MM. Bỏ trống để dùng tháng hiện tại.", example = "2026-03")
        @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "period must be in format YYYY-MM")
        String period) {
}
