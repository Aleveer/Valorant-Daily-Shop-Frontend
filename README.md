# vShop Frontend - Vue.js

Frontend ứng dụng vShop được chuyển đổi từ React sang Vue.js.

## Tính năng

- Đăng nhập với Riot Games
- Xem shop Valorant (skins, bundles, night market, accessories)
- Xem profile và loadout
- Quản lý wishlist
- Đa ngôn ngữ (i18n)

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

## Build cho production

```bash
npm run build
```

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/      # Các component Vue
│   ├── views/          # Các trang view
│   ├── stores/         # Pinia stores
│   ├── utils/          # Utility functions
│   ├── router/         # Vue Router configuration
│   ├── App.vue         # Root component
│   └── main.js         # Entry point
├── package.json
└── vite.config.js
```

## Cấu hình

Tạo file `.env` trong thư mục `frontend/`:

```
VITE_API_URL=http://localhost:3000
```

## Đăng nhập

Ứng dụng sử dụng Riot Games OAuth để đăng nhập. Khi click vào nút "Login with Riot Games", một popup window sẽ mở ra để bạn đăng nhập. Sau khi đăng nhập thành công, ứng dụng sẽ tự động lấy dữ liệu từ Riot API.

## Lưu ý

- Do hạn chế cross-origin của Riot Games, việc đăng nhập có thể cần popup window hoặc redirect trực tiếp.
- Access token và entitlements token được lưu trong localStorage để sử dụng lại.
- Dữ liệu user và wishlist được persist trong localStorage.
