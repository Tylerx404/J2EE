# Backend API - OpenAPI Guide

## 1. Chạy backend local

Yêu cầu biến môi trường:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (ít nhất 32 bytes)
- `JWT_EXPIRATION` (optional)
- `GOOGLE_CLIENT_ID`

Chạy ứng dụng:

```bash
cd backend
bash ./mvnw spring-boot:run
```

## 2. Truy cập tài liệu OpenAPI

Sau khi app chạy:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Lưu ý:

- `/v3/api-docs`, `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html` là public.
- API nghiệp vụ còn lại yêu cầu JWT Bearer token.

## 3. Lấy JWT token

### Cách 1: Đăng ký tài khoản mới

`POST /api/auth/register`

```json
{
  "username": "tyler_01",
  "email": "tyler@example.com",
  "password": "myPassword123",
  "fullName": "Tyler Nguyen"
}
```

### Cách 2: Đăng nhập tài khoản có sẵn

`POST /api/auth/login`

```json
{
  "usernameOrEmail": "tyler@example.com",
  "password": "myPassword123"
}
```

Response trả về `token` trong `JwtResponse`.

## 4. Dùng JWT trong Swagger UI

1. Mở Swagger UI.
2. Bấm nút `Authorize` (góc phải).
3. Dán token JWT vào ô nhập (không cần tự thêm `Bearer`).
4. Bấm `Authorize` để áp dụng cho các API có yêu cầu bảo mật.

## 5. Ví dụ gọi API bằng cURL

### Đăng nhập lấy token

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "tyler@example.com",
    "password": "myPassword123"
  }'
```

### Lấy danh sách ví (cần JWT)

```bash
curl -X GET "http://localhost:8080/api/wallets" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Tạo giao dịch

```bash
curl -X POST "http://localhost:8080/api/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "walletId": 1,
    "amount": 50000,
    "type": "EXPENSE",
    "note": "Cafe sáng",
    "transactionDate": "2026-03-04T08:30:00"
  }'
```

### Parse voice text

```bash
curl -X POST "http://localhost:8080/api/ai/voice/parse" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "voiceText": "Chi 50 nghìn tiền cafe"
  }'
```
