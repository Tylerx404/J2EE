package com.j2ee.backend.service;

import com.j2ee.backend.dto.request.WalletCreateRequest;
import com.j2ee.backend.dto.response.WalletResponse;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.entity.Wallet;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Tạo ví mặc định cho user mới (gọi từ AuthService)
     */
    @Transactional
    public Wallet createDefaultWallet(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .name("Ví chính")
                .initialBalance(BigDecimal.ZERO)
                .balance(BigDecimal.ZERO)
                .currency("VND")
                .build();
        return walletRepository.save(wallet);
    }

    /**
     * Lấy tất cả ví của user
     */
    public List<WalletResponse> getMyWallets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return walletRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo ví mới
     */
    @Transactional
    public WalletResponse createWallet(String username, WalletCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        BigDecimal initialBalance = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;

        Wallet wallet = Wallet.builder()
                .user(user)
                .name(request.getName())
                .initialBalance(initialBalance) // Số dư ban đầu do user nhập
                .balance(initialBalance) // Balance = initialBalance khi mới tạo
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .build();

        wallet = walletRepository.save(wallet);
        return toResponse(wallet);
    }

    /**
     * Lấy thông tin 1 ví
     */
    public WalletResponse getWallet(String username, Long walletId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet không tồn tại hoặc không thuộc về bạn!"));

        return toResponse(wallet);
    }

    /**
     * Xóa ví (không cho xóa nếu có transaction)
     */
    @Transactional
    public void deleteWallet(String username, Long walletId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet không tồn tại hoặc không thuộc về bạn!"));

        // Kiểm tra xem có transaction nào không
        if (transactionRepository.existsByWalletId(walletId)) {
            throw new IllegalArgumentException("Không thể xóa ví có giao dịch! Vui lòng xóa hết giao dịch trước.");
        }

        walletRepository.delete(wallet);
    }

    /**
     * Update balance của wallet (gọi từ TransactionService)
     */
    @Transactional
    public void updateBalance(Long walletId, BigDecimal amount, String type) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet không tồn tại!"));

        if ("INCOME".equals(type)) {
            wallet.setBalance(wallet.getBalance().add(amount));
        } else if ("EXPENSE".equals(type)) {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        }

        walletRepository.save(wallet);
    }

    /**
     * Tính balance động từ initialBalance + thu - chi (optional, dùng để verify)
     * Công thức: Balance = initialBalance + Tổng INCOME - Tổng EXPENSE
     */
    public BigDecimal getCurrentBalance(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet không tồn tại!"));

        BigDecimal income = transactionRepository.sumIncomeByWallet(walletId);
        BigDecimal expense = transactionRepository.sumExpenseByWallet(walletId);

        return wallet.getInitialBalance().add(income).subtract(expense);
    }

    private WalletResponse toResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .name(wallet.getName())
                .initialBalance(wallet.getInitialBalance())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .createdAt(wallet.getCreatedAt())
                .userId(wallet.getUser().getId())
                .build();
    }
}
