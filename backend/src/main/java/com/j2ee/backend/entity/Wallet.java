package com.j2ee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "WALLETS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "common_seq")
    @SequenceGenerator(name = "common_seq", sequenceName = "COMMON_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name; // ví dụ: "Ví chính"

    @Column(name = "INITIAL_BALANCE", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal initialBalance = BigDecimal.ZERO; // Số dư ban đầu do user nhập

    @Column(name = "BALANCE", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO; // Balance hiện tại (lưu sẵn để query nhanh)

    @Column(name = "CURRENCY", length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "CREATED_AT")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions;
}
