package com.j2ee.backend.service;

import com.j2ee.backend.entity.Category;
import com.j2ee.backend.entity.Transaction;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiServiceTest {

    private final AiService aiService = new AiService(null, null, null, null);

    @Test
    void shouldKeepPlainNumberAmountWithoutMultiplyingByThousand() {
        AiService.VoiceTransactionData result = aiService.parseVoiceInput("Nay toi an sang 50000");

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(result.getType()).isEqualTo("EXPENSE");
    }

    @Test
    void shouldConvertThousandUnitExpressions() {
        AiService.VoiceTransactionData result = aiService.parseVoiceInput("Chi cafe 50k");

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(result.getType()).isEqualTo("EXPENSE");
    }

    @Test
    void shouldDetectIncomeFromSalaryPhrase() {
        AiService.VoiceTransactionData result = aiService.parseVoiceInput("Hom nay nhan luong 15 trieu");

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("15000000"));
        assertThat(result.getType()).isEqualTo("INCOME");
    }

    @Test
    void shouldPreferExpenseWhenFoodContextAppears() {
        AiService.VoiceTransactionData result = aiService.parseVoiceInput("Toi vua mua do an 120000");

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("120000"));
        assertThat(result.getType()).isEqualTo("EXPENSE");
    }

    @Test
    void shouldExplainWhenNoTransactionsExist() throws Exception {
        String advice = invokeBuildAdviceText(List.of(), BigDecimal.ZERO, BigDecimal.ZERO, null);

        assertThat(advice).contains("Chua co giao dich nao trong pham vi bao cao nay");
        assertThat(advice).contains("GOI Y:");
    }

    @Test
    void shouldHighlightOverspendingAndLargestExpense() throws Exception {
        Transaction rent = buildTransaction("EXPENSE", "4500000", "Tien nha", "Nha o");
        Transaction food = buildTransaction("EXPENSE", "800000", "An uong", "An uong");
        Transaction salary = buildTransaction("INCOME", "4000000", "Luong", "Luong");

        String advice = invokeBuildAdviceText(List.of(rent, food, salary), new BigDecimal("4000000"), new BigDecimal("5300000"), null);

        assertThat(advice).contains("Chi tieu dang vuot thu nhap");
        assertThat(advice).contains("Khoan chi lon nhat: Nha o - 4,500,000 VND");
        assertThat(advice).contains("Thu muc tieu dua tong chi tieu ve duoi 4,000,000 VND");
    }

    @Test
    void shouldSuggestSavingWhenBalanceIsPositive() throws Exception {
        Transaction salary = buildTransaction("INCOME", "12000000", "Luong thang", "Luong");
        Transaction freelance = buildTransaction("INCOME", "3000000", "Freelance", "Freelance");
        Transaction travel = buildTransaction("EXPENSE", "2000000", "Di chuyen", "Di chuyen");

        String advice = invokeBuildAdviceText(List.of(salary, freelance, travel), new BigDecimal("15000000"), new BigDecimal("2000000"), null);

        assertThat(advice).contains("Ty le tiet kiem uoc tinh");
        assertThat(advice).contains("Khoan thu lon nhat: Luong - 12,000,000 VND");
        assertThat(advice).contains("Ban dang du 13,000,000 VND");
    }

    @Test
    void shouldMentionWalletScopeWhenFilteringSingleWallet() throws Exception {
        Transaction salary = buildTransaction("INCOME", "5000000", "Luong", "Luong");

        String advice = invokeBuildAdviceText(List.of(salary), new BigDecimal("5000000"), BigDecimal.ZERO, 99L);

        assertThat(advice).contains("Vi duoc chon");
    }

    private String invokeBuildAdviceText(List<Transaction> transactions, BigDecimal income, BigDecimal expense, Long walletId) throws Exception {
        Method method = AiService.class.getDeclaredMethod(
                "buildAdviceText",
                List.class,
                BigDecimal.class,
                BigDecimal.class,
                LocalDateTime.class,
                LocalDateTime.class,
                Long.class
        );
        method.setAccessible(true);
        return (String) method.invoke(
                aiService,
                transactions,
                income,
                expense,
                LocalDateTime.of(2026, 4, 1, 0, 0),
                LocalDateTime.of(2026, 4, 30, 23, 59, 59),
                walletId
        );
    }

    private Transaction buildTransaction(String type, String amount, String note, String categoryName) {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setNote(note);
        transaction.setTransactionDate(LocalDateTime.of(2026, 4, 10, 8, 0));

        if (categoryName != null) {
            Category category = new Category();
            category.setName(categoryName);
            transaction.setCategory(category);
        }
        return transaction;
    }
}
