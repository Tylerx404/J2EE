## Chạy project

```bash
npm install
npm run start
```

## Env cho mobile

Mobile dùng:

- `APP_ENV`: chọn profile app `development | preview | production`
- `EXPO_PUBLIC_API_URL`: URL backend public để app gọi API

1. Tạo file `.env` từ `.env.example`
2. Khai báo API backend:

```env
APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

Giá trị nên dùng theo môi trường:

- Web hoặc iOS simulator: `http://localhost:8080/api`
- Android emulator: `http://10.0.2.2:8080/api`
- Thiết bị thật cùng Wi-Fi: `http://<LAN_IP_MAY_TINH>:8080/api`

Ví dụ máy thật:

```env
APP_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api
```

## App config theo môi trường

Expo giờ dùng [app.config.js](/home/tyler/GitHub/J2EE/mobile/app.config.js) để đổi metadata theo môi trường:

- `development`: app name có hậu tố `Dev`, package/bundle id có hậu tố `.dev`
- `preview`: app name có hậu tố `Preview`, package/bundle id có hậu tố `.preview`
- `production`: dùng tên và package chính thức

`eas.json` đã map sẵn:

- profile `development` -> `APP_ENV=development`
- profile `preview` -> `APP_ENV=preview`
- profile `production` -> `APP_ENV=production`

Lưu ý:

- `EXPO_PUBLIC_API_URL` là bắt buộc với `preview` và `production`
- nếu thiếu ở `development`, app sẽ fallback về `http://localhost:8080/api`

Sau khi đổi `.env`, hãy restart Expo:

```bash
npm run start
```

Nếu app chưa nhận biến mới, chạy:

```bash
npx expo start -c
```

Có thể kiểm tra config Expo đang resolve bằng:

```bash
npx expo config --type public
```

## Cấu trúc chính

- `src/screens/`: các màn hình chính
- `src/components/`: component dùng chung
- `src/services/`: gọi API backend và lưu trữ local
- `src/config/`: cấu hình môi trường cho app
