package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.TransactionCreateRequest;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * GET /api/transactions - Lấy tất cả transactions của user
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getMyTransactions(username));
    }

    /**
     * GET /api/transactions/wallet/{walletId} - Lấy transactions theo wallet
     */
    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByWallet(
            Authentication authentication,
            @PathVariable Long walletId) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getTransactionsByWallet(username, walletId));
    }

    /**
     * POST /api/transactions - Tạo transaction mới (thủ công)
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            Authentication authentication,
            @RequestBody TransactionCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.createTransaction(username, request));
    }

    /**
     * DELETE /api/transactions/{id} - Xóa transaction
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        transactionService.deleteTransaction(username, id);
        return ResponseEntity.noContent().build();
    }
}
