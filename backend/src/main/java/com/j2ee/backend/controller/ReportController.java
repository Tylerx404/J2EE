package com.j2ee.backend.controller;

import com.j2ee.backend.dto.response.MonthlyReportDetailResponse;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/reports/monthly?period=2026-02
     * Lấy báo cáo tháng chi tiết với so sánh tháng trước và top categories
     * 
     * Query params:
     * - period: "YYYY-MM" (required)
     * - walletId: Long (optional) - filter theo wallet
     * - type: "EXPENSE" or "INCOME" (optional) - filter theo type
     */
    @GetMapping("/monthly")
    public ResponseEntity<MonthlyReportDetailResponse> getMonthlyReport(
            Authentication authentication,
            @RequestParam String period,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) String type) {

        String username = authentication.getName();

        // Validate period format
        if (!period.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("Period phải có format YYYY-MM, ví dụ: 2026-02");
        }

        MonthlyReportDetailResponse report = reportService.getMonthlyReport(username, period, walletId, type);
        return ResponseEntity.ok(report);
    }

    /**
     * GET /api/reports/transactions
     * Lấy danh sách transactions với filter date range
     * 
     * Query params:
     * - startDate: ISO DateTime (required)
     * - endDate: ISO DateTime (required)
     * - walletId: Long (optional)
     * - type: "EXPENSE" or "INCOME" (optional)
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getFilteredTransactions(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) String type) {

        String username = authentication.getName();

        List<Transaction> transactions = reportService.getTransactionsFiltered(
                username, startDate, endDate, walletId, type);

        List<TransactionResponse> responses = transactions.stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/reports/current-month
     * Shortcut để lấy báo cáo tháng hiện tại
     */
    @GetMapping("/current-month")
    public ResponseEntity<MonthlyReportDetailResponse> getCurrentMonthReport(
            Authentication authentication,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) String type) {

        String username = authentication.getName();

        // Get current month in format YYYY-MM
        YearMonth currentMonth = YearMonth.now();
        String period = String.format("%d-%02d", currentMonth.getYear(), currentMonth.getMonthValue());

        MonthlyReportDetailResponse report = reportService.getMonthlyReport(username, period, walletId, type);
        return ResponseEntity.ok(report);
    }

    /**
     * Helper method to convert Transaction to TransactionResponse
     */
    private TransactionResponse toTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .walletId(transaction.getWallet().getId())
                .walletName(transaction.getWallet().getName())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .note(transaction.getNote())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
