package com.j2ee.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletCreateRequest {
    @NotBlank(message = "Wallet name must not be blank")
    @Size(max = 100, message = "Wallet name must be at most 100 characters")
    private String name;

    @PositiveOrZero(message = "Initial balance must be >= 0")
    private BigDecimal initialBalance;

    @Pattern(regexp = "(?i)^[A-Z]{3}$", message = "Currency must be a 3-letter code, e.g. VND, USD")
    private String currency;
}
