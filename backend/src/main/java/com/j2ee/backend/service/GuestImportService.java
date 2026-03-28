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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GuestImportService {

    private static final String DEFAULT_WALLET_NAME = "Vi chinh";
    private static final String DEFAULT_WALLET_CURRENCY = "VND";

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @Transactional
    public GuestImportResponse importGuestData(String username, GuestImportRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User khong ton tai!"));

        GuestImportResponse.ImportedCounts importedCounts = GuestImportResponse.ImportedCounts.builder().build();
        Map<String, Long> walletMap = new LinkedHashMap<>();
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        Map<String, Long> transactionMap = new LinkedHashMap<>();

        for (GuestImportRequest.GuestImportWalletItem walletItem : safeList(request.getWallets())) {
            ImportResult<Wallet> result = importWallet(user, walletItem);
            walletMap.put(walletItem.getLocalId(), result.entity().getId());
            if (result.created()) {
                importedCounts.setWalletsCreated(importedCounts.getWalletsCreated() + 1);
            } else {
                importedCounts.setWalletsReused(importedCounts.getWalletsReused() + 1);
            }
        }

        for (GuestImportRequest.GuestImportCategoryItem categoryItem : safeList(request.getCategories())) {
            ImportResult<Category> result = importCategory(user, categoryItem);
            categoryMap.put(categoryItem.getLocalId(), result.entity().getId());
            if (result.created()) {
                importedCounts.setCategoriesCreated(importedCounts.getCategoriesCreated() + 1);
            } else {
                importedCounts.setCategoriesReused(importedCounts.getCategoriesReused() + 1);
            }
        }

        for (GuestImportRequest.GuestImportTransactionItem transactionItem : safeList(request.getTransactions())) {
            ImportResult<Transaction> result = importTransaction(user, transactionItem, walletMap, categoryMap);
            transactionMap.put(transactionItem.getLocalId(), result.entity().getId());
            if (result.created()) {
                importedCounts.setTransactionsCreated(importedCounts.getTransactionsCreated() + 1);
            } else {
                importedCounts.setTransactionsReused(importedCounts.getTransactionsReused() + 1);
            }
        }

        return GuestImportResponse.builder()
                .importedCounts(importedCounts)
                .walletMap(walletMap)
                .categoryMap(categoryMap)
                .transactionMap(transactionMap)
                .build();
    }

    private ImportResult<Wallet> importWallet(User user, GuestImportRequest.GuestImportWalletItem item) {
        String localId = requireLocalId(item.getLocalId(), "wallet");
        Optional<Wallet> bySourceLocalId = walletRepository.findFirstByUserIdAndSourceLocalId(user.getId(), localId);
        if (bySourceLocalId.isPresent()) {
            return new ImportResult<>(bySourceLocalId.get(), false);
        }

        if (Boolean.TRUE.equals(item.getIsDefault()) && isDefaultWalletPayload(item)) {
            Optional<Wallet> existingDefault = walletRepository.findByUserId(user.getId()).stream()
                    .filter(this::isBackendDefaultWallet)
                    .findFirst();

            if (existingDefault.isPresent()) {
                Wallet wallet = existingDefault.get();
                if (isBlank(wallet.getSourceLocalId())) {
                    wallet.setSourceLocalId(localId);
                    walletRepository.save(wallet);
                }
                return new ImportResult<>(wallet, false);
            }
        }

        BigDecimal initialBalance = item.getInitialBalance() != null ? item.getInitialBalance() : BigDecimal.ZERO;
        Wallet wallet = Wallet.builder()
                .user(user)
                .name(item.getName())
                .initialBalance(initialBalance)
                .balance(initialBalance)
                .currency(defaultIfBlank(item.getCurrency(), DEFAULT_WALLET_CURRENCY))
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt() : LocalDateTime.now())
                .sourceLocalId(localId)
                .build();

        return new ImportResult<>(walletRepository.save(wallet), true);
    }

    private ImportResult<Category> importCategory(User user, GuestImportRequest.GuestImportCategoryItem item) {
        String localId = requireLocalId(item.getLocalId(), "category");
        Optional<Category> bySourceLocalId = categoryRepository.findFirstByUserIdAndSourceLocalId(user.getId(), localId);
        if (bySourceLocalId.isPresent()) {
            return new ImportResult<>(bySourceLocalId.get(), false);
        }

        if (Boolean.TRUE.equals(item.getIsDefault())) {
            Optional<Category> existingDefault = categoryRepository.findByIsDefaultTrue().stream()
                    .filter(category -> Objects.equals(category.getType(), item.getType()))
                    .filter(category -> normalizeText(category.getName()).equals(normalizeText(item.getName())))
                    .findFirst();

            if (existingDefault.isPresent()) {
                return new ImportResult<>(existingDefault.get(), false);
            }
        }

        Optional<Category> existingCustom = categoryRepository.findByUserId(user.getId()).stream()
                .filter(category -> !Boolean.TRUE.equals(category.getIsDefault()))
                .filter(category -> Objects.equals(category.getType(), item.getType()))
                .filter(category -> normalizeText(category.getName()).equals(normalizeText(item.getName())))
                .filter(category -> normalizeText(category.getIcon()).equals(normalizeText(item.getIcon())))
                .findFirst();

        if (existingCustom.isPresent()) {
            Category category = existingCustom.get();
            if (isBlank(category.getSourceLocalId())) {
                category.setSourceLocalId(localId);
                categoryRepository.save(category);
            }
            return new ImportResult<>(category, false);
        }

        Category category = Category.builder()
                .name(item.getName())
                .type(item.getType())
                .icon(item.getIcon())
                .isDefault(false)
                .user(user)
                .sourceLocalId(localId)
                .build();

        return new ImportResult<>(categoryRepository.save(category), true);
    }

    private ImportResult<Transaction> importTransaction(
            User user,
            GuestImportRequest.GuestImportTransactionItem item,
            Map<String, Long> walletMap,
            Map<String, Long> categoryMap
    ) {
        String localId = requireLocalId(item.getLocalId(), "transaction");
        Optional<Transaction> bySourceLocalId = transactionRepository.findByUserIdAndSourceLocalId(user.getId(), localId);
        if (bySourceLocalId.isPresent()) {
            return new ImportResult<>(bySourceLocalId.get(), false);
        }

        Long walletId = resolveWalletId(user.getId(), item.getWalletLocalId(), walletMap);
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet import khong hop le."));

        Category category = null;
        if (!isBlank(item.getCategoryLocalId())) {
            Long categoryId = resolveCategoryId(user.getId(), item.getCategoryLocalId(), categoryMap);
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category import khong hop le."));
        }

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .category(category)
                .amount(item.getAmount())
                .type(item.getType())
                .note(item.getNote())
                .transactionDate(item.getTransactionDate() != null ? item.getTransactionDate() : LocalDateTime.now())
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt() : LocalDateTime.now())
                .voiceText(item.getVoiceText())
                .sourceLocalId(localId)
                .build();

        transaction = transactionRepository.save(transaction);
        walletService.updateBalance(wallet.getId(), item.getAmount(), item.getType());
        return new ImportResult<>(transaction, true);
    }

    private Long resolveWalletId(Long userId, String walletLocalId, Map<String, Long> walletMap) {
        Long walletId = walletMap.get(walletLocalId);
        if (walletId != null) {
            return walletId;
        }

        return walletRepository.findFirstByUserIdAndSourceLocalId(userId, walletLocalId)
                .map(Wallet::getId)
                .orElseThrow(() -> new IllegalArgumentException("Khong map duoc wallet local: " + walletLocalId));
    }

    private Long resolveCategoryId(Long userId, String categoryLocalId, Map<String, Long> categoryMap) {
        Long categoryId = categoryMap.get(categoryLocalId);
        if (categoryId != null) {
            return categoryId;
        }

        return categoryRepository.findFirstByUserIdAndSourceLocalId(userId, categoryLocalId)
                .map(Category::getId)
                .orElseThrow(() -> new IllegalArgumentException("Khong map duoc category local: " + categoryLocalId));
    }

    private boolean isDefaultWalletPayload(GuestImportRequest.GuestImportWalletItem item) {
        return normalizeText(item.getName()).equals(normalizeText(DEFAULT_WALLET_NAME))
                && normalizeText(defaultIfBlank(item.getCurrency(), DEFAULT_WALLET_CURRENCY))
                .equals(normalizeText(DEFAULT_WALLET_CURRENCY));
    }

    private boolean isBackendDefaultWallet(Wallet wallet) {
        return normalizeText(wallet.getName()).equals(normalizeText(DEFAULT_WALLET_NAME))
                && normalizeText(defaultIfBlank(wallet.getCurrency(), DEFAULT_WALLET_CURRENCY))
                .equals(normalizeText(DEFAULT_WALLET_CURRENCY));
    }

    private String requireLocalId(String localId, String label) {
        if (isBlank(localId)) {
            throw new IllegalArgumentException("Thieu localId cho " + label + ".");
        }
        return localId;
    }

    private String defaultIfBlank(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("\\s+", " ");
    }

    private <T> List<T> safeList(List<T> items) {
        return items == null ? Collections.emptyList() : items;
    }

    private record ImportResult<T>(T entity, boolean created) {
    }
}
