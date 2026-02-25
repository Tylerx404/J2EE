package com.j2ee.backend.controller;

import com.j2ee.backend.entity.AiAdviceLog;
import com.j2ee.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

/**
 * AiController - Endpoints cho AI Advice
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /**
     * POST /api/ai/advice/generate - Tạo lời khuyên AI cho một khoảng thời gian
     * Body: { "period": "2026-02" } (optional, default là tháng hiện tại)
     */
    @PostMapping("/advice/generate")
    public ResponseEntity<AiAdviceLog> generateAdvice(
            Authentication authentication,
            @RequestBody(required = false) Map<String, String> request) {
        String username = authentication.getName();

        // Parse period (default là tháng hiện tại)
        String period = (request != null && request.containsKey("period"))
                ? request.get("period")
                : YearMonth.now().toString();

        YearMonth yearMonth = YearMonth.parse(period);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        AiAdviceLog advice = aiService.generateAdvice(username, startDate, endDate);
        return ResponseEntity.ok(advice);
    }

    /**
     * GET /api/ai/advice/history - Lấy lịch sử lời khuyên AI
     */
    @GetMapping("/advice/history")
    public ResponseEntity<List<AiAdviceLog>> getAdviceHistory(Authentication authentication) {
        String username = authentication.getName();
        List<AiAdviceLog> history = aiService.getAdviceHistory(username);
        return ResponseEntity.ok(history);
    }

    /**
     * POST /api/ai/voice/parse - Parse giọng nói thành transaction data
     * Body: { "voiceText": "Chi 50 nghìn tiền cafe" }
     * 
     * Frontend sẽ dùng Speech-to-Text API (Web Speech API hoặc Google Speech)
     * rồi gửi text lên backend để parse
     */
    @PostMapping("/voice/parse")
    public ResponseEntity<AiService.VoiceTransactionData> parseVoiceInput(
            @RequestBody Map<String, String> request) {
        String voiceText = request.get("voiceText");

        if (voiceText == null || voiceText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        AiService.VoiceTransactionData data = aiService.parseVoiceInput(voiceText);
        return ResponseEntity.ok(data);
    }
}
