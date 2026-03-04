package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.WalletCreateRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.WalletResponse;
import com.j2ee.backend.service.WalletService;
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

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "API quản lý ví của người dùng.")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;

    /**
     * GET /api/wallets - Lấy tất cả ví của user
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách ví của tôi")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = WalletResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<WalletResponse>> getMyWallets(@Parameter(hidden = true) Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.getMyWallets(username));
    }

    /**
     * GET /api/wallets/{id} - Lấy thông tin 1 ví
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một ví")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(schema = @Schema(implementation = WalletResponse.class))),
            @ApiResponse(responseCode = "400", description = "ID không hợp lệ hoặc không tìm thấy ví", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<WalletResponse> getWallet(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID ví", example = "1")
            @PathVariable Long id) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.getWallet(username, id));
    }

    /**
     * POST /api/wallets - Tạo ví mới
     */
    @PostMapping
    @Operation(summary = "Tạo ví mới")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tạo ví thành công", content = @Content(schema = @Schema(implementation = WalletResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<WalletResponse> createWallet(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody WalletCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(walletService.createWallet(username, request));
    }

    /**
     * DELETE /api/wallets/{id} - Xóa ví
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ví")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa ví thành công"),
            @ApiResponse(responseCode = "400", description = "Không thể xóa ví hoặc ID không hợp lệ", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteWallet(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID ví", example = "1")
            @PathVariable Long id) {
        String username = authentication.getName();
        walletService.deleteWallet(username, id);
        return ResponseEntity.noContent().build();
    }
}
