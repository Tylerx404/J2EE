package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@Schema(description = "Dữ liệu lời khuyên AI đã sinh.")
public class AiAdviceResponse {
    @Schema(description = "ID bản ghi advice.", example = "1")
    Long id;
    @Schema(description = "Nội dung lời khuyên.", example = "Bạn đang chi tiêu vượt thu nhập, nên cắt giảm chi phí không cần thiết.")
    String adviceText;
    @Schema(description = "Thời điểm sinh lời khuyên.", example = "2026-03-04T21:30:00")
    LocalDateTime generatedAt;
    @Schema(description = "Kỳ báo cáo YYYY-MM.", example = "2026-03")
    String period;
}
