# J2EE

# Kiểm tra địa chỉ mạng hiện tại:
1.Mở Terminal trên máy tính, gõ: ipconfig
2.Tìm dòng IPv4 Address (thường bắt đầu bằng 192.168... hoặc 172...).
3.Cập nhật địa chỉ này vào file src/services/apiClient.js:

# Bạn có thể nhờ server của Expo build hộ (miễn phí):
1.Cài đặt EAS CLI: npm install -g eas-cli
2.Đăng nhập: eas login
3.Chạy Micro trên iPhone:eas build:configure
4.Tạo build: eas build --profile development --platform ios

# Chạy ứng dụng trực tiếp trên điện thoại androi:
1.Chạy lệnh build Android: ```bash
2.eas build --profile development --platform android
3.Đợi lấy QR Code: Quét bằng camera điện thoại để tải file APK về.
4.Mở App "mobile" trên Android: Tận hưởng cảm giác nhấn Mic và thấy sóng âm Waveform nhảy nhót mà không còn lỗi "Native module" nữa.
# Backup Oracle Docker local

Neu ban dang chay Oracle du phong bang Docker voi:

```powershell
docker run -d --name oracle-db -p 1521:1521 -e ORACLE_PASSWORD=SecretPassword123 -v oracle-data:/opt/oracle/oradata gvenzl/oracle-xe
```

co the backup volume bang script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-oracle-volume.ps1
```

Backup se duoc tao trong thu muc `backups/` duoi dang `.tar.gz`.

Mot so tuy chon hay dung:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-oracle-volume.ps1 -OutputName oracle-backup.tar.gz
powershell -ExecutionPolicy Bypass -File .\scripts\backup-oracle-volume.ps1 -BackupDir .\my-backups
powershell -ExecutionPolicy Bypass -File .\scripts\backup-oracle-volume.ps1 -KeepContainerStopped
```
