# 🚀 HƯỚNG DẪN CẬP NHẬT DỰ ÁN - CATEGORIES & SERVICES MỚI

## 📋 Tóm tắt những gì đã thay đổi:

### ✨ 1. HỆ THỐNG CATEGORIES MỚI (QUAN TRỌNG!)
- ✅ **22 categories mặc định** cho user mới (16 EXPENSE + 6 INCOME)
- ✅ **Kết hợp system default + custom**: User có categories mặc định + tự tạo thêm
- ✅ **Tối ưu cho AI parsing**: Danh sách categories phù hợp với người Việt
- ✅ **Bảo vệ default categories**: User không thể xóa categories hệ thống
- ✅ **Danh sách categories mới**:
  - **EXPENSE (16)**: Ăn uống, Đi chợ/Siêu thị, Cafe/Trà sữa, Ăn ngoài/Nhà hàng, Di chuyển, Đi xe ôm/Taxi, Mua sắm, Giải trí, Sức khỏe, Làm đẹp, Tiền nhà/Điện nước, Internet/Điện thoại, Học phí/Sách vở, Quà tặng, Hỗ trợ gia đình, Tiết kiệm/Đầu tư
  - **INCOME (6)**: Lương chính, Thưởng, Freelance/Làm thêm, Tiền lãi tiết kiệm, Tiền quà/Cho vay, Khác

### ✨ 2. Cải tiến Wallet với Số Dư Ban Đầu (Initial Balance)
- ✅ Thêm field `initialBalance` vào bảng WALLETS
- ✅ User có thể nhập số dư ban đầu khi tạo ví
- ✅ Balance được tính: `initialBalance + ΣINCOME - ΣEXPENSE`

### ✨ 3. Services mới
- ✅ **AiService**: AI advice tài chính + parse giọng nói
- ✅ **UserService**: Quản lý profile, đổi password, xóa account

### ✨ 4. Controllers mới
- ✅ **UserController**: `/api/user/*`
- ✅ **AiController**: `/api/ai/*`

### ✨ 5. Postman Collection cập nhật
- ✅ Folder mới: "7. User Profile"
- ✅ Folder mới: "8. AI & Voice"
- ✅ Tất cả requests tạo ví đã có `initialBalance`

---

## 🗄️ BƯỚC 1: Cập nhật Database

### ⭐ CÁCH KHUYẾN NGHỊ (Tự động - Dễ nhất):

Bạn đang dùng `spring.jpa.hibernate.ddl-auto=update` trong `application.properties`, nên chỉ cần:

```bash
# 1. Stop backend (nếu đang chạy)
Ctrl+C

# 2. Start lại backend
./mvnw spring-boot:run
# Hoặc nếu dùng IDE: Run BackendApplication.java
```

✅ **Hibernate sẽ tự động thêm cột `INITIAL_BALANCE` vào bảng WALLETS!**

### Kiểm tra kết quả:

```sql
-- Kết nối Oracle SQL Developer và chạy:
DESCRIBE WALLETS;
-- Hoặc
SELECT * FROM WALLETS;
```

Bạn sẽ thấy cột mới:
```
INITIAL_BALANCE    NUMBER(15,2)    DEFAULT 0
```

### (Tùy chọn) Cách 2: Chạy SQL thủ công

Nếu muốn tự kiểm soát, chạy script này:

```sql
-- Thêm cột INITIAL_BALANCE
ALTER TABLE WALLETS 
ADD INITIAL_BALANCE NUMBER(15,2) DEFAULT 0 NOT NULL;

-- Cập nhật dữ liệu cũ (set initialBalance = balance hiện tại)
UPDATE WALLETS 
SET INITIAL_BALANCE = BALANCE 
WHERE INITIAL_BALANCE = 0;

COMMIT;
```

---

## 📂 BƯỚC 1A: Cập nhật Categories Mặc Định (MỚI - QUAN TRỌNG!)

### ⭐ TẠI SAO CẦN CẬP NHẬT?

Hệ thống categories mới có **22 categories mặc định** thay vì 15 categories cũ. Danh sách mới:
- ✅ Phù hợp với thói quen chi tiêu người Việt
- ✅ Tối ưu cho AI parsing giọng nói
- ✅ Cân bằng giữa đầy đủ và không làm user bối rối

### 🔧 CÁCH CẬP NHẬT:

**Bước 1**: Xóa categories cũ (nếu có):

```sql
-- Xóa tất cả categories mặc định cũ
DELETE FROM CATEGORIES WHERE IS_DEFAULT = 1 AND USER_ID IS NULL;
COMMIT;
```

**Bước 2**: Chạy script insert categories mới:

📁 File: `backend/src/main/resources/db/insert-default-categories.sql`

Hoặc copy SQL này và chạy trong Oracle SQL Developer:

```sql
-- ============================================
-- EXPENSE Categories (16 categories)
-- ============================================

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Ăn uống', 'EXPENSE', '🍔', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Đi chợ / Siêu thị', 'EXPENSE', '🛒', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Cafe / Trà sữa', 'EXPENSE', '🧋', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Ăn ngoài / Nhà hàng', 'EXPENSE', '🍽️', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Di chuyển', 'EXPENSE', '🚗', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Đi xe ôm / Taxi', 'EXPENSE', '🏍️', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Mua sắm', 'EXPENSE', '🛍️', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Giải trí', 'EXPENSE', '🎮', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Sức khỏe', 'EXPENSE', '💊', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Làm đẹp', 'EXPENSE', '💅', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Tiền nhà / Điện nước', 'EXPENSE', '🏠', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Internet / Điện thoại', 'EXPENSE', '📱', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Học phí / Sách vở', 'EXPENSE', '📚', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Quà tặng', 'EXPENSE', '🎁', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Hỗ trợ gia đình', 'EXPENSE', '👨‍👩‍👧‍👦', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Tiết kiệm / Đầu tư', 'EXPENSE', '💰', 1, NULL);

-- ============================================
-- INCOME Categories (6 categories)
-- ============================================

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Lương chính', 'INCOME', '💵', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Thưởng', 'INCOME', '🎉', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Freelance / Làm thêm', 'INCOME', '💼', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Tiền lãi tiết kiệm', 'INCOME', '📈', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Tiền quà / Cho vay', 'INCOME', '🎁', 1, NULL);

INSERT INTO CATEGORIES (ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID) 
VALUES (COMMON_SEQ.NEXTVAL, 'Khác', 'INCOME', '💸', 1, NULL);

COMMIT;
```

### ✅ Kiểm tra kết quả:

```sql
-- Xem tất cả categories mặc định
SELECT ID, NAME, TYPE, ICON, IS_DEFAULT, USER_ID 
FROM CATEGORIES 
WHERE IS_DEFAULT = 1 AND USER_ID IS NULL
ORDER BY TYPE, ID;

-- Đếm số lượng (phải ra 22)
SELECT TYPE, COUNT(*) 
FROM CATEGORIES 
WHERE IS_DEFAULT = 1 AND USER_ID IS NULL
GROUP BY TYPE;
-- Kết quả:
-- EXPENSE: 16
-- INCOME:  6
```

### 🎯 LƯU Ý QUAN TRỌNG:

1. **Categories mặc định là GLOBAL** (USER_ID = NULL, IS_DEFAULT = 1)
   - Tất cả user đều thấy được
   - User KHÔNG thể xóa categories mặc định
   
2. **User có thể tự tạo thêm custom categories**
   - Custom categories có USER_ID = user's id, IS_DEFAULT = 0
   - User chỉ xóa được custom categories của mình

3. **Logic hiện có đã support sẵn**
   - ✅ `CategoryService.getAllCategories()` → Trả về default + custom
   - ✅ `CategoryService.createCategory()` → Tạo custom category
   - ✅ `CategoryService.deleteCategory()` → Chỉ xóa được custom, không xóa được default

---

## 🧪 BƯỚC 2: Test với Postman

### Import Postman Collection:

1. Mở **Postman**
2. Click **Import** (góc trên bên trái)
3. Chọn file: `backend/request-postman/ViVu-Postman-Collection.json`
4. Click **Import**

### ✅ Test các tính năng mới:

#### Test 1: Tạo ví với số dư ban đầu

```json
// Request: POST /api/wallets
{
    "name": "Ví tiền mặt",
    "initialBalance": 5000000,  // ← MỚI: 5 triệu VNĐ
    "currency": "VND"
}

// Response:
{
    "id": 123,
    "name": "Ví tiền mặt",
    "initialBalance": 5000000,   // Số dư ban đầu
    "balance": 5000000,          // Balance hiện tại (ban đầu = initialBalance)
    "currency": "VND",
    "createdAt": "2026-02-23T10:00:00"
}
```

#### Test 2: Kiểm tra balance sau giao dịch

```json
// 1. Tạo giao dịch CHI 300k
POST /api/transactions
{
    "walletId": 123,
    "amount": 300000,
    "type": "EXPENSE",
    "categoryId": 1
}

// 2. Xem lại ví
GET /api/wallets/123

// Response:
{
    "initialBalance": 5000000,  // Không đổi
    "balance": 4700000          // Đã trừ 300k (5 triệu - 300k)
}

// 3. Thêm THU 10tr
POST /api/transactions
{
    "walletId": 123,
    "amount": 10000000,
    "type": "INCOME",
    "categoryId": 11
}

// 4. Xem lại ví
GET /api/wallets/123

// Response:
{
    "initialBalance": 5000000,    // Không đổi
    "balance": 14700000           // 5tr - 300k + 10tr = 14.7tr
}
```

#### Test 3: User Profile (MỚI)

```json
// Xem profile
GET /api/user/profile
// → Trả về: id, username, email, fullName, avatarUrl...

// Cập nhật profile
PUT /api/user/profile
{
    "fullName": "Nguyễn Văn B",
    "email": "newmail@example.com"
}

// Đổi mật khẩu
POST /api/user/change-password
{
    "oldPassword": "password123",
    "newPassword": "newpass456"
}
```

#### Test 3A: Categories API (MỚI - QUAN TRỌNG!)

```json
// 1. Xem tất cả categories (default + custom)
GET /api/categories
Header: Authorization: Bearer <JWT_TOKEN>

// Response: 22 categories mặc định + custom categories
[
    {
        "id": 1,
        "name": "Ăn uống",
        "type": "EXPENSE",
        "icon": "🍔",
        "isDefault": true,
        "userId": null  // null = default category
    },
    {
        "id": 2,
        "name": "Đi chợ / Siêu thị",
        "type": "EXPENSE",
        "icon": "🛒",
        "isDefault": true,
        "userId": null
    },
    // ... 20 categories khác
]

// 2. Xem categories theo type
GET /api/categories?type=EXPENSE  // Chỉ expense (16 cái)
GET /api/categories?type=INCOME   // Chỉ income (6 cái)

// 3. Tạo custom category
POST /api/categories
Header: Authorization: Bearer <JWT_TOKEN>
{
    "name": "Du lịch",
    "type": "EXPENSE",
    "icon": "✈️"
}

// Response:
{
    "id": 101,
    "name": "Du lịch",
    "type": "EXPENSE",
    "icon": "✈️",
    "isDefault": false,  // ← custom category
    "userId": 10         // ← user's id
}

// 4. Thử xóa default category → Lỗi
DELETE /api/categories/1  // ID 1 = "Ăn uống" (default)
// Response: 400 Bad Request
// "Không thể xóa category mặc định!"

// 5. Xóa custom category → OK
DELETE /api/categories/101  // ID 101 = "Du lịch" (custom)
// Response: 200 OK

// 6. User khác KHÔNG xóa được custom category của mình
// User A tạo category ID 101
// User B thử xóa:
DELETE /api/categories/101
// Response: 400 Bad Request
// "Bạn không có quyền xóa category này!"
```

✅ **Lợi ích của hệ thống categories mới:**
- User mới đăng ký → Thấy ngay 22 categories sẵn có
- AI parse giọng nói dễ dàng hơn (có danh sách reference)
- User vẫn tự do tạo thêm categories cá nhân
- System categories được bảo vệ, không bị xóa nhầm

#### Test 4: AI Advice (MỚI)

```json
// Tạo lời khuyên AI
POST /api/ai/advice/generate
{
    "period": "2026-02"  // Tháng 2/2026
}

// Response: 
{
    "id": 1,
    "adviceText": "📊 PHÂN TÍCH TÀI CHÍNH CỦA BẠN:\n\n💰 Tổng thu nhập: 15,000,000 VNĐ\n💸 Tổng chi tiêu: 3,450,000 VNĐ\n✅ Tuyệt vời! Bạn đang tiết kiệm được 11,550,000 VNĐ...",
    "period": "2026-02",
    "generatedAt": "2026-02-23T..."
}

// Xem lịch sử
GET /api/ai/advice/history
```

#### Test 5: Voice Parsing (MỚI)

```json
// Parse giọng nói
POST /api/ai/voice/parse
{
    "voiceText": "Chi 50 nghìn tiền cafe"
}

// Response:
{
    "type": "EXPENSE",
    "amount": 50000,
    "note": "Chi 50 nghìn tiền cafe"
}

// Dùng kết quả này để tạo transaction:
POST /api/transactions
{
    "walletId": 123,
    "amount": 50000,
    "type": "EXPENSE",
    "categoryId": 1,
    "note": "Chi 50 nghìn tiền cafe"
}
```

---

## 📊 BƯỚC 3: Kiểm tra tính toán Balance

### Cách 1: Balance lưu sẵn (hiện tại đang dùng)
- Balance được update realtime mỗi khi có transaction
- Nhanh, không cần tính toán

### Cách 2: Tính động (để verify)
Backend có method `getCurrentBalance()` để tính lại từ công thức:

```java
// WalletService.java
public BigDecimal getCurrentBalance(Long walletId) {
    // Formula: initialBalance + ΣINCOME - ΣEXPENSE
    return initialBalance + sumIncome - sumExpense;
}
```

Có thể dùng để verify balance có đúng không.

---

## 🔥 BƯỚC 4: Test Flow Hoàn Chỉnh

### Kịch bản: User mới sử dụng app

```bash
# 1. Đăng ký
POST /api/auth/register
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
# → Tự động tạo "Ví chính" với balance = 0

# 2. Tạo ví tiền mặt với số dư ban đầu 3 triệu
POST /api/wallets
{
    "name": "Ví tiền mặt",
    "initialBalance": 3000000
}
# → walletId = 2, balance = 3,000,000

# 3. Nhận lương 15 triệu
POST /api/transactions
{
    "walletId": 2,
    "amount": 15000000,
    "type": "INCOME",
    "categoryId": 11
}
# → balance = 3tr + 15tr = 18 triệu

# 4. Chi tiêu 2.5 triệu
POST /api/transactions
{
    "walletId": 2,
    "amount": 2500000,
    "type": "EXPENSE",
    "categoryId": 1
}
# → balance = 18tr - 2.5tr = 15.5 triệu

# 5. Xem báo cáo tháng
GET /api/reports/monthly?year=2026&month=2
# → totalIncome: 15tr, totalExpense: 2.5tr, balance: 15.5tr

# 6. Tạo AI advice
POST /api/ai/advice/generate
{
    "period": "2026-02"
}
# → Phân tích chi tiêu và đưa ra lời khuyên
```

---

## 🎯 Kết Quả Mong Đợi

### ✅ Database
- [x] Bảng WALLETS có cột INITIAL_BALANCE
- [x] Dữ liệu cũ đã được migrate (nếu có)

### ✅ Backend
- [x] Ví mới tạo có initialBalance
- [x] Balance tính đúng: initialBalance + thu - chi
- [x] UserController hoạt động (profile, change password)
- [x] AiController hoạt động (advice, voice parse)

### ✅ Postman
- [x] Tất cả requests "Tạo Ví" có field initialBalance
- [x] Folder "7. User Profile" với 4 endpoints
- [x] Folder "8. AI & Voice" với 3 endpoints

---

## 🐛 Troubleshooting

### Lỗi: Column INITIAL_BALANCE not found

**Nguyên nhân**: Hibernate chưa update database

**Giải pháp**:
```bash
# 1. Stop backend
# 2. Kiểm tra application.properties:
spring.jpa.hibernate.ddl-auto=update  # Phải là 'update' không phải 'none'

# 3. Start lại backend
./mvnw spring-boot:run

# 4. Check log xem có auto-DDL statement không:
# Hibernate: alter table WALLETS add INITIAL_BALANCE number(15,2) default 0
```

### Lỗi: initialBalance null khi tạo ví

**Nguyên nhân**: Request body không có initialBalance

**Giải pháp**: Thêm vào request body:
```json
{
    "name": "Ví chính",
    "initialBalance": 0,     // ← Thêm dòng này (có thể = 0 hoặc bất kỳ số nào)
    "currency": "VND"
}
```

### Ví cũ không có initialBalance

**Nguyên nhân**: Ví được tạo trước khi update

**Giải pháp**: Chạy SQL update:
```sql
-- Set initialBalance = balance hiện tại cho các ví cũ
UPDATE WALLETS 
SET INITIAL_BALANCE = BALANCE 
WHERE INITIAL_BALANCE IS NULL OR INITIAL_BALANCE = 0;
COMMIT;
```

---

## 📚 API Documentation

### Wallet APIs
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/api/wallets` | - | Lấy tất cả ví |
| POST | `/api/wallets` | `{ name, initialBalance, currency }` | Tạo ví mới |
| GET | `/api/wallets/{id}` | - | Xem chi tiết ví |
| DELETE | `/api/wallets/{id}` | - | Xóa ví |

### Category APIs (CẬP NHẬT)
| Method | Endpoint | Query Params | Body | Mô tả |
|--------|----------|--------------|------|-------|
| GET | `/api/categories` | `?type=EXPENSE/INCOME` | - | Lấy tất cả categories (default + custom) |
| GET | `/api/categories/{id}` | - | - | Xem chi tiết 1 category |
| POST | `/api/categories` | - | `{ name, type, icon }` | Tạo custom category |
| DELETE | `/api/categories/{id}` | - | - | Xóa custom category (không xóa được default) |

**Lưu ý Categories:**
- ✅ 22 categories mặc định (16 EXPENSE + 6 INCOME) tự động có sẵn
- ✅ User có thể tạo thêm custom categories
- ✅ Không thể xóa default categories
- ✅ Chỉ xóa được custom categories của chính mình

### User APIs (MỚI)
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/api/user/profile` | - | Xem profile |
| PUT | `/api/user/profile` | `{ fullName, email, avatarUrl }` | Cập nhật profile |
| POST | `/api/user/change-password` | `{ oldPassword, newPassword }` | Đổi mật khẩu |
| DELETE | `/api/user/account` | `{ password }` | Xóa tài khoản |

### AI APIs (MỚI)
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/api/ai/advice/generate` | `{ period }` | Tạo AI advice |
| GET | `/api/ai/advice/history` | - | Lịch sử advice |
| POST | `/api/ai/voice/parse` | `{ voiceText }` | Parse giọng nói |

---

## 🎉 Hoàn tất!

Dự án của bạn giờ đã có:
- ✅ 7 Services đầy đủ (Auth, Wallet, Category, Transaction, Report, User, AI)
- ✅ **Hệ thống Categories chuyên nghiệp** (22 categories mặc định + custom)
- ✅ Quản lý số dư ví chuyên nghiệp với initialBalance
- ✅ User profile management
- ✅ AI advice tài chính (với categories tối ưu cho AI parsing)
- ✅ Voice input parsing
- ✅ Postman collection đầy đủ để test

**Điểm mạnh của Categories mới:**
- 🎯 22 categories chuẩn cho thị trường Việt Nam
- 🤖 Tối ưu cho AI parsing giọng nói
- 👤 Cân bằng giữa default categories và cá nhân hóa
- 🔒 Bảo vệ system categories, tránh xóa nhầm
- 📱 Giống Money Lover, Wallet, Toshl Finance (best practice)

**Lưu ý**: 
- AiService hiện dùng logic giả lập. Có thể tích hợp OpenAI/Gemini/Claude API sau.
- Voice parsing hiện đơn giản. Có thể nâng cấp bằng NLP model.
- **Nhớ chạy SQL script insert 22 categories mặc định!** (Bước 1A)

Happy coding! 🚀
