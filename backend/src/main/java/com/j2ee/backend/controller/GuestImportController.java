package com.j2ee.backend.controller;

import com.j2ee.backend.dto.request.GuestImportRequest;
import com.j2ee.backend.dto.response.ApiErrorResponse;
import com.j2ee.backend.dto.response.GuestImportResponse;
import com.j2ee.backend.service.GuestImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guest-import")
@RequiredArgsConstructor
@Tag(name = "Guest Import", description = "API import du lieu guest local len backend.")
@SecurityRequirement(name = "bearerAuth")
public class GuestImportController {

    private final GuestImportService guestImportService;

    @PostMapping
    @Operation(summary = "Import du lieu guest local")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import thanh cong", content = @Content(schema = @Schema(implementation = GuestImportResponse.class))),
            @ApiResponse(responseCode = "400", description = "Payload import khong hop le", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Chua xac thuc", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Loi he thong", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<GuestImportResponse> importGuestData(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody GuestImportRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(guestImportService.importGuestData(username, request));
    }
}
