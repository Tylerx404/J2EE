package com.j2ee.backend.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "USERS")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "USER_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "USERNAME", unique = true, length = 50)
    private String username;

    @Column(name = "EMAIL", unique = true, length = 100)
    private String email;

    @Column(name = "PASSWORD_HASH", length = 255)
    private String passwordHash;

    @Column(name = "FULL_NAME", length = 100)
    private String fullName;

    @Column(name = "AVATAR_URL", length = 255)
    private String avatarUrl;

    @Column(name = "PROVIDER_ID", length = 100, unique = true)
    private String providerId;

    @Column(name = "PROVIDER", length = 50)
    private String provider; // "LOCAL", "GOOGLE", "FACEBOOK", etc.

    @Column(name = "CREATED_AT")
    private java.time.LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Wallet> wallets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> customCategories;
}
