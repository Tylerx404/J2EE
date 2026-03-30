# Plan Chi Tiet Xay Dung SQLite Local DB Cho User Chua Dang Nhap

## 1. Muc tieu
- Them `guest mode` tren mobile, song song voi luong `authenticated`.
- Du lieu tai chinh cua guest duoc luu hoan toan o SQLite tren thiet bi.
- Pham vi v1 cua guest mode:
  - wallet
  - category
  - transaction
  - history
  - dashboard
  - bao cao co ban
- Khong ho tro profile/account actions va AI advice cho guest o v1.
- Du lieu guest duoc giu lai qua cac lan mo app va co chuan bi cho luong import sau khi user dang nhap.

## 2. Session va Dieu Huong

### 2.1 Session mode moi
- Thay `isLoggedIn` hien tai bang:
  - `logged_out`
  - `guest`
  - `authenticated`

### 2.2 AsyncStorage chi luu session-level state
- Chi dung `AsyncStorage` cho:
  - `jwt_token`
  - `user_info`
  - `session_mode`
  - `guest_import_pending`
- Khong dung `AsyncStorage` de luu wallet/category/transaction/report data.

### 2.3 Login/Register flow
- Man hinh login them CTA: `Dung thu khong can dang nhap`.
- Khi user chon CTA nay:
  - set `session_mode = guest`
  - init SQLite DB neu chua co
  - seed du lieu mac dinh neu chua seed
  - vao bo tab tai chinh

### 2.4 Tab visibility
- `guest`: hien cac tab tai chinh, an `Profile`.
- `authenticated`: hien day du tab, bao gom `Profile`.

### 2.5 Sau khi login/register
- Neu DB guest co du lieu chua import:
  - hien prompt:
    - `Import du lieu local`
    - `Giu rieng`
    - `De sau`
- Neu user chon:
  - `Import du lieu local`: goi luong import len backend
  - `Giu rieng`: session authenticated chi doc du lieu server, guest DB giu nguyen
  - `De sau`: danh dau nhac lai sau

## 3. Nen Tang SQLite

### 3.1 Dependency
- Them `expo-sqlite`.
- Tao 1 DB rieng cho guest, vi du: `guest_finance.db`.

### 3.2 Bootstrap DB
- Khi mo guest mode:
  - mo DB
  - bat `PRAGMA foreign_keys = ON`
  - doc `PRAGMA user_version`
  - chay migration neu can

### 3.3 Bang can tao

#### `app_meta`
- Muc dich:
  - luu schema version
  - seed state
  - import state
- Cau truc:
  - `key TEXT PRIMARY KEY`
  - `value TEXT`
  - `updated_at TEXT`

#### `guest_profile`
- Muc dich:
  - co dinh mo hinh 1 guest profile / thiet bi
- Cau truc:
  - `id INTEGER PRIMARY KEY CHECK(id=1)`
  - `created_at TEXT`
  - `updated_at TEXT`

#### `wallets`
- Cau truc:
  - `local_id TEXT PRIMARY KEY`
  - `name TEXT`
  - `currency TEXT`
  - `initial_balance TEXT`
  - `balance TEXT`
  - `is_default INTEGER`
  - `created_at TEXT`
  - `updated_at TEXT`

#### `categories`
- Cau truc:
  - `local_id TEXT PRIMARY KEY`
  - `name TEXT`
  - `type TEXT`
  - `icon TEXT`
  - `is_default INTEGER`
  - `created_at TEXT`
  - `updated_at TEXT`

#### `transactions`
- Cau truc:
  - `local_id TEXT PRIMARY KEY`
  - `wallet_local_id TEXT NOT NULL`
  - `category_local_id TEXT NULL`
  - `amount TEXT NOT NULL`
  - `type TEXT NOT NULL`
  - `note TEXT`
  - `transaction_date TEXT NOT NULL`
  - `origin TEXT NOT NULL`
  - `voice_text TEXT NULL`
  - `created_at TEXT`
  - `updated_at TEXT`
  - `migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY'`

### 3.4 Quy uoc du lieu
- Tien luu dang `TEXT` de tranh loi float trong JavaScript.
- Tat ca cong tru tien di qua helper chung.
- Khong thao tac truc tiep bang `number` cho balance logic.
- Toan bo thoi gian dung ISO-8601 string.

### 3.5 Seed du lieu ban dau
- Lan dau mo guest app:
  - tao `guest_profile`
  - tao vi mac dinh `"Vi chinh"`, `VND`, `0`
  - seed category mac dinh
- Danh sach category mac dinh phai dung chung source-of-truth voi he thong category server.

## 4. Rule Nghiep Vu Local

### 4.1 Wallet
- Guest moi luon co dung 1 vi mac dinh:
  - name: `"Vi chinh"`
  - currency: `VND`
  - initial balance: `0`
- Khong cho xoa wallet neu con transaction.

### 4.2 Balance
- Cong thuc:
  - `initialBalance + tong INCOME - tong EXPENSE`
- Khi tao transaction:
  - insert transaction
  - update balance wallet
  - 2 buoc nay phai nam trong cung 1 SQLite transaction
- Khi xoa transaction:
  - rollback balance nguoc type
  - xoa transaction
  - 2 buoc nay phai nam trong cung 1 SQLite transaction

### 4.3 Category
- Khong cho xoa category mac dinh.
- Category custom duoc tao/xoa local.

### 4.4 Transaction
- Khong cho transaction tro toi wallet/category khong ton tai.
- `type` chi nhan:
  - `EXPENSE`
  - `INCOME`

### 4.5 Report
- Khi `sessionMode = guest`, report phai doc tu SQLite.
- Khong goi backend cho report guest.

## 5. Refactor Tang Data/Service

### 5.1 Muc tieu
- Tao data layer trung gian thay vi de screen goi backend truc tiep.
- Service hien tai tro thanh facade chon adapter theo `sessionMode`.

### 5.2 Chia 2 adapter
- `guest`:
  - doc/ghi SQLite
- `authenticated`:
  - doc/ghi backend API

### 5.3 Cac nhom repo can co
- `walletRepo`
- `categoryRepo`
- `transactionRepo`
- `reportRepo`

### 5.4 Helper chung
- `money helper`
  - parse/format/cong/tru/so sanh
- `date helper`
  - now ISO, parse period, date range theo thang
- `db helper`
  - open DB
  - migration
  - run transaction
- `id helper`
  - tao `local_id`
- `mapper helper`
  - map local row sang shape UI dang dung

### 5.5 Contract data tra ve
- Local repo phai map ve shape tuong thich voi DTO backend hien tai:
  - `WalletResponse`-like
  - `TransactionResponse`-like
  - `CategoryResponse`-like
  - `MonthlyReportDetailResponse`-like
- Muc tieu:
  - screen khong can biet data den tu SQLite hay API

## 6. Thay Doi UI De Guest Dung Duoc

### 6.1 HomeScreen
- Hien tai HomeScreen phu thuoc nhieu vao voice parse backend.
- Can bo sung luong tao transaction thu cong.

### 6.2 Form tao giao dich
- Tao form hoac bottom sheet `Add Transaction`.
- Dung chung cho:
  - guest mode
  - authenticated mode
- Cac field:
  - wallet
  - category
  - amount
  - type
  - note
  - transactionDate

### 6.3 Voice button
- Trong guest mode:
  - disable voice parse
  - hoac hien thong bao: `Tinh nang nay can dang nhap`

### 6.4 Cac screen can chuyen qua service trung gian
- `HomeScreen`
- `HistoryScreen`
- `WalletScreen`
- `CategoryScreen`
- `ReportScreen`

### 6.5 ReportScreen guest mode
- Chi hien thong ke local.
- An phan AI advice.

## 7. Luong Import Sau Dang Nhap

### 7.1 Dieu kien
- Sau khi user dang nhap hoac dang ky thanh cong:
  - kiem tra guest SQLite co du lieu chua import hay khong

### 7.2 Payload import
- Build payload tu SQLite:
  - `wallets[]`
  - `categories[]`
  - `transactions[]`
- Moi phan tu deu kem `local_id`

### 7.3 Contract de xuat

#### `GuestImportRequest`
- `wallets[]`
- `categories[]`
- `transactions[]`

#### `GuestImportResponse`
- `importedCounts`
- `walletMap`
- `categoryMap`
- `transactionMap`

### 7.4 Thu tu import
- Import wallet truoc
- Import category sau
- Import transaction cuoi cung

### 7.5 Rule import
- Category mac dinh match theo:
  - `name`
  - `type`
  - `isDefault = true`
- Category custom:
  - tao moi neu chua co
- Transaction:
  - dung map `local_id -> server id`
- Idempotency dua tren `local_id` de retry khong tao du lieu trung lap

### 7.6 Sau import
- Neu import thanh cong:
  - danh dau transaction local la `IMPORTED`
  - chi xoa local khi user xac nhan
- Neu user chon `Giu rieng`:
  - authenticated session chi doc server
  - guest DB van ton tai rieng

## 8. Public APIs / Interfaces / Types

### 8.1 App-level session type
- `logged_out | guest | authenticated`

### 8.2 DB bootstrap API
- `initGuestDb`
- `migrateGuestDb`
- `seedGuestDataIfNeeded`
- `runInDbTransaction`

### 8.3 Repository contracts
- `walletRepo`
- `categoryRepo`
- `transactionRepo`
- `reportRepo`

### 8.4 Nguyen tac interface
- UI khong goi truc tiep SQLite/API.
- UI chi goi service/repository trung tinh theo nghiep vu.

## 9. Test Plan

### 9.1 Khoi tao
- Mo app lan dau, chon guest
- DB duoc tao dung
- Co 1 wallet mac dinh
- Seed category chi chay 1 lan

### 9.2 Wallet
- Tao wallet local thanh cong
- So du khoi tao dung
- Khong xoa duoc wallet dang co transaction

### 9.3 Transaction
- Tao `EXPENSE` lam giam balance dung
- Tao `INCOME` lam tang balance dung
- Xoa transaction rollback balance dung
- Khong tao transaction neu wallet/category invalid

### 9.4 Category
- Tao category custom local thanh cong
- Xoa category custom thanh cong
- Khong xoa duoc category mac dinh

### 9.5 Persistence
- Dong app mo lai
- Wallet, category, transaction, report local van con

### 9.6 Guest isolation
- Guest mode khong goi API profile/report/transaction backend
- Report guest doc tu SQLite

### 9.7 Import
- Login khi guest da co du lieu se hien prompt import
- Retry import khong tao duplicate
- Chon `Giu rieng` khong mat du lieu guest

## 10. Assumptions va Defaults
- V1 chi ho tro 1 guest profile tren moi thiet bi.
- V1 chi lam finance core cho guest.
- Khong lam profile/account management cho guest.
- Khong ho tro AI advice cho guest.
- Voice parse khong ho tro cho guest trong giai doan nay.
- Manual transaction entry la bat buoc de guest su dung duoc app.
- Source-of-truth cho default categories phai thong nhat giua local seed va server import.
