package com.j2ee.backend.dto.request;

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
public class TransactionCreateRequest {
    @NotNull(message = "walletId is required")
    @Positive(message = "walletId must be positive")
    private Long walletId;

    @Positive(message = "categoryId must be positive")
    private Long categoryId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "type is required")
    @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
    private String type;

    @Size(max = 2000, message = "note must be at most 2000 characters")
    private String note;

    private LocalDateTime transactionDate;
}
