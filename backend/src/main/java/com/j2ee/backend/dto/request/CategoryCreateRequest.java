package com.j2ee.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu tạo category tùy chỉnh.")
public class CategoryCreateRequest {
    @Schema(description = "Tên category.", example = "Ăn uống")
    @NotBlank(message = "Category name must not be blank")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String name;

    @Schema(description = "Loại category.", allowableValues = { "EXPENSE", "INCOME" }, example = "EXPENSE")
    @NotBlank(message = "Category type is required")
    @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "Category type must be EXPENSE or INCOME")
    private String type;

    @Schema(description = "Biểu tượng category.", example = "utensils")
    @Size(max = 50, message = "Icon must be at most 50 characters")
    private String icon;
}
