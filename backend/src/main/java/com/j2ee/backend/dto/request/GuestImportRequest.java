package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload import du lieu guest local len backend.")
public class GuestImportRequest {

    @Builder.Default
    private List<GuestImportWalletItem> wallets = new ArrayList<>();

    @Builder.Default
    private List<GuestImportCategoryItem> categories = new ArrayList<>();

    @Builder.Default
    private List<GuestImportTransactionItem> transactions = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Du lieu wallet guest.")
    public static class GuestImportWalletItem {
        private String localId;
        private String name;
        private String currency;
        private BigDecimal initialBalance;
        private BigDecimal balance;
        private Boolean isDefault;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Du lieu category guest.")
    public static class GuestImportCategoryItem {
        private String localId;
        private String name;
        private String type;
        private String icon;
        private Boolean isDefault;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Du lieu transaction guest.")
    public static class GuestImportTransactionItem {
        private String localId;
        private String walletLocalId;
        private String categoryLocalId;
        private BigDecimal amount;
        private String type;
        private String note;
        private LocalDateTime transactionDate;
        private String origin;
        private String voiceText;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
