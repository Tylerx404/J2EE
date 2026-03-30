package com.j2ee.backend.repository;

import com.j2ee.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
        List<Transaction> findByWalletIdOrderByTransactionDateDesc(Long walletId);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId ORDER BY t.transactionDate DESC")
        List<Transaction> findByUserIdOrderByTransactionDateDesc(@Param("userId") Long userId);

        boolean existsByWalletId(Long walletId);

        // Queries for Reports
        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId " +
                        "AND t.transactionDate >= :startDate AND t.transactionDate < :endDate " +
                        "ORDER BY t.transactionDate DESC")
        List<Transaction> findByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId " +
                        "AND t.transactionDate >= :startDate AND t.transactionDate < :endDate " +
                        "AND t.type = :type " +
                        "ORDER BY t.transactionDate DESC")
        List<Transaction> findByUserIdAndDateRangeAndType(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("type") String type);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.id = :walletId " +
                        "AND t.transactionDate >= :startDate AND t.transactionDate < :endDate " +
                        "ORDER BY t.transactionDate DESC")
        List<Transaction> findByWalletIdAndDateRange(
                        @Param("walletId") Long walletId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId " +
                        "AND t.transactionDate >= :startDate AND t.transactionDate < :endDate " +
                        "AND (:walletId IS NULL OR t.wallet.id = :walletId) " +
                        "AND (:type IS NULL OR t.type = :type) " +
                        "ORDER BY t.transactionDate DESC")
        List<Transaction> findByUserIdAndDateRangeWithFilters(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("walletId") Long walletId,
                        @Param("type") String type);

        // Methods để tính số dư động (dynamic balance calculation)
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.wallet.id = :walletId AND t.type = 'INCOME'")
        java.math.BigDecimal sumIncomeByWallet(@Param("walletId") Long walletId);

        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.wallet.id = :walletId AND t.type = 'EXPENSE'")
        java.math.BigDecimal sumExpenseByWallet(@Param("walletId") Long walletId);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId AND t.sourceLocalId = :sourceLocalId")
        Optional<Transaction> findByUserIdAndSourceLocalId(
                        @Param("userId") Long userId,
                        @Param("sourceLocalId") String sourceLocalId);
}
