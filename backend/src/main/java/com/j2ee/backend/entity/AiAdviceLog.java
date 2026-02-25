package com.j2ee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AI_ADVICE_LOGS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAdviceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "common_seq")
    @SequenceGenerator(name = "common_seq", sequenceName = "COMMON_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "ADVICE_TEXT")
    @Lob
    private String adviceText;

    @Column(name = "GENERATED_AT")
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "PERIOD", length = 20)
    private String period; // ví dụ "2026-02"
}
