package com.j2ee.backend.controller;

import com.j2ee.backend.dto.response.MonthlyReportDetailResponse;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.service.ReportService;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Validated
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyReportDetailResponse> getMonthlyReport(
            Authentication authentication,
            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "period must be in format YYYY-MM")
            String period,
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @RequestParam(required = false)
            @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
            String type) {

        String username = authentication.getName();
        MonthlyReportDetailResponse report = reportService.getMonthlyReport(username, period, walletId, type);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getFilteredTransactions(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @RequestParam(required = false)
            @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
            String type) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate");
        }

        String username = authentication.getName();
        List<Transaction> transactions = reportService.getTransactionsFiltered(
                username, startDate, endDate, walletId, type);

        List<TransactionResponse> responses = transactions.stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/current-month")
    public ResponseEntity<MonthlyReportDetailResponse> getCurrentMonthReport(
            Authentication authentication,
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @RequestParam(required = false)
            @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
            String type) {

        String username = authentication.getName();
        YearMonth currentMonth = YearMonth.now();
        String period = String.format("%d-%02d", currentMonth.getYear(), currentMonth.getMonthValue());

        MonthlyReportDetailResponse report = reportService.getMonthlyReport(username, period, walletId, type);
        return ResponseEntity.ok(report);
    }

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
