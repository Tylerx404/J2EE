package com.j2ee.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MonthlyReportResponse {
    private int month;
    private int year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private String aiAdvice;
}