package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin ví.")
public class WalletResponse {
    @Schema(description = "ID ví.", example = "1")
    private Long id;
    @Schema(description = "Tên ví.", example = "Ví chính")
    private String name;
    @Schema(description = "Số dư ban đầu.", example = "0")
    private BigDecimal initialBalance; // Số dư ban đầu
    @Schema(description = "Số dư hiện tại.", example = "3500000")
    private BigDecimal balance; // Số dư hiện tại
    @Schema(description = "Mã tiền tệ.", example = "VND")
    private String currency;
    @Schema(description = "Thời điểm tạo ví.", example = "2026-03-01T10:05:00")
    private LocalDateTime createdAt;
    @Schema(description = "ID user sở hữu ví.", example = "1")
    private Long userId;
}
