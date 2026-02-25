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
public class WalletResponse {
    private Long id;
    private String name;
    private BigDecimal initialBalance; // Số dư ban đầu
    private BigDecimal balance; // Số dư hiện tại
    private String currency;
    private LocalDateTime createdAt;
    private Long userId;
}
