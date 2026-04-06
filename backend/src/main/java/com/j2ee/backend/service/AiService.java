package com.j2ee.backend.service;

import com.j2ee.backend.entity.AiAdviceLog;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.AiAdviceLogRepository;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.repository.WalletRepository;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiService {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(?<![a-z])(\\d{1,3}(?:[.,\\s]\\d{3})+|\\d+(?:[.,]\\d+)?)\\s*(ty|trieu|tr|cu|nghin|ngan|k|x)?(?![a-z])", Pattern.CASE_INSENSITIVE);

    private static final String[] INCOME_KEYWORDS = {
            "thu", "nhan", "luong", "thuong", "duoc cho", "duoc tang", "chuyen khoan vao",
            "ve tai khoan", "hoan tien", "ban duoc", "kiem duoc", "co tien vao", "tien ve"
    };

    private static final String[] EXPENSE_KEYWORDS = {
            "chi", "tieu", "mua", "tra", "an", "uong", "sang", "trua", "toi", "cafe", "ca phe",
            "tra sua", "dong tien", "thanh toan", "mat tien", "ton tien", "het", "chi het"
    };

    private final AiAdviceLogRepository aiAdviceLogRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public AiAdviceLog generateAdvice(String username, LocalDateTime startDate, LocalDateTime endDate, Long walletId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User khong ton tai!"));

        List<Transaction> transactions = getTransactions(user.getId(), startDate, endDate, walletId);
        BigDecimal totalIncome = sumByType(transactions, "INCOME");
        BigDecimal totalExpense = sumByType(transactions, "EXPENSE");

        String advice = buildAdviceText(transactions, totalIncome, totalExpense, startDate, endDate, walletId);
        String period = startDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        AiAdviceLog log = AiAdviceLog.builder()
                .user(user)
                .adviceText(advice)
                .period(period)
                .generatedAt(LocalDateTime.now())
                .build();

        return aiAdviceLogRepository.save(log);
    }

    public List<AiAdviceLog> getAdviceHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User khong ton tai!"));

        return aiAdviceLogRepository.findByUserIdOrderByGeneratedAtDesc(user.getId());
    }

    private List<Transaction> getTransactions(Long userId, LocalDateTime startDate, LocalDateTime endDate, Long walletId) {
        if (walletId != null && !walletRepository.existsByIdAndUserId(walletId, userId)) {
            throw new AccessDeniedException("Ban khong co quyen truy cap wallet nay!");
        }

        return transactionRepository.findByUserIdAndDateRangeWithFilters(userId, startDate, endDate, walletId, null);
    }

    private BigDecimal sumByType(List<Transaction> transactions, String type) {
        return transactions.stream()
                .filter(t -> type.equals(t.getType()))
                .map(Transaction::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String buildAdviceText(List<Transaction> transactions,
                                   BigDecimal income,
                                   BigDecimal expense,
                                   LocalDateTime startDate,
                                   LocalDateTime endDate,
                                   Long walletId) {
        StringBuilder advice = new StringBuilder();
        String periodLabel = startDate.format(DateTimeFormatter.ofPattern("MM/yyyy"));
        BigDecimal balance = income.subtract(expense);
        List<Transaction> expenseTransactions = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .toList();
        List<Transaction> incomeTransactions = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .toList();
        String scopeLabel = walletId == null ? "Tat ca vi" : "Vi duoc chon";

        advice.append("PHAN TICH TAI CHINH ").append(periodLabel).append(" (").append(scopeLabel).append("):\n\n");
        advice.append("Tong thu nhap: ").append(formatCurrency(income)).append("\n");
        advice.append("Tong chi tieu: ").append(formatCurrency(expense)).append("\n");
        advice.append("Can doi: ").append(formatSignedCurrency(balance)).append("\n");
        advice.append("So giao dich: ").append(transactions.size()).append("\n\n");

        if (transactions.isEmpty()) {
            advice.append("Chua co giao dich nao trong pham vi bao cao nay nen AI chua du du lieu de phan tich. ");
            advice.append("Ban hay ghi nhan it nhat mot khoan thu hoac chi de nhan goi y sat hon.\n\n");
            advice.append("GOI Y:\n");
            advice.append("- Ghi lai cac khoan chi co dinh nhu an uong, di chuyen, hoa don.\n");
            advice.append("- Neu co thu nhap dinh ky, hay them de he thong danh gia ty le tiet kiem chinh xac hon.\n");
            return advice.toString();
        }

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savingRate = balance.max(BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(income, 1, RoundingMode.HALF_UP);
            advice.append("Ty le tiet kiem uoc tinh: ").append(savingRate.stripTrailingZeros().toPlainString()).append("% thu nhap.\n");
        } else if (expense.compareTo(BigDecimal.ZERO) > 0) {
            advice.append("Ky nay chua ghi nhan thu nhap, vi vay toan bo chi tieu dang lam giam so du.\n");
        }

        if (!expenseTransactions.isEmpty()) {
            Transaction largestExpense = expenseTransactions.stream()
                    .max(Comparator.comparing(Transaction::getAmount))
                    .orElse(null);
            if (largestExpense != null) {
                advice.append("Khoan chi lon nhat: ")
                        .append(resolveTransactionLabel(largestExpense))
                        .append(" - ")
                        .append(formatCurrency(largestExpense.getAmount()))
                        .append(".\n");
            }
        }

        if (!incomeTransactions.isEmpty()) {
            Transaction largestIncome = incomeTransactions.stream()
                    .max(Comparator.comparing(Transaction::getAmount))
                    .orElse(null);
            if (largestIncome != null) {
                advice.append("Khoan thu lon nhat: ")
                        .append(resolveTransactionLabel(largestIncome))
                        .append(" - ")
                        .append(formatCurrency(largestIncome.getAmount()))
                        .append(".\n");
            }
        }

        long daysInPeriod = Math.max(1, java.time.Duration.between(startDate, endDate).toDays() + 1);
        BigDecimal averageExpensePerDay = expense.divide(BigDecimal.valueOf(daysInPeriod), 0, RoundingMode.HALF_UP);
        advice.append("Chi tieu trung binh moi ngay: ").append(formatCurrency(averageExpensePerDay)).append(".\n\n");

        advice.append("GOI Y:\n");
        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            advice.append("- Chi tieu dang vuot thu nhap ").append(formatCurrency(balance.abs())).append(", ban nen uu tien cat cac khoan khong thiet yeu.\n");
            advice.append("- Tap trung xem lai khoan chi lon nhat trong ky vi day thuong la diem toi uu nhanh nhat.\n");
            if (income.compareTo(BigDecimal.ZERO) > 0) {
                advice.append("- Thu muc tieu dua tong chi tieu ve duoi ")
                        .append(formatCurrency(income))
                        .append(" trong thang toi de can bang lai dong tien.\n");
            }
        } else if (balance.compareTo(BigDecimal.ZERO) == 0) {
            advice.append("- Thu chi dang vua du, ban nen dat muc tieu tiet kiem toi thieu 10% thu nhap o ky tiep theo.\n");
            advice.append("- Co the tach rieng mot vi hoac mot nhom giao dich cho quy du phong de de theo doi hon.\n");
        } else {
            BigDecimal safeBuffer = income.multiply(BigDecimal.valueOf(0.2)).setScale(0, RoundingMode.HALF_UP);
            advice.append("- Ban dang du ").append(formatCurrency(balance)).append(", co the trich truoc it nhat ")
                    .append(formatCurrency(safeBuffer))
                    .append(" vao quy du phong hoac muc tieu tiet kiem.\n");
            advice.append("- Duy tri nhom chi tieu on dinh va theo doi xem khoan chi lon nhat co lap lai qua nhieu khong.\n");
        }

        if (transactions.size() >= 20) {
            advice.append("- So giao dich kha nhieu trong ky, ban nen gan category day du de bao cao thang sau chinh xac hon.\n");
        } else {
            advice.append("- Du lieu giao dich trong ky con it, cang ghi day du thi goi y AI thang sau se cang sat hon.\n");
        }

        return advice.toString();
    }

    private String resolveTransactionLabel(Transaction transaction) {
        if (transaction.getCategory() != null && transaction.getCategory().getName() != null && !transaction.getCategory().getName().isBlank()) {
            return transaction.getCategory().getName();
        }
        if (transaction.getNote() != null && !transaction.getNote().isBlank()) {
            return transaction.getNote().trim();
        }
        return "Khong ro hang muc";
    }

    private String formatCurrency(BigDecimal amount) {
        return String.format(Locale.US, "%,.0f VND", amount);
    }

    private String formatSignedCurrency(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            return "+" + formatCurrency(amount);
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            return "-" + formatCurrency(amount.abs());
        }
        return formatCurrency(BigDecimal.ZERO);
    }

    public VoiceTransactionData parseVoiceInput(String voiceText) {
        String normalizedText = normalizeText(voiceText);
        VoiceTransactionData data = new VoiceTransactionData();
        data.setType(detectTransactionType(normalizedText));
        data.setAmount(extractAmount(normalizedText));
        data.setNote(voiceText);
        return data;
    }

    private String detectTransactionType(String normalizedText) {
        int incomeScore = countKeywordMatches(normalizedText, INCOME_KEYWORDS);
        int expenseScore = countKeywordMatches(normalizedText, EXPENSE_KEYWORDS);

        if (incomeScore > expenseScore) {
            return "INCOME";
        }
        return "EXPENSE";
    }

    private int countKeywordMatches(String normalizedText, String[] keywords) {
        int score = 0;
        for (String keyword : keywords) {
            if (containsKeyword(normalizedText, keyword)) {
                score++;
            }
        }
        return score;
    }

    private boolean containsKeyword(String normalizedText, String keyword) {
        String escapedKeyword = Pattern.quote(keyword.trim());
        Pattern keywordPattern = Pattern.compile("(?<![a-z])" + escapedKeyword + "(?![a-z])");
        return keywordPattern.matcher(normalizedText).find();
    }

    private BigDecimal extractAmount(String normalizedText) {
        Matcher matcher = AMOUNT_PATTERN.matcher(normalizedText);
        while (matcher.find()) {
            BigDecimal amount = parseNumericValue(matcher.group(1));
            if (amount == null) {
                continue;
            }
            return amount.multiply(resolveMultiplier(matcher.group(2))).stripTrailingZeros();
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal parseNumericValue(String rawNumber) {
        if (rawNumber == null || rawNumber.isBlank()) {
            return null;
        }

        String compact = rawNumber.replaceAll("\\s+", "");
        if (compact.contains(",") && compact.contains(".")) {
            compact = compact.replace(",", "").replace(".", "");
            return new BigDecimal(compact);
        }

        if (compact.contains(",") || compact.contains(".")) {
            char separator = compact.contains(",") ? ',' : '.';
            int separatorIndex = compact.lastIndexOf(separator);
            int digitsAfterSeparator = compact.length() - separatorIndex - 1;
            long separatorCount = compact.chars().filter(ch -> ch == separator).count();
            if (digitsAfterSeparator == 3 && separatorCount >= 1) {
                compact = compact.replace(String.valueOf(separator), "");
            } else {
                compact = compact.replace(',', '.');
            }
        }

        return new BigDecimal(compact);
    }

    private BigDecimal resolveMultiplier(String rawUnit) {
        if (rawUnit == null || rawUnit.isBlank()) {
            return BigDecimal.ONE;
        }

        return switch (rawUnit) {
            case "k", "nghin", "ngan", "x", "cu" -> new BigDecimal("1000");
            case "tr", "trieu" -> new BigDecimal("1000000");
            case "ty" -> new BigDecimal("1000000000");
            default -> BigDecimal.ONE;
        };
    }

    private String normalizeText(String input) {
        if (input == null) {
            return "";
        }
        String lower = input.toLowerCase(Locale.ROOT).trim();
        String withoutAccent = Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('d', 'd');
        return withoutAccent.replaceAll("\\s+", " ");
    }

    @lombok.Data
    @Schema(name = "VoiceTransactionData", description = "Ket qua phan tich giao dich tu voice text.")
    public static class VoiceTransactionData {
        @Schema(description = "Loai giao dich duoc nhan dien.", allowableValues = { "INCOME", "EXPENSE" }, example = "EXPENSE")
        private String type;

        @Schema(description = "So tien duoc nhan dien.", example = "50000")
        private BigDecimal amount;

        @Schema(description = "Noi dung ghi chu giu nguyen tu voice text.", example = "Chi 50 nghin tien cafe")
        private String note;

        @Schema(description = "Category goi y (co the null).", example = "10")
        private Long categoryId;
    }
}
