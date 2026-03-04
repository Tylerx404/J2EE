package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "ApiValidationErrorResponse", description = "Mẫu phản hồi lỗi validation.")
public class ApiValidationErrorResponse {

    @Schema(description = "Thời điểm phát sinh lỗi.", example = "2026-03-04T22:30:00")
    private LocalDateTime timestamp;

    @Schema(description = "HTTP status code.", example = "400")
    private Integer status;

    @Schema(description = "Tên lỗi theo HTTP status.", example = "Bad Request")
    private String error;

    @Schema(description = "Thông điệp lỗi tổng quát.", example = "Validation failed")
    private String message;

    @Schema(description = "Đường dẫn API gây lỗi.", example = "/api/transactions")
    private String path;

    @Schema(
            description = "Chi tiết lỗi theo từng field.",
            example = "{\"amount\":\"amount must be positive\",\"type\":\"type must be EXPENSE or INCOME\"}")
    private Map<String, String> errors;
}
