package com.j2ee.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String type; // "EXPENSE" or "INCOME"
    private String icon;
    private Boolean isDefault;
    private Long userId;
}
