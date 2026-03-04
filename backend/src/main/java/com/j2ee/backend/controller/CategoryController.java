package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.CategoryCreateRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.ApiValidationErrorResponse;
import com.j2ee.backend.dto.response.CategoryResponse;
import com.j2ee.backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Category", description = "API quản lý danh mục thu/chi.")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories - Lấy tất cả categories (default + custom của user)
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách category", description = "Lấy toàn bộ category hoặc lọc theo type.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CategoryResponse.class)))),
            @ApiResponse(responseCode = "400", description = "Query param không hợp lệ", content = @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "Lọc theo loại category", example = "EXPENSE")
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
    @Operation(summary = "Lấy chi tiết category theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(schema = @Schema(implementation = CategoryResponse.class))),
            @ApiResponse(responseCode = "400", description = "ID không hợp lệ hoặc không tìm thấy category", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<CategoryResponse> getCategory(
            @Parameter(description = "ID category", example = "10") @PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategory(id));
    }

    /**
     * POST /api/categories - Tạo category custom
     */
    @PostMapping
    @Operation(summary = "Tạo category custom")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tạo category thành công", content = @Content(schema = @Schema(implementation = CategoryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = {
                    @Content(schema = @Schema(implementation = ApiValidationErrorResponse.class)),
                    @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            }),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<CategoryResponse> createCategory(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody CategoryCreateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(categoryService.createCategory(username, request));
    }

    /**
     * DELETE /api/categories/{id} - Xóa custom category
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa category custom")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa category thành công"),
            @ApiResponse(responseCode = "400", description = "Không thể xóa category", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteCategory(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID category", example = "10")
            @PathVariable Long id) {
        String username = authentication.getName();
        categoryService.deleteCategory(username, id);
        return ResponseEntity.noContent().build();
    }
}
