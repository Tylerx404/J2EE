package com.j2ee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "CATEGORIES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "common_seq")
    @SequenceGenerator(name = "common_seq", sequenceName = "COMMON_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name; // "Ăn uống", "Di chuyển", "Trà sữa"...

    @Column(name = "TYPE", nullable = false, length = 20)
    private String type; // "EXPENSE" hoặc "INCOME"

    @Column(name = "ICON", length = 50)
    private String icon;

    @Column(name = "IS_DEFAULT")
    @Builder.Default
    private Boolean isDefault = true; // true nếu category mặc định của hệ thống

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private User user; // null nếu là default, không null nếu custom của user

    @OneToMany(mappedBy = "category")
    private List<Transaction> transactions;
}
