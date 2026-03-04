package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Báo cáo tháng rút gọn.")
public class MonthlyReportResponse {
    @Schema(description = "Tháng báo cáo.", example = "3")
    private int month;
    @Schema(description = "Năm báo cáo.", example = "2026")
    private int year;
    @Schema(description = "Tổng thu nhập.", example = "12000000")
    private BigDecimal totalIncome;
    @Schema(description = "Tổng chi tiêu.", example = "8500000")
    private BigDecimal totalExpense;
    @Schema(description = "Số dư thu - chi.", example = "3500000")
    private BigDecimal balance;
    @Schema(description = "Lời khuyên AI.", example = "Bạn nên tối ưu chi tiêu ăn uống trong tháng tới.")
    private String aiAdvice;
}
