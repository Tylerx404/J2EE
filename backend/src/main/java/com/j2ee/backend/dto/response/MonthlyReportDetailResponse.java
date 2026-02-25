package com.j2ee.backend.dto.response;

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
public class MonthlyReportDetailResponse {
    private Integer month;
    private Integer year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance; // income - expense

    // So sánh tháng trước
    private BigDecimal previousMonthIncome;
    private BigDecimal previousMonthExpense;
    private BigDecimal incomeChange; // % thay đổi
    private BigDecimal expenseChange; // % thay đổi

    // Top categories
    private List<CategoryStatistic> topExpenseCategories; // top 5
    private List<CategoryStatistic> topIncomeCategories; // top 5

    // All categories for chart
    private List<CategoryStatistic> expenseByCategoryChart;
    private List<CategoryStatistic> incomeByCategoryChart;
}
