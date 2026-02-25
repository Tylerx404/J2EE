package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.WalletCreateRequest;
import com.j2ee.backend.dto.response.WalletResponse;
import com.j2ee.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    /**
     * GET /api/wallets - Lấy tất cả ví của user
     */
    @GetMapping
    public ResponseEntity<List<WalletResponse>> getMyWallets(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.getMyWallets(username));
    }

    /**
     * GET /api/wallets/{id} - Lấy thông tin 1 ví
     */
    @GetMapping("/{id}")
    public ResponseEntity<WalletResponse> getWallet(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.getWallet(username, id));
    }

    /**
     * POST /api/wallets - Tạo ví mới
     */
    @PostMapping
    public ResponseEntity<WalletResponse> createWallet(
            Authentication authentication,
            @RequestBody WalletCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.createWallet(username, request));
    }

    /**
     * DELETE /api/wallets/{id} - Xóa ví
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWallet(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        walletService.deleteWallet(username, id);
        return ResponseEntity.noContent().build();
    }
}
