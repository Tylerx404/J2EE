package com.j2ee.backend.dto.request;

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
    private Long walletId;
    private Long categoryId; // optional
    private BigDecimal amount;
    private String type; // "EXPENSE" or "INCOME"
    private String note; // optional
    private LocalDateTime transactionDate; // optional, default now
}