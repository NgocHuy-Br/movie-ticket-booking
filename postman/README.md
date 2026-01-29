# 📮 Postman Collection - Movie Ticket Booking API

## 🚀 Cách sử dụng

### 1. Import Collection vào Postman

1. Mở Postman Desktop App
2. Click **Import** (góc trên bên trái)
3. Chọn **files** hoặc kéo thả file:
   - `Movie-Ticket-Booking-API.postman_collection.json`
   - `Local.postman_environment.json`
4. Click **Import**

### 2. Chọn Environment

1. Click dropdown **No Environment** (góc trên bên phải)
2. Chọn **Local Development**

### 3. Test các API

Collection bao gồm 4 requests:

#### 🟢 Test APIs
- **Hello World** - GET `/api/test/hello`
- **Health Check** - GET `/api/test/health`
- **System Info** - GET `/api/test/info`
- **Echo Test** - POST `/api/test/echo`

### 4. Chạy toàn bộ Collection

1. Click vào collection **Movie Ticket Booking API**
2. Click **Run** (hoặc phím tắt `Ctrl+R`)
3. Click **Run Movie Ticket Booking API**
4. Xem kết quả tất cả requests!

## 🔧 Cấu hình

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8080` | Backend API URL |
| `jwt_token` | (empty) | JWT token for authenticated requests |

### Thay đổi base_url

Nếu backend chạy ở port khác:
1. Click vào **Local Development** environment
2. Sửa giá trị `base_url`
3. Click **Save**

## 📝 Lưu ý

- Đảm bảo backend đang chạy tại `http://localhost:8080`
- Kiểm tra MySQL đang hoạt động
- Status code thành công: `200 OK`

## 🔄 Sync với Git

File Postman collection đã được commit vào repository:
```
postman/
├── Movie-Ticket-Booking-API.postman_collection.json
├── Local.postman_environment.json
└── README.md
```

Khi làm việc nhóm, mọi người có thể import file này để có cùng một bộ test!

## 🎯 Tiếp theo

Khi phát triển thêm API mới (Auth, Movies, Bookings), hãy:
1. Tạo request mới trong Postman
2. Export collection: **...** → **Export** → **Collection v2.1**
3. Lưu đè file `Movie-Ticket-Booking-API.postman_collection.json`
4. Commit vào Git

---

Happy Testing! 🚀
