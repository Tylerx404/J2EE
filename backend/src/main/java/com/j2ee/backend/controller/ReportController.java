package com.j2ee.backend.controller;

import com.j2ee.backend.dto.response.MonthlyReportDetailResponse;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Report", description = "API báo cáo giao dịch và thống kê theo thời gian.")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    @Operation(summary = "Lấy báo cáo theo tháng", description = "Tổng hợp thu/chi theo kỳ YYYY-MM.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(schema = @Schema(implementation = MonthlyReportDetailResponse.class))),
            @ApiResponse(responseCode = "400", description = "Query param không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập ví", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<MonthlyReportDetailResponse> getMonthlyReport(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "Kỳ báo cáo định dạng YYYY-MM", example = "2026-03")
            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "period must be in format YYYY-MM")
            String period,
            @Parameter(description = "Lọc theo ví", example = "1")
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @Parameter(description = "Lọc theo loại giao dịch", example = "EXPENSE")
            @RequestParam(required = false)
            @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME")
            String type) {

        String username = authentication.getName();
        MonthlyReportDetailResponse report = reportService.getMonthlyReport(username, period, walletId, type);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/transactions")
    @Operation(summary = "Lấy giao dịch theo khoảng thời gian")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransactionResponse.class)))),
            @ApiResponse(responseCode = "400", description = "Query param không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập ví", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<TransactionResponse>> getFilteredTransactions(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "Thời gian bắt đầu (ISO-8601)", example = "2026-03-01T00:00:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Thời gian kết thúc (ISO-8601)", example = "2026-03-31T23:59:59")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Lọc theo ví", example = "1")
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @Parameter(description = "Lọc theo loại giao dịch", example = "EXPENSE")
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
    @Operation(summary = "Lấy báo cáo tháng hiện tại")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(schema = @Schema(implementation = MonthlyReportDetailResponse.class))),
            @ApiResponse(responseCode = "400", description = "Query param không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập ví", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<MonthlyReportDetailResponse> getCurrentMonthReport(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "Lọc theo ví", example = "1")
            @RequestParam(required = false) @Positive(message = "walletId must be positive") Long walletId,
            @Parameter(description = "Lọc theo loại giao dịch", example = "EXPENSE")
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
