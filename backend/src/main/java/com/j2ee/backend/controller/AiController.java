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
@Tag(name = "AI", description = "API tao advice va parse giao dich tu voice text.")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiService aiService;

    @PostMapping("/advice/generate")
    @Operation(summary = "Sinh loi khuyen AI theo ky bao cao")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sinh loi khuyen thanh cong", content = @Content(schema = @Schema(implementation = AiAdviceResponse.class))),
            @ApiResponse(responseCode = "400", description = "Du lieu khong hop le", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chua xac thuc", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Loi he thong", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<AiAdviceResponse> generateAdvice(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody(required = false) AiGenerateAdviceRequest request) {
        String username = authentication.getName();
        String period = (request != null && request.period() != null)
                ? request.period()
                : YearMonth.now().toString();
        Long walletId = request != null ? request.walletId() : null;

        YearMonth yearMonth = YearMonth.parse(period);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        AiAdviceLog advice = aiService.generateAdvice(username, startDate, endDate, walletId);
        return ResponseEntity.ok(toResponse(advice));
    }

    @GetMapping("/advice/history")
    @Operation(summary = "Lay lich su loi khuyen AI")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lay du lieu thanh cong", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AiAdviceResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Chua xac thuc", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Loi he thong", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<AiAdviceResponse>> getAdviceHistory(
            @Parameter(hidden = true) Authentication authentication) {
        String username = authentication.getName();
        List<AiAdviceLog> history = aiService.getAdviceHistory(username);
        return ResponseEntity.ok(history.stream().map(this::toResponse).toList());
    }

    @PostMapping("/voice/parse")
    @Operation(summary = "Parse giao dich tu voice text", description = "Hien tai parse theo rule don gian tu truong voiceText.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parse thanh cong", content = @Content(schema = @Schema(implementation = AiService.VoiceTransactionData.class))),
            @ApiResponse(responseCode = "400", description = "Du lieu khong hop le", content = @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chua xac thuc", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Loi he thong", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
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
