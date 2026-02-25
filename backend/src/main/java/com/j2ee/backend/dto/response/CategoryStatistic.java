package com.j2ee.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatistic {
    private Long categoryId;
    private String categoryName;
    private String type; // "EXPENSE" or "INCOME"
    private BigDecimal total;
    private Integer count; // số lượng giao dịch
}
