# AGENTS.md

## 1) Tổng Quan Dự Án
- Dự án quản lý chi tiêu cá nhân: mobile app + backend API.
- Mục tiêu chính: ghi nhận thu/chi nhanh (manual + voice), quản lý nhiều ví, xem báo cáo, nhận advice.
- Stack:
  - Backend: Spring Boot, Spring Security (JWT), Spring Data JPA, Oracle, Java 21.
  - Mobile: Expo React Native (hiện mới scaffold cơ bản).

## 2) Domain Cốt Lõi
- `User` -> nhiều `Wallet` -> mỗi `Wallet` có nhiều `Transaction`.
- `Transaction`: `amount` (dương), `type` (`EXPENSE|INCOME`), `category` (nullable), `note`, `transactionDate`.
- `Category`: gồm default system + custom theo user.
- `AiAdviceLog`: lưu lịch sử advice theo kỳ (`period`).

## 3) Rule Nghiệp Vụ Bắt Buộc
- User mới luôn có wallet mặc định: `"Ví chính"`, currency `VND`, balance `0`.
- Balance ví: `initialBalance + tổng INCOME - tổng EXPENSE`.
- Tạo/xóa transaction phải cập nhật balance ví tương ứng (xóa thì rollback ngược lại).
- Không cho xóa wallet nếu còn transaction.
- Tất cả thao tác wallet/transaction/category phải kiểm tra ownership theo user từ JWT.

## 4) Cấu Trúc Path Dự Án
- Root:
  - `AGENTS.md`
  - `README.md`
  - `backend/`
  - `mobile/`
- Backend (`backend/src/main/java/com/j2ee/backend`):
  - `controller/` nhận request/response API.
  - `service/` chứa business logic.
  - `repository/` truy cập dữ liệu (JPA).
  - `entity/` model DB.
  - `dto/request` và `dto/response` cho contract API.
  - `config/` security/JWT filter chain.
  - `exception/` xử lý lỗi tập trung.
  - `util/` hằng số và helper.
- Backend resources:
  - `backend/src/main/resources/application.properties`
  - `backend/src/main/resources/db/` script SQL/migration.
- Mobile:
  - `mobile/App.js`, `mobile/index.js`, `mobile/package.json`.

## 5) Quy Ước Code Backend
- Bố trí package theo layer: `controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`.
- Controller chỉ nhận request/response; business logic để ở service.
- Dùng DTO riêng cho request/response, không trả trực tiếp entity.
- Validate input bằng Jakarta Validation trong DTO; xử lý lỗi tập trung ở `GlobalExceptionHandler`.
- Dùng `BigDecimal` cho tiền, `LocalDateTime` cho thời gian.
- Các nghiệp vụ có nhiều bước ghi DB phải đặt `@Transactional`.
- Naming giữ chuẩn hiện tại: `*Controller`, `*Service`, `*Repository`, `*Request`, `*Response`.

## 6) Trạng Thái Hiện Tại (Quan Trọng)
- Voice parse hiện đang parse từ text (`voiceText`) theo logic đơn giản, chưa có audio multipart + Whisper.
- AI advice hiện là logic mock nội bộ, chưa gọi LLM thật.
- Chưa có endpoint edit transaction.

## 7) Cấu Hình Và Chạy Local
- Env backend:
  - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
  - `JWT_SECRET` (>= 32 bytes), `JWT_EXPIRATION` (optional)
  - `GOOGLE_CLIENT_ID`
- Chạy backend:
  - `cd backend`
  - `./mvnw spring-boot:run`
- Chạy mobile:
  - `cd mobile`
  - `npm install`
  - `npm run start`
