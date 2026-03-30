# AGENTS.md

## 1) Tong Quan Du An
- Du an quan ly chi tieu ca nhan gom mobile app va backend API.
- Muc tieu chinh:
  - ghi nhan thu/chi nhanh bang manual va voice text
  - quan ly nhieu vi
  - xem lich su, bao cao, dashboard
  - nhan AI advice
- Stack:
  - Backend: Spring Boot, Spring Security (JWT), Spring Data JPA, Oracle, Java 21
  - Mobile: Expo React Native
  - Guest local data: SQLite tren mobile qua `expo-sqlite`

## 2) Domain Cot Loi
- `User` -> nhieu `Wallet` -> moi `Wallet` co nhieu `Transaction`.
- `Transaction`:
  - `amount` luon duong
  - `type`: `EXPENSE | INCOME`
  - `category` co the null
  - `note`
  - `transactionDate`
- `Category` gom:
  - default system
  - custom theo user
- `AiAdviceLog` luu lich su advice theo ky.

## 3) Session Va Guest Mode
- App hien co 3 session mode:
  - `logged_out`
  - `guest`
  - `authenticated`
- Guest mode luu du lieu tai chinh local trong SQLite, khong dung `AsyncStorage` cho wallet/category/transaction.
- `AsyncStorage` chi giu session-level state nhu:
  - `jwt_token`
  - `user_info`
  - `session_mode`
  - cac key lien quan guest import state
- Guest mode hien co:
  - wallet
  - category
  - transaction
  - history
  - report local
  - profile prompt de dieu huong qua login/register backend
- Guest mode khong goi backend finance APIs.
- Voice parse cho guest chua ho tro; guest dung manual transaction flow la chinh.

## 4) Rule Nghiep Vu Bat Buoc
- User moi tren backend luon co wallet mac dinh: `"Vi chinh"`, currency `VND`, balance `0`.
- Guest moi tren mobile cung luon co 1 wallet mac dinh local voi logic tuong tu.
- Cong thuc balance:
  - `initialBalance + tong INCOME - tong EXPENSE`
- Tao/xoa transaction phai cap nhat balance vi tuong ung.
- Khong cho xoa wallet neu con transaction.
- Khong cho xoa default category.
- Tat ca thao tac wallet/transaction/category tren backend phai check ownership theo user tu JWT.
- Du lieu money:
  - backend dung `BigDecimal`
  - mobile SQLite luu dang `TEXT` va di qua helper money de tranh loi float

## 5) Guest SQLite Va Import Len Backend
- Mobile guest DB nam trong `mobile/src/data/guest/`.
- Guest DB hien co cac bang/chuc nang chinh:
  - `app_meta`
  - `guest_profile`
  - `wallets`
  - `categories`
  - `transactions`
- Mobile guest rows co import state:
  - `migration_state`
  - `imported_server_id`
- Sau khi guest login/register thanh cong:
  - app kiem tra guest data chua import
  - hien prompt `Import du lieu local / Giu rieng / De sau`
  - neu user chon import thi mobile goi backend import API that
- Backend da co endpoint:
  - `POST /api/guest-import`
- Backend import da ho tro:
  - map `localId -> serverId`
  - import wallets truoc
  - import categories tiep theo
  - import transactions sau cung
  - idempotency theo `sourceLocalId`
  - merge default guest wallet vao default backend wallet neu match rule
- Sau import thanh cong:
  - mobile danh dau local rows la `IMPORTED`
  - khong xoa guest DB ngay
  - authenticated screens doc du lieu server

## 6) Cau Truc Path Du An
- Root:
  - `AGENTS.md`
  - `README.md`
  - `backend/`
  - `mobile/`

- Backend (`backend/src/main/java/com/j2ee/backend`):
  - `controller/`: nhan request/response API
  - `service/`: business logic
  - `repository/`: truy cap du lieu JPA
  - `entity/`: model DB
  - `dto/request` va `dto/response`: contract API
  - `config/`: security, JWT filter chain
  - `exception/`: xu ly loi tap trung
  - `util/`: hang so va helper

- Backend resources:
  - `backend/src/main/resources/application.properties`
  - `backend/src/main/resources/db/`
  - `backend/src/test/resources/application-test.properties`

- Mobile:
  - `mobile/App.js`
  - `mobile/src/screens/`
  - `mobile/src/services/`
  - `mobile/src/data/api/`
  - `mobile/src/data/guest/`
  - `mobile/package.json`

## 7) Quy Uoc Code Backend
- Bo tri package theo layer: `controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`.
- Controller chi nhan request/response; business logic de trong service.
- Dung DTO rieng cho request/response, khong tra truc tiep entity.
- Validate input bang Jakarta Validation trong DTO.
- Xu ly loi tap trung o `GlobalExceptionHandler`.
- Dung `BigDecimal` cho tien, `LocalDateTime` cho thoi gian.
- Nghiep vu co nhieu buoc ghi DB phai dat `@Transactional`.
- Naming theo convention hien co:
  - `*Controller`
  - `*Service`
  - `*Repository`
  - `*Request`
  - `*Response`

## 8) Quy Uoc Code Mobile
- UI khong nen goi backend finance truc tiep; uu tien di qua service/facade layer.
- Session-aware data layer chon adapter theo `sessionMode`:
  - guest -> SQLite repo
  - authenticated -> API repo
- Cac man hinh finance can giu output shape tuong thich DTO backend de giam sua UI.
- Guest profile khong goi API profile backend; chi hien local summary va CTA login/register.
- Tab `Profile` xuat hien cho guest va authenticated.

## 9) Trang Thai Hien Tai
- Voice parse hien dang parse tu text (`voiceText`), chua co audio multipart + Whisper.
- AI advice hien van la logic mock noi bo, chua goi LLM that.
- Chua co endpoint edit transaction.
- Mobile da co manual transaction flow cho guest.
- Mobile web da tung gap loi `expo-sqlite` worker/dependency; branch hien tai da co cac fix can thiet de web bundling chay lai.
- Backend da co `GuestImportController` va `GuestImportService`.
- Backend auth unauthenticated contract hien tra `401` cho protected APIs.

## 10) Cau Hinh Va Chay Local
- Env backend production/dev can:
  - `DB_URL`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `JWT_SECRET` (>= 32 bytes)
  - `JWT_EXPIRATION` (optional)
  - `GOOGLE_CLIENT_ID`

- Chay backend voi Oracle/local env:
  - `cd backend`
  - `./mvnw spring-boot:run`

- Chay backend bang profile test H2:
  - `cd backend`
  - `./mvnw -Dspring-boot.run.profiles=test spring-boot:run`

- Chay test backend:
  - `cd backend`
  - `./mvnw test`

- Chay mobile:
  - `cd mobile`
  - `npm install`
  - `npm run start`

## 11) Test Notes Quan Trong
- Backend test profile `test` dung H2 trong `backend/src/test/resources/application-test.properties`.
- Luong da duoc verify:
  - register -> login -> guest import -> retry import khong duplicate
- Khi test guest import end-to-end, can check:
  - default wallet merge dung
  - custom wallet/category tao dung
  - transaction import dung wallet/category map
  - balance sau import khop cong thuc
  - import retry idempotent theo `sourceLocalId`
