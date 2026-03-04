package com.j2ee.backend.service;

import com.j2ee.backend.entity.AiAdviceLog;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.AiAdviceLogRepository;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * AiService - Xử lý logic liên quan đến AI advice
 * Tích hợp với AI để đưa ra lời khuyên tài chính dựa trên chi tiêu của user
 */
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiAdviceLogRepository aiAdviceLogRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Tạo lời khuyên AI dựa trên dữ liệu chi tiêu trong khoảng thời gian
     * (Giả lập - trong thực tế sẽ gọi API AI thật như OpenAI, Gemini, v.v.)
     */
    @Transactional
    public AiAdviceLog generateAdvice(String username, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Lấy transactions trong khoảng thời gian
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(user.getId(), startDate,
                endDate);

        // Tính tổng thu chi
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tạo lời khuyên (giả lập - trong thực tế gọi AI API)
        String advice = buildAdviceText(totalIncome, totalExpense, transactions.size());

        String period = startDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Lưu vào DB
        AiAdviceLog log = AiAdviceLog.builder()
                .user(user)
                .adviceText(advice)
                .period(period)
                .generatedAt(LocalDateTime.now())
                .build();

        return aiAdviceLogRepository.save(log);
    }

    /**
     * Lấy lịch sử lời khuyên AI của user
     */
    public List<AiAdviceLog> getAdviceHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        return aiAdviceLogRepository.findByUserIdOrderByGeneratedAtDesc(user.getId());
    }

    /**
     * Xây dựng text lời khuyên (giả lập AI)
     * Trong thực tế, sẽ gọi API AI với prompt phức tạp hơn
     */
    private String buildAdviceText(BigDecimal income, BigDecimal expense, int transactionCount) {
        StringBuilder advice = new StringBuilder();
        advice.append("📊 PHÂN TÍCH TÀI CHÍNH CỦA BẠN:\n\n");
        advice.append(String.format("💰 Tổng thu nhập: %,.0f VNĐ\n", income));
        advice.append(String.format("💸 Tổng chi tiêu: %,.0f VNĐ\n", expense));
        advice.append(String.format("📝 Số giao dịch: %d\n\n", transactionCount));

        BigDecimal balance = income.subtract(expense);
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            advice.append("✅ Tuyệt vời! Bạn đang tiết kiệm được ");
            advice.append(String.format("%,.0f VNĐ.\n\n", balance));
            advice.append("💡 LỜI KHUYÊN:\n");
            advice.append("- Hãy duy trì thói quen chi tiêu hợp lý này\n");
            advice.append("- Cân nhắc đầu tư số tiền tiết kiệm được\n");
        } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
            advice.append("⚠️ Cảnh báo! Chi tiêu vượt thu nhập ");
            advice.append(String.format("%,.0f VNĐ.\n\n", balance.abs()));
            advice.append("💡 LỜI KHUYÊN:\n");
            advice.append("- Cần cắt giảm chi phí không cần thiết\n");
            advice.append("- Xem xét các khoản chi lớn và tối ưu hóa\n");
            advice.append("- Lập kế hoạch ngân sách chi tiết hơn\n");
        } else {
            advice.append("⚖️ Thu chi cân bằng.\n\n");
            advice.append("💡 LỜI KHUYÊN:\n");
            advice.append("- Hãy cố gắng tiết kiệm ít nhất 10-20% thu nhập\n");
        }

        return advice.toString();
    }

    /**
     * Phân tích giao dịch bằng giọng nói (Voice AI)
     * Input: Text từ speech-to-text (ví dụ: "Chi 50 nghìn tiền cafe")
     * Output: Parsed data để tạo transaction
     */
    public VoiceTransactionData parseVoiceInput(String voiceText) {
        // Giả lập parsing - trong thực tế dùng NLP/AI để parse
        // Ví dụ: "Chi 50 nghìn tiền cafe" -> amount=50000, type=EXPENSE, note="tiền
        // cafe"

        VoiceTransactionData data = new VoiceTransactionData();

        // Simple parsing logic (cần improve bằng AI thật)
        String lowerText = voiceText.toLowerCase();

        if (lowerText.contains("chi") || lowerText.contains("tiêu") || lowerText.contains("mua")) {
            data.setType("EXPENSE");
        } else if (lowerText.contains("thu") || lowerText.contains("nhận") || lowerText.contains("lương")) {
            data.setType("INCOME");
        }

        // Extract số tiền (cần AI parsing thật)
        // Ví dụ đơn giản: tìm số trong text
        String[] words = lowerText.split("\\s+");
        for (String word : words) {
            try {
                // Loại bỏ dấu phẩy, chấm
                String numStr = word.replaceAll("[^0-9]", "");
                if (!numStr.isEmpty()) {
                    data.setAmount(new BigDecimal(numStr).multiply(new BigDecimal("1000"))); // Giả sử đơn vị nghìn
                    break;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        data.setNote(voiceText); // Lưu nguyên text làm note

        return data;
    }

    /**
     * DTO cho dữ liệu transaction từ voice
     */
    @lombok.Data
    @Schema(name = "VoiceTransactionData", description = "Kết quả phân tích giao dịch từ voice text.")
    public static class VoiceTransactionData {
        @Schema(description = "Loại giao dịch được nhận diện.", allowableValues = { "INCOME", "EXPENSE" }, example = "EXPENSE")
        private String type; // INCOME hoặc EXPENSE
        @Schema(description = "Số tiền được nhận diện.", example = "50000")
        private BigDecimal amount;
        @Schema(description = "Nội dung ghi chú giữ nguyên từ voice text.", example = "Chi 50 nghìn tiền cafe")
        private String note;
        @Schema(description = "Category gợi ý (có thể null).", example = "10")
        private Long categoryId; // Optional
    }
}
