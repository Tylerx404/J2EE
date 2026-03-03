package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.CategoryCreateRequest;
import com.j2ee.backend.dto.response.CategoryResponse;
import com.j2ee.backend.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories - Lấy tất cả categories (default + custom của user)
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            Authentication authentication,
            @RequestParam(required = false) @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "type must be EXPENSE or INCOME") String type) {
        String username = authentication.getName();

        if (type != null) {
            return ResponseEntity.ok(categoryService.getCategoriesByType(username, type));
        }

        return ResponseEntity.ok(categoryService.getAllCategories(username));
    }

    /**
     * GET /api/categories/{id} - Lấy thông tin 1 category
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategory(id));
    }

    /**
     * POST /api/categories - Tạo category custom
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            Authentication authentication,
            @Valid @RequestBody CategoryCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(categoryService.createCategory(username, request));
    }

    /**
     * DELETE /api/categories/{id} - Xóa custom category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        categoryService.deleteCategory(username, id);
        return ResponseEntity.noContent().build();
    }
}
