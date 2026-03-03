package com.j2ee.backend.service;

import com.j2ee.backend.dto.response.CategoryStatistic;
import com.j2ee.backend.dto.response.MonthlyReportDetailResponse;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    /**
     * Lấy báo cáo tháng chi tiết
     */
    public MonthlyReportDetailResponse getMonthlyReport(String username, String period, Long walletId, String type) {
        // Parse period "2026-02" -> year, month
        String[] parts = period.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Tháng hiện tại
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1);

        // Tháng trước
        LocalDateTime prevStartDate = startDate.minusMonths(1);
        LocalDateTime prevEndDate = startDate;

        // Lấy transactions tháng hiện tại
        List<Transaction> currentTransactions = getTransactions(user.getId(), startDate, endDate, walletId, type);

        // Lấy transactions tháng trước (để so sánh)
        List<Transaction> previousTransactions = getTransactions(user.getId(), prevStartDate, prevEndDate, walletId,
                type);

        // Tính tổng thu/chi tháng hiện tại
        BigDecimal totalIncome = currentTransactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = currentTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpense);

        // Tính tổng tháng trước
        BigDecimal prevIncome = previousTransactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevExpense = previousTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính % thay đổi
        BigDecimal incomeChange = calculatePercentageChange(prevIncome, totalIncome);
        BigDecimal expenseChange = calculatePercentageChange(prevExpense, totalExpense);

        // Thống kê theo category
        List<CategoryStatistic> expenseByCategory = calculateCategoryStatistics(currentTransactions, "EXPENSE");
        List<CategoryStatistic> incomeByCategory = calculateCategoryStatistics(currentTransactions, "INCOME");

        // Top 5
        List<CategoryStatistic> top5Expense = expenseByCategory.stream()
                .limit(5)
                .collect(Collectors.toList());

        List<CategoryStatistic> top5Income = incomeByCategory.stream()
                .limit(5)
                .collect(Collectors.toList());

        return MonthlyReportDetailResponse.builder()
                .month(month)
                .year(year)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .previousMonthIncome(prevIncome)
                .previousMonthExpense(prevExpense)
                .incomeChange(incomeChange)
                .expenseChange(expenseChange)
                .topExpenseCategories(top5Expense)
                .topIncomeCategories(top5Income)
                .expenseByCategoryChart(expenseByCategory)
                .incomeByCategoryChart(incomeByCategory)
                .build();
    }

    /**
     * Lấy transactions theo filter
     */
    private List<Transaction> getTransactions(Long userId, LocalDateTime startDate, LocalDateTime endDate,
            Long walletId, String type) {
        if (walletId != null && !walletRepository.existsByIdAndUserId(walletId, userId)) {
            throw new AccessDeniedException("Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p wallet nÃ y!");
        }

        return transactionRepository.findByUserIdAndDateRangeWithFilters(
                userId, startDate, endDate, walletId, type);
    }

    /**
     * Tính thống kê theo category
     */
    private List<CategoryStatistic> calculateCategoryStatistics(List<Transaction> transactions, String type) {
        Map<Long, List<Transaction>> groupedByCategory = transactions.stream()
                .filter(t -> type.equals(t.getType()))
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getId() : -1L));

        return groupedByCategory.entrySet().stream()
                .map(entry -> {
                    Long categoryId = entry.getKey();
                    List<Transaction> txns = entry.getValue();

                    String categoryName = "Chưa phân loại";
                    if (categoryId != -1L && !txns.isEmpty() && txns.get(0).getCategory() != null) {
                        categoryName = txns.get(0).getCategory().getName();
                    }

                    BigDecimal total = txns.stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return CategoryStatistic.builder()
                            .categoryId(categoryId == -1L ? null : categoryId)
                            .categoryName(categoryName)
                            .type(type)
                            .total(total)
                            .count(txns.size())
                            .build();
                })
                .sorted((a, b) -> b.getTotal().compareTo(a.getTotal())) // Sort by total desc
                .collect(Collectors.toList());
    }

    /**
     * Tính % thay đổi
     */
    private BigDecimal calculatePercentageChange(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.compareTo(BigDecimal.ZERO) == 0) {
            return newValue.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal(100) : BigDecimal.ZERO;
        }

        BigDecimal diff = newValue.subtract(oldValue);
        return diff.divide(oldValue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Lấy danh sách transactions với filter date range
     */
    public List<Transaction> getTransactionsFiltered(String username, LocalDateTime startDate,
            LocalDateTime endDate, Long walletId, String type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return getTransactions(user.getId(), startDate, endDate, walletId, type);
    }
}
