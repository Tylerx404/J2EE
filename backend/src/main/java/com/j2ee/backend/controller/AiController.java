package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.AiGenerateAdviceRequest;
import com.j2ee.backend.dto.request.VoiceParseRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.AiAdviceResponse;
import com.j2ee.backend.entity.AiAdviceLog;
import com.j2ee.backend.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "AI", description = "API tạo advice và parse giao dịch từ voice text.")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiService aiService;

    @PostMapping("/advice/generate")
    @Operation(summary = "Sinh lời khuyên AI theo kỳ báo cáo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sinh lời khuyên thành công", content = @Content(schema = @Schema(implementation = AiAdviceResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<AiAdviceResponse> generateAdvice(
            @Parameter(hidden = true) Authentication authentication,
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
    @Operation(summary = "Lấy lịch sử lời khuyên AI")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AiAdviceResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<AiAdviceResponse>> getAdviceHistory(
            @Parameter(hidden = true) Authentication authentication) {
        String username = authentication.getName();
        List<AiAdviceLog> history = aiService.getAdviceHistory(username);
        return ResponseEntity.ok(history.stream().map(this::toResponse).toList());
    }

    @PostMapping("/voice/parse")
    @Operation(summary = "Parse giao dịch từ voice text", description = "Hiện tại parse theo rule đơn giản từ trường voiceText.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parse thành công", content = @Content(schema = @Schema(implementation = AiService.VoiceTransactionData.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
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
