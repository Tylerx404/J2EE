package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thống kê theo category.")
public class CategoryStatistic {
    @Schema(description = "ID category.", example = "10")
    private Long categoryId;
    @Schema(description = "Tên category.", example = "Ăn uống")
    private String categoryName;
    @Schema(description = "Loại category.", allowableValues = { "EXPENSE", "INCOME" }, example = "EXPENSE")
    private String type; // "EXPENSE" or "INCOME"
    @Schema(description = "Tổng số tiền.", example = "1250000")
    private BigDecimal total;
    @Schema(description = "Số lượng giao dịch.", example = "12")
    private Integer count; // số lượng giao dịch
}
