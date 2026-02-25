package com.j2ee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACTIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "common_seq")
    @SequenceGenerator(name = "common_seq", sequenceName = "COMMON_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WALLET_ID", nullable = false)
    private Wallet wallet;

    @Column(name = "AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount; // luôn positive

    @Column(name = "TYPE", nullable = false, length = 20)
    private String type; // "EXPENSE" hoặc "INCOME"

    @ManyToOne
    @JoinColumn(name = "CATEGORY_ID")
    private Category category;

    @Column(name = "NOTE")
    @Lob // CLOB cho text dài
    private String note; // ví dụ "Ăn sáng"

    @Column(name = "TRANSACTION_DATE", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "CREATED_AT")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "VOICE_TEXT", length = 4000)
    private String voiceText; // lưu câu nói gốc từ voice

    @Column(name = "AI_RAW_RESPONSE")
    @Lob // CLOB
    private String aiRawResponse; // JSON thô từ GPT để debug
}