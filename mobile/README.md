## RUN PROJECT:
```
npx expo start
```
```
npm start
```
```
npx run [tên script trong thư mục package]
```

src/components/: Các UI component dùng chung (Button, Card, Modal).

src/screens/: Các màn hình chính (Home, VoiceInput, History).

src/services/: Nơi gọi API cho Backend (Spring Boot) và AI (OpenAI).

src/hooks/: Quản lý logic như ghi âm (Recording) hoặc xác thực (Biometric).

src/store/: Quản lý trạng thái (Zustand hoặc Redux).

# UI kit:
Styling: Sử dụng NativeWind (Tailwind CSS cho React Native) để viết code UI cực nhanh.

Icons: Lucide-react-native (Rất hiện đại và hợp với style tối giản).

Charts: Victory-native hoặc react-native-chart-kit để làm báo cáo AI.

Gợi ý màu sắc cho App tài chính: > * Màu chủ đạo: #0047AB (Cobalt Blue) - Tạo cảm giác tin cậy.

Màu nhấn: #10B981 (Emerald Green) - Đại diện cho tiền bạc/tăng trưởng.

# Giao diện Voice Input (Trái tim của App)
Đây là phần khó nhất và cũng là phần "ăn tiền" nhất mà bạn đảm nhận.

1. Thư viện cần thiết
2. Logic giao diện ghi âm
Ngày mai khi bắt đầu code, bạn hãy tập trung vào 3 trạng thái của UI:

Idle (Chờ): Chỉ hiện một nút Mic lớn ở chính giữa màn hình.

Recording (Đang nói): Hiển thị sóng âm (Waveform) chuyển động để người dùng biết app đang nghe.

Processing (Đang xử lý): Hiển thị Loading kèm text "AI đang phân tích..." trong khi chờ LLM trả về kết quả JSON.

# GIT:
Nếu bạn không dùng tham số -b, bạn sẽ phải gõ 2 lệnh riêng biệt:

git branch feat/setup-project (Tạo nhánh nhưng vẫn đứng ở nhánh cũ).

git checkout feat/setup-project (Chuyển sang nhánh vừa tạo).