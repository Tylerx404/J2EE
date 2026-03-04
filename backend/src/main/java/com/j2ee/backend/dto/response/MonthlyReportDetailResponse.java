package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Báo cáo chi tiết theo tháng.")
public class MonthlyReportDetailResponse {
    @Schema(description = "Tháng báo cáo.", example = "3")
    private Integer month;
    @Schema(description = "Năm báo cáo.", example = "2026")
    private Integer year;
    @Schema(description = "Tổng thu nhập trong tháng.", example = "12000000")
    private BigDecimal totalIncome;
    @Schema(description = "Tổng chi tiêu trong tháng.", example = "8500000")
    private BigDecimal totalExpense;
    @Schema(description = "Chênh lệch thu - chi.", example = "3500000")
    private BigDecimal balance; // income - expense

    // So sánh tháng trước
    @Schema(description = "Tổng thu nhập tháng trước.", example = "11000000")
    private BigDecimal previousMonthIncome;
    @Schema(description = "Tổng chi tiêu tháng trước.", example = "9000000")
    private BigDecimal previousMonthExpense;
    @Schema(description = "Phần trăm thay đổi thu nhập so với tháng trước.", example = "9.09")
    private BigDecimal incomeChange; // % thay đổi
    @Schema(description = "Phần trăm thay đổi chi tiêu so với tháng trước.", example = "-5.56")
    private BigDecimal expenseChange; // % thay đổi

    // Top categories
    @Schema(description = "Top category chi tiêu.")
    private List<CategoryStatistic> topExpenseCategories; // top 5
    @Schema(description = "Top category thu nhập.")
    private List<CategoryStatistic> topIncomeCategories; // top 5

    // All categories for chart
    @Schema(description = "Dữ liệu biểu đồ chi tiêu theo category.")
    private List<CategoryStatistic> expenseByCategoryChart;
    @Schema(description = "Dữ liệu biểu đồ thu nhập theo category.")
    private List<CategoryStatistic> incomeByCategoryChart;
}
