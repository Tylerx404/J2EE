package com.j2ee.backend.service;

import com.j2ee.backend.dto.request.GuestImportRequest;
import com.j2ee.backend.dto.response.GuestImportResponse;
import com.j2ee.backend.entity.Category;
import com.j2ee.backend.entity.Transaction;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.entity.Wallet;
import com.j2ee.backend.repository.CategoryRepository;
import com.j2ee.backend.repository.TransactionRepository;
import com.j2ee.backend.repository.UserRepository;
import com.j2ee.backend.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuestImportServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private GuestImportService guestImportService;

    @Test
    void shouldMergeGuestDefaultWalletIntoExistingBackendDefaultWallet() {
        User user = user(10L, "guest-user");
        Wallet backendDefaultWallet = wallet(20L, user, "Ví chính", "VND", BigDecimal.ZERO);

        when(userRepository.findByUsername("guest-user")).thenReturn(Optional.of(user));
        when(walletRepository.findFirstByUserIdAndSourceLocalId(10L, "wallet-local-1")).thenReturn(Optional.empty());
        when(walletRepository.findByUserId(10L)).thenReturn(List.of(backendDefaultWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GuestImportRequest request = GuestImportRequest.builder()
                .wallets(List.of(GuestImportRequest.GuestImportWalletItem.builder()
                        .localId("wallet-local-1")
                        .name("Vi chinh")
                        .currency("VND")
                        .initialBalance(BigDecimal.ZERO)
                        .isDefault(true)
                        .createdAt(LocalDateTime.of(2026, 3, 28, 9, 0))
                        .build()))
                .build();

        GuestImportResponse response = guestImportService.importGuestData("guest-user", request);

        assertThat(response.getWalletMap()).containsEntry("wallet-local-1", 20L);
        assertThat(response.getImportedCounts().getWalletsCreated()).isZero();
        assertThat(response.getImportedCounts().getWalletsReused()).isEqualTo(1);
        assertThat(backendDefaultWallet.getSourceLocalId()).isEqualTo("wallet-local-1");
        verify(walletRepository).save(backendDefaultWallet);
    }

    @Test
    void shouldReuseExistingDefaultCategoryByNormalizedNameAndType() {
        User user = user(10L, "guest-user");
        Category defaultCategory = defaultCategory(30L, "Ăn uống", "EXPENSE", "restaurant");

        when(userRepository.findByUsername("guest-user")).thenReturn(Optional.of(user));
        when(categoryRepository.findFirstByUserIdAndSourceLocalId(10L, "category-local-1")).thenReturn(Optional.empty());
        when(categoryRepository.findByIsDefaultTrue()).thenReturn(List.of(defaultCategory));

        GuestImportRequest request = GuestImportRequest.builder()
                .categories(List.of(GuestImportRequest.GuestImportCategoryItem.builder()
                        .localId("category-local-1")
                        .name("An uong")
                        .type("EXPENSE")
                        .icon("restaurant")
                        .isDefault(true)
                        .build()))
                .build();

        GuestImportResponse response = guestImportService.importGuestData("guest-user", request);

        assertThat(response.getCategoryMap()).containsEntry("category-local-1", 30L);
        assertThat(response.getImportedCounts().getCategoriesCreated()).isZero();
        assertThat(response.getImportedCounts().getCategoriesReused()).isEqualTo(1);
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void shouldReuseCustomCategoryByNormalizedFieldsAndBackfillSourceLocalId() {
        User user = user(10L, "guest-user");
        Category customCategory = customCategory(31L, user, "Cà phê", "EXPENSE", "coffee");

        when(userRepository.findByUsername("guest-user")).thenReturn(Optional.of(user));
        when(categoryRepository.findFirstByUserIdAndSourceLocalId(10L, "category-local-2")).thenReturn(Optional.empty());
        when(categoryRepository.findByUserId(10L)).thenReturn(List.of(customCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GuestImportRequest request = GuestImportRequest.builder()
                .categories(List.of(GuestImportRequest.GuestImportCategoryItem.builder()
                        .localId("category-local-2")
                        .name(" Ca phe ")
                        .type("EXPENSE")
                        .icon("coffee")
                        .isDefault(false)
                        .build()))
                .build();

        GuestImportResponse response = guestImportService.importGuestData("guest-user", request);

        assertThat(response.getCategoryMap()).containsEntry("category-local-2", 31L);
        assertThat(response.getImportedCounts().getCategoriesCreated()).isZero();
        assertThat(response.getImportedCounts().getCategoriesReused()).isEqualTo(1);
        assertThat(customCategory.getSourceLocalId()).isEqualTo("category-local-2");
        verify(categoryRepository).save(customCategory);
    }

    @Test
    void shouldCreateTransactionAndUpdateWalletBalanceUsingImportedMappings() {
        User user = user(10L, "guest-user");
        Wallet wallet = wallet(20L, user, "Ví phụ", "VND", new BigDecimal("100000"));
        Category category = customCategory(30L, user, "Lương", "INCOME", "wallet");
        Transaction savedTransaction = Transaction.builder()
                .id(40L)
                .wallet(wallet)
                .category(category)
                .amount(new BigDecimal("250000"))
                .type("INCOME")
                .note("Luong thang")
                .transactionDate(LocalDateTime.of(2026, 3, 28, 10, 30))
                .createdAt(LocalDateTime.of(2026, 3, 28, 10, 30))
                .sourceLocalId("transaction-local-1")
                .build();

        when(userRepository.findByUsername("guest-user")).thenReturn(Optional.of(user));
        when(walletRepository.findFirstByUserIdAndSourceLocalId(10L, "wallet-local-3")).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> {
            Wallet candidate = invocation.getArgument(0);
            candidate.setId(20L);
            return candidate;
        });
        when(categoryRepository.findFirstByUserIdAndSourceLocalId(10L, "category-local-3")).thenReturn(Optional.empty());
        when(categoryRepository.findByUserId(10L)).thenReturn(List.of());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category candidate = invocation.getArgument(0);
            candidate.setId(30L);
            return candidate;
        });
        when(transactionRepository.findByUserIdAndSourceLocalId(10L, "transaction-local-1")).thenReturn(Optional.empty());
        when(walletRepository.findByIdAndUserId(20L, 10L)).thenReturn(Optional.of(wallet));
        when(categoryRepository.findById(30L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        GuestImportRequest request = GuestImportRequest.builder()
                .wallets(List.of(GuestImportRequest.GuestImportWalletItem.builder()
                        .localId("wallet-local-3")
                        .name("Ví phụ")
                        .currency("VND")
                        .initialBalance(new BigDecimal("100000"))
                        .isDefault(false)
                        .createdAt(LocalDateTime.of(2026, 3, 1, 8, 0))
                        .build()))
                .categories(List.of(GuestImportRequest.GuestImportCategoryItem.builder()
                        .localId("category-local-3")
                        .name("Lương")
                        .type("INCOME")
                        .icon("wallet")
                        .isDefault(false)
                        .build()))
                .transactions(List.of(GuestImportRequest.GuestImportTransactionItem.builder()
                        .localId("transaction-local-1")
                        .walletLocalId("wallet-local-3")
                        .categoryLocalId("category-local-3")
                        .amount(new BigDecimal("250000"))
                        .type("INCOME")
                        .note("Luong thang")
                        .transactionDate(LocalDateTime.of(2026, 3, 28, 10, 30))
                        .createdAt(LocalDateTime.of(2026, 3, 28, 10, 30))
                        .build()))
                .build();

        GuestImportResponse response = guestImportService.importGuestData("guest-user", request);

        assertThat(response.getWalletMap()).containsEntry("wallet-local-3", 20L);
        assertThat(response.getCategoryMap()).containsEntry("category-local-3", 30L);
        assertThat(response.getTransactionMap()).containsEntry("transaction-local-1", 40L);
        assertThat(response.getImportedCounts().getTransactionsCreated()).isEqualTo(1);

        ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(transactionCaptor.capture());
        Transaction persisted = transactionCaptor.getValue();
        assertThat(persisted.getWallet()).isSameAs(wallet);
        assertThat(persisted.getCategory()).isSameAs(category);
        assertThat(persisted.getAmount()).isEqualByComparingTo("250000");
        assertThat(persisted.getType()).isEqualTo("INCOME");
        assertThat(persisted.getSourceLocalId()).isEqualTo("transaction-local-1");
        verify(walletService).updateBalance(20L, new BigDecimal("250000"), "INCOME");
    }

    @Test
    void shouldReuseWalletCategoryAndTransactionOnRetryBySourceLocalId() {
        User user = user(10L, "guest-user");
        Wallet wallet = wallet(20L, user, "Ví chính", "VND", BigDecimal.ZERO);
        Category category = customCategory(30L, user, "Cafe", "EXPENSE", "coffee");
        Transaction transaction = Transaction.builder()
                .id(40L)
                .wallet(wallet)
                .category(category)
                .amount(new BigDecimal("50000"))
                .type("EXPENSE")
                .sourceLocalId("transaction-local-2")
                .build();

        when(userRepository.findByUsername("guest-user")).thenReturn(Optional.of(user));
        when(walletRepository.findFirstByUserIdAndSourceLocalId(10L, "wallet-local-4")).thenReturn(Optional.of(wallet));
        when(categoryRepository.findFirstByUserIdAndSourceLocalId(10L, "category-local-4")).thenReturn(Optional.of(category));
        when(transactionRepository.findByUserIdAndSourceLocalId(10L, "transaction-local-2"))
                .thenReturn(Optional.of(transaction));

        GuestImportRequest request = GuestImportRequest.builder()
                .wallets(List.of(GuestImportRequest.GuestImportWalletItem.builder()
                        .localId("wallet-local-4")
                        .name("Ví chính")
                        .currency("VND")
                        .initialBalance(BigDecimal.ZERO)
                        .isDefault(true)
                        .build()))
                .categories(List.of(GuestImportRequest.GuestImportCategoryItem.builder()
                        .localId("category-local-4")
                        .name("Cafe")
                        .type("EXPENSE")
                        .icon("coffee")
                        .isDefault(false)
                        .build()))
                .transactions(List.of(GuestImportRequest.GuestImportTransactionItem.builder()
                        .localId("transaction-local-2")
                        .walletLocalId("wallet-local-4")
                        .categoryLocalId("category-local-4")
                        .amount(new BigDecimal("50000"))
                        .type("EXPENSE")
                        .build()))
                .build();

        GuestImportResponse response = guestImportService.importGuestData("guest-user", request);

        assertThat(response.getWalletMap()).containsEntry("wallet-local-4", 20L);
        assertThat(response.getCategoryMap()).containsEntry("category-local-4", 30L);
        assertThat(response.getTransactionMap()).containsEntry("transaction-local-2", 40L);
        assertThat(response.getImportedCounts().getWalletsReused()).isEqualTo(1);
        assertThat(response.getImportedCounts().getCategoriesReused()).isEqualTo(1);
        assertThat(response.getImportedCounts().getTransactionsReused()).isEqualTo(1);
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(categoryRepository, never()).save(any(Category.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(walletService, never()).updateBalance(any(), any(), any());
    }

    private User user(Long id, String username) {
        return User.builder()
                .id(id)
                .username(username)
                .build();
    }

    private Wallet wallet(Long id, User user, String name, String currency, BigDecimal initialBalance) {
        return Wallet.builder()
                .id(id)
                .user(user)
                .name(name)
                .currency(currency)
                .initialBalance(initialBalance)
                .balance(initialBalance)
                .createdAt(LocalDateTime.of(2026, 3, 1, 8, 0))
                .build();
    }

    private Category defaultCategory(Long id, String name, String type, String icon) {
        return Category.builder()
                .id(id)
                .name(name)
                .type(type)
                .icon(icon)
                .isDefault(true)
                .build();
    }

    private Category customCategory(Long id, User user, String name, String type, String icon) {
        return Category.builder()
                .id(id)
                .user(user)
                .name(name)
                .type(type)
                .icon(icon)
                .isDefault(false)
                .build();
    }
}
