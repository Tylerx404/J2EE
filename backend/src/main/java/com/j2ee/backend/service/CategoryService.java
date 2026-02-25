package com.j2ee.backend.service;

import com.j2ee.backend.dto.request.CategoryCreateRequest;
import com.j2ee.backend.dto.response.CategoryResponse;
import com.j2ee.backend.entity.Category;
import com.j2ee.backend.entity.User;
import com.j2ee.backend.repository.CategoryRepository;
import com.j2ee.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * Lấy tất cả categories (default + custom của user)
     */
    public List<CategoryResponse> getAllCategories(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Lấy categories default + custom của user
        List<Category> categories = categoryRepository.findByUserIdOrIsDefaultTrue(user.getId());

        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy categories theo type
     */
    public List<CategoryResponse> getCategoriesByType(String username, String type) {
        List<CategoryResponse> allCategories = getAllCategories(username);

        return allCategories.stream()
                .filter(c -> type.equals(c.getType()))
                .collect(Collectors.toList());
    }

    /**
     * Tạo category custom cho user
     */
    @Transactional
    public CategoryResponse createCategory(String username, CategoryCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        // Validate type
        if (!"EXPENSE".equals(request.getType()) && !"INCOME".equals(request.getType())) {
            throw new IllegalArgumentException("Type phải là EXPENSE hoặc INCOME!");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .isDefault(false)
                .user(user)
                .build();

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    /**
     * Lấy thông tin 1 category
     */
    public CategoryResponse getCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại!"));

        return toResponse(category);
    }

    /**
     * Xóa custom category (chỉ user tạo mới xóa được)
     */
    @Transactional
    public void deleteCategory(String username, Long categoryId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại!"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại!"));

        // Không cho xóa default category
        if (category.getIsDefault()) {
            throw new IllegalArgumentException("Không thể xóa category mặc định!");
        }

        // Chỉ user tạo mới xóa được
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa category này!");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .isDefault(category.getIsDefault())
                .userId(category.getUser() != null ? category.getUser().getId() : null)
                .build();
    }
}
