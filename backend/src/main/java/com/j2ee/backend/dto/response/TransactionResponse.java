package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin giao dịch.")
public class TransactionResponse {
    @Schema(description = "ID giao dịch.", example = "100")
    private Long id;
    @Schema(description = "ID ví.", example = "1")
    private Long walletId;
    @Schema(description = "Tên ví.", example = "Ví chính")
    private String walletName;
    @Schema(description = "Số tiền giao dịch.", example = "50000")
    private BigDecimal amount;
    @Schema(description = "Loại giao dịch.", allowableValues = { "EXPENSE", "INCOME" }, example = "EXPENSE")
    private String type; // "EXPENSE" or "INCOME"
    @Schema(description = "ID category.", example = "10")
    private Long categoryId;
    @Schema(description = "Tên category.", example = "Ăn uống")
    private String categoryName;
    @Schema(description = "Ghi chú.", example = "Cafe sáng")
    private String note;
    @Schema(description = "Thời điểm giao dịch.", example = "2026-03-04T08:30:00")
    private LocalDateTime transactionDate;
    @Schema(description = "Thời điểm tạo bản ghi.", example = "2026-03-04T08:35:00")
    private LocalDateTime createdAt;
}
