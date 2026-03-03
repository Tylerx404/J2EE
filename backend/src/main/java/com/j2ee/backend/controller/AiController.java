package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.AiGenerateAdviceRequest;
import com.j2ee.backend.dto.request.VoiceParseRequest;
import com.j2ee.backend.dto.response.AiAdviceResponse;
import com.j2ee.backend.entity.AiAdviceLog;
import com.j2ee.backend.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/advice/generate")
    public ResponseEntity<AiAdviceResponse> generateAdvice(
            Authentication authentication,
            @Valid @RequestBody(required = false) AiGenerateAdviceRequest request) {
        String username = authentication.getName();
        String period = (request != null && request.period() != null)
                ? request.period()
                : YearMonth.now().toString();

        YearMonth yearMonth = YearMonth.parse(period);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        AiAdviceLog advice = aiService.generateAdvice(username, startDate, endDate);
        return ResponseEntity.ok(toResponse(advice));
    }

    @GetMapping("/advice/history")
    public ResponseEntity<List<AiAdviceResponse>> getAdviceHistory(Authentication authentication) {
        String username = authentication.getName();
        List<AiAdviceLog> history = aiService.getAdviceHistory(username);
        return ResponseEntity.ok(history.stream().map(this::toResponse).toList());
    }

    @PostMapping("/voice/parse")
    public ResponseEntity<AiService.VoiceTransactionData> parseVoiceInput(
            @Valid @RequestBody VoiceParseRequest request) {
        AiService.VoiceTransactionData data = aiService.parseVoiceInput(request.voiceText());
        return ResponseEntity.ok(data);
    }

    private AiAdviceResponse toResponse(AiAdviceLog log) {
        return AiAdviceResponse.builder()
                .id(log.getId())
                .adviceText(log.getAdviceText())
                .generatedAt(log.getGeneratedAt())
                .period(log.getPeriod())
                .build();
    }
}
