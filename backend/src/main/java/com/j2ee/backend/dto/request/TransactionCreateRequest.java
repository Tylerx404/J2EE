package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Yêu cầu tạo giao dịch thu/chi.")
public class TransactionCreateRequest {
    @Schema(description = "ID ví.", example = "1")
    @NotNull(message = "walletId is required")
    @Positive(message = "walletId must be positive")
    private Long walletId;

    @Schema(description = "ID category (có thể null).", example = "10")
    @Positive(message = "categoryId must be positive")
    private Long categoryId;

    @Schema(description = "Số tiền giao dịch (> 0).", example = "50000")
    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private BigDecimal amount;

    @Schema(description = "Loại giao dịch.", allowableValues = { "EXPENSE", "INCOME" }, example = "EXPENSE")
    @NotBlank(message = "type is required")
    @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
    private String type;

    @Schema(description = "Ghi chú giao dịch.", example = "Cafe sáng")
    @Size(max = 2000, message = "note must be at most 2000 characters")
    private String note;

    @Schema(description = "Thời điểm giao dịch theo ISO-8601. Bỏ trống sẽ dùng thời điểm hiện tại.", example = "2026-03-04T08:30:00")
    private LocalDateTime transactionDate;
}
