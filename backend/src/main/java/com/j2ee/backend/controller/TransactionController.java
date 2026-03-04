package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.TransactionCreateRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction", description = "API quản lý giao dịch thu/chi.")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * GET /api/transactions - Lấy tất cả transactions của user
     */
    @GetMapping
    @Operation(summary = "Lấy tất cả giao dịch của tôi")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransactionResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(
            @Parameter(hidden = true) Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getMyTransactions(username));
    }

    /**
     * GET /api/transactions/wallet/{walletId} - Lấy transactions theo wallet
     */
    @GetMapping("/wallet/{walletId}")
    @Operation(summary = "Lấy giao dịch theo ví")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransactionResponse.class)))),
            @ApiResponse(responseCode = "400", description = "Wallet không hợp lệ", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<TransactionResponse>> getTransactionsByWallet(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID ví", example = "1")
            @PathVariable Long walletId) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getTransactionsByWallet(username, walletId));
    }

    /**
     * POST /api/transactions - Tạo transaction mới (thủ công)
     */
    @PostMapping
    @Operation(summary = "Tạo giao dịch thủ công")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tạo giao dịch thành công", content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<TransactionResponse> createTransaction(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody TransactionCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.createTransaction(username, request));
    }

    /**
     * DELETE /api/transactions/{id} - Xóa transaction
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giao dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa giao dịch thành công"),
            @ApiResponse(responseCode = "400", description = "Không thể xóa giao dịch hoặc ID không hợp lệ", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteTransaction(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID giao dịch", example = "100")
            @PathVariable Long id) {
        String username = authentication.getName();
        transactionService.deleteTransaction(username, id);
        return ResponseEntity.noContent().build();
    }
}
