package com.j2ee.backend.dto.request;

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
public class CategoryCreateRequest {
    @NotBlank(message = "Category name must not be blank")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Category type is required")
    @Pattern(regexp = "^(EXPENSE|INCOME)$", message = "Category type must be EXPENSE or INCOME")
    private String type;

    @Size(max = 50, message = "Icon must be at most 50 characters")
    private String icon;
}
