package com.j2ee.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "J2EE Personal Finance API",
                version = "v1",
                description = "API quản lý chi tiêu cá nhân: xác thực, ví, giao dịch, danh mục, báo cáo và AI.",
                contact = @Contact(name = "J2EE Backend Team")))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Dán JWT token vào ô Authorize. Swagger sẽ tự thêm tiền tố Bearer.")
public class OpenApiConfig {
}
