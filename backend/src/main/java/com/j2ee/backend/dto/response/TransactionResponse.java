package com.j2ee.backend.dto.response;

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
public class TransactionResponse {
    private Long id;
    private Long walletId;
    private String walletName;
    private BigDecimal amount;
    private String type; // "EXPENSE" or "INCOME"
    private Long categoryId;
    private String categoryName;
    private String note;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}