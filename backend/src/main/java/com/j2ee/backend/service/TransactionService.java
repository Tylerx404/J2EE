package com.j2ee.backend.service;

import com.j2ee.backend.dto.request.TransactionCreateRequest;
import com.j2ee.backend.dto.response.TransactionResponse;
import com.j2ee.backend.entity.Category;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.entity.Wallet;
import com.j2ee.backend.repository.CategoryRepository;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    /**
     * Tạo transaction mới (thủ công)
     */
    @Transactional
    public TransactionResponse createTransaction(String username, TransactionCreateRequest request) {
        // Validate user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Validate wallet thuộc về user
        Wallet wallet = walletRepository.findByIdAndUserId(request.getWalletId(), user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet không tồn tại hoặc không thuộc về bạn!"));

        // Validate category (nếu có)
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại!"));
        }

        // Validate type
        if (!"EXPENSE".equals(request.getType()) && !"INCOME".equals(request.getType())) {
            throw new IllegalArgumentException("Type phải là EXPENSE hoặc INCOME!");
        }

        // Tạo transaction
        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .category(category)
                .amount(request.getAmount())
                .type(request.getType())
                .note(request.getNote())
                .transactionDate(
                        request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now())
                .build();

        transaction = transactionRepository.save(transaction);

        // Cập nhật balance của wallet
        walletService.updateBalance(wallet.getId(), request.getAmount(), request.getType());

        return toResponse(transaction);
    }

    /**
     * Lấy tất cả transactions của user
     */
    public List<TransactionResponse> getMyTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy transactions theo wallet
     */
    public List<TransactionResponse> getTransactionsByWallet(String username, Long walletId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Validate wallet thuộc về user
        if (!walletRepository.existsByIdAndUserId(walletId, user.getId())) {
            throw new IllegalArgumentException("Wallet không tồn tại hoặc không thuộc về bạn!");
        }

        return transactionRepository.findByWalletIdOrderByTransactionDateDesc(walletId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Xóa transaction và rollback balance
     */
    @Transactional
    public void deleteTransaction(String username, Long transactionId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction không tồn tại!"));

        // Kiểm tra transaction thuộc về user
        if (!transaction.getWallet().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Transaction không thuộc về bạn!");
        }

        // Rollback balance (đảo ngược type)
        String reverseType = "EXPENSE".equals(transaction.getType()) ? "INCOME" : "EXPENSE";
        walletService.updateBalance(transaction.getWallet().getId(), transaction.getAmount(), reverseType);

        transactionRepository.delete(transaction);
    }

    private TransactionResponse toResponse(Transaction transaction) {
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
