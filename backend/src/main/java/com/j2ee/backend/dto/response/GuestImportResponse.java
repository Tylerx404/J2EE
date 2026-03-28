package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Ket qua import du lieu guest local.")
public class GuestImportResponse {

    @Builder.Default
    private ImportedCounts importedCounts = ImportedCounts.builder().build();

    @Builder.Default
    private Map<String, Long> walletMap = new LinkedHashMap<>();

    @Builder.Default
    private Map<String, Long> categoryMap = new LinkedHashMap<>();

    @Builder.Default
    private Map<String, Long> transactionMap = new LinkedHashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedCounts {
        @Builder.Default
        private int walletsCreated = 0;
        @Builder.Default
        private int walletsReused = 0;
        @Builder.Default
        private int categoriesCreated = 0;
        @Builder.Default
        private int categoriesReused = 0;
        @Builder.Default
        private int transactionsCreated = 0;
        @Builder.Default
        private int transactionsReused = 0;
    }
}
