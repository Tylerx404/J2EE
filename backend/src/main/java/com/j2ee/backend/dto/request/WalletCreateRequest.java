package com.j2ee.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletCreateRequest {
    private String name; // "Ví chính", "Ví tiết kiệm"
    private BigDecimal initialBalance; // Số dư ban đầu (user tự khai báo)
    private String currency; // "VND", "USD" (optional, default VND)
}
