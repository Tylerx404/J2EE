-- Migration script: Thêm cột INITIAL_BALANCE vào bảng WALLETS
-- Mục đích: Hỗ trợ số dư ban đầu do user tự khai báo

-- Thêm cột INITIAL_BALANCE
ALTER TABLE WALLETS ADD COLUMN INITIAL_BALANCE DECIMAL(15,2) DEFAULT 0 NOT NULL;

-- Cập nhật dữ liệu cũ: Set INITIAL_BALANCE = BALANCE hiện tại cho các ví đã tồn tại
-- (Giả định rằng balance hiện tại là số dư ban đầu + các giao dịch đã có)
UPDATE WALLETS 
SET INITIAL_BALANCE = BALANCE 
WHERE INITIAL_BALANCE = 0;

-- Nếu muốn tính lại balance dựa trên initialBalance và transactions:
-- UPDATE WALLETS w
-- SET w.BALANCE = w.INITIAL_BALANCE + 
--     (SELECT COALESCE(SUM(CASE WHEN t.TYPE = 'INCOME' THEN t.AMOUNT ELSE -t.AMOUNT END), 0)
--      FROM TRANSACTIONS t
--      WHERE t.WALLET_ID = w.ID);

-- Kiểm tra kết quả
SELECT ID, NAME, INITIAL_BALANCE, BALANCE, CURRENCY FROM WALLETS;
