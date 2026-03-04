package com.j2ee.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin category.")
public class CategoryResponse {
    @Schema(description = "ID category.", example = "5")
    private Long id;
    @Schema(description = "Tên category.", example = "Ăn uống")
    private String name;
    @Schema(description = "Loại category.", allowableValues = { "EXPENSE", "INCOME" }, example = "EXPENSE")
    private String type; // "EXPENSE" or "INCOME"
    @Schema(description = "Biểu tượng category.", example = "utensils")
    private String icon;
    @Schema(description = "Có phải category mặc định hệ thống.", example = "true")
    private Boolean isDefault;
    @Schema(description = "User sở hữu category custom. Null nếu là default.", example = "1")
    private Long userId;
}
