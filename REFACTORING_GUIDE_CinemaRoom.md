# Hướng Dẫn Refactoring: CinemaRoom Entity

## 📋 Tổng Quan Thay Đổi

### ✅ Những gì đã hoàn thành:

#### 1. **Backend Entity & Repository**
- ✅ Tạo entity `CinemaRoom` với các trường:
  - `id`, `theater_id` (FK), `name`, `total_rows`, `total_cols`
  - Mỗi phòng có cấu hình ghế riêng
- ✅ Tạo `CinemaRoomRepository` với query methods
- ✅ Tạo `CinemaRoomDto` cho API response

#### 2. **Service Layer**
- ✅ `CinemaRoomService` với CRUD operations
- ✅ `CinemaRoomServiceImpl` implement đầy đủ logic
- ✅ Cập nhật `ShowtimeServiceImpl`:
  - `createShowtime()` nhận `roomId` từ request
  - `initializeSeatsForShowtime()` dùng `room.totalRows` và `room.totalCols`
  - `convertToDto()` trả về `roomId` và `roomName`

#### 3. **Controller & Security**
- ✅ `CinemaRoomController` với endpoints:
  - `GET /api/rooms` - List all rooms (có filter theaterId)
  - `GET /api/rooms/{id}` - Get room by ID
  - `POST /api/rooms` - Create new room
  - `PUT /api/rooms/{id}` - Update room
  - `DELETE /api/rooms/{id}` - Delete room
- ✅ Cập nhật `SecurityConfig`: Thêm `/api/rooms/**` vào permitAll

#### 4. **Entity Updates**
- ✅ `Showtime` entity:
  - Thêm `room` (ManyToOne to CinemaRoom)
  - Xóa `roomNumber` (Int) - deprecated
  - Giữ `theater` để query nhanh
- ✅ `ShowtimeDto`:
  - Thêm `roomId` và `roomName`

#### 5. **System Settings**
- ✅ Xóa `TOTAL_ROWS` và `SEATS_PER_ROW` khỏi SystemSettings
- ✅ Mỗi phòng giờ có config riêng

#### 6. **Database Migration**
- ✅ Tạo file `migration_add_cinema_rooms.sql`
- Script bao gồm:
  1. CREATE TABLE cinema_rooms
  2. ALTER TABLE showtimes ADD room_id
  3. Tạo default "Phòng 1" cho mỗi theater
  4. Migrate data: Update showtimes với room_id
  5. DROP room_number column
  6. DELETE obsolete system_settings

---

## 🚀 Các Bước Tiếp Theo

### **Bước 1: Chạy Migration SQL**
```bash
# Kết nối MySQL
mysql -u root -p movie_ticket_booking

# Chạy migration script
source D:/3. PTIT/05. HK 4/07. Lap trinh web/3. Do an/movie-ticket-booking/backend/migration_add_cinema_rooms.sql
```

**Lưu ý**: Script sẽ:
- Tạo bảng `cinema_rooms`
- Tạo "Phòng 1" (10 hàng x 8 cột) cho mỗi theater
- Link tất cả showtimes hiện tại với phòng default
- Xóa `room_number` column

### **Bước 2: Restart Backend**
```bash
cd backend
java -jar target/movieticket-0.0.1-SNAPSHOT.jar
```

### **Bước 3: Test APIs**

#### **3.1 Test CinemaRoom APIs**
```bash
# Get all rooms
GET http://localhost:8080/api/rooms

# Get rooms by theater
GET http://localhost:8080/api/rooms?theaterId=1

# Create new room
POST http://localhost:8080/api/rooms
{
  "theaterId": 1,
  "name": "Phòng VIP",
  "totalRows": 8,
  "totalCols": 12
}

# Update room
PUT http://localhost:8080/api/rooms/2
{
  "name": "Phòng IMAX",
  "totalRows": 12,
  "totalCols": 15
}
```

#### **3.2 Test Showtime APIs (Updated)**
```bash
# Create showtime (bây giờ cần roomId)
POST http://localhost:8080/api/showtimes
{
  "movieId": 2,
  "roomId": 1,  # <--- BẮT BUỘC (thay vì theaterId)
  "showDate": "2026-03-05",
  "showTime": "20:00:00",
  "price": 85000
}

# Get showtimes (response có roomId, roomName)
GET http://localhost:8080/api/showtimes?movieId=2
```

#### **3.3 Verify Seats**
```bash
# Kiểm tra ghế được tạo theo config của room
GET http://localhost:8080/api/showtimes/2/seats

# Số ghế phải = room.totalRows * room.totalCols
```

---

## 📊 Database Schema Changes

### **Before (Old)**
```
showtimes
├── id
├── movie_id
├── theater_id
├── room_number (INT) ❌ REMOVED
├── show_date
└── ...

system_settings
├── TOTAL_ROWS = 10 ❌ REMOVED
└── SEATS_PER_ROW = 8 ❌ REMOVED
```

### **After (New)**
```
cinema_rooms ⭐ NEW TABLE
├── id
├── theater_id (FK)
├── name
├── total_rows
├── total_cols
└── ...

showtimes
├── id
├── movie_id
├── theater_id (kept for quick query)
├── room_id (FK) ⭐ NEW
├── show_date
└── ...

seats
├── showtime_id
├── seat_number (follows room config)
└── ...
```

---

## 🔄 Business Logic Changes

### **Old Flow (Hardcoded)**
1. Tạo showtime → Dùng TOTAL_ROWS=10, SEATS_PER_ROW=8 từ SystemSettings
2. Init seats → Tất cả phòng có 80 ghế (10x8)

### **New Flow (Dynamic)**
1. Admin tạo phòng chiếu: "Phòng 1" (10x8=80 ghế), "Phòng VIP" (8x12=96 ghế)
2. Tạo showtime → Chọn phòng cụ thể (roomId)
3. Init seats → Dùng config của phòng đó (room.totalRows x room.totalCols)

---

## 🎯 Frontend Updates Needed (TODO)

### **1. Admin Panel - Quản Lý Phòng Chiếu**
Cần tạo giao diện mới để:
- Liệt kê rooms theo theater
- Thêm/sửa/xóa room
- Hiển thị total_rows, total_cols, total_seats

### **2. Admin Panel - Tạo Showtime**
Update form:
- ~~Chọn theater~~ → **Chọn room** (dropdownlist)
- Fetch rooms theo theaterId
- Hiển thị thông tin room (10x8=80 ghế)

### **3. User Booking Page**
Không cần thay đổi nhiều:
- API `/api/showtimes` giờ trả về `roomName` → Có thể hiển thị
- Sơ đồ ghế vẫn fetch từ `/api/showtimes/{id}/seats`
- Logic chọn ghế không đổi

---

## ⚠️ Breaking Changes & Migration Notes

### **API Breaking Changes**
1. **POST /api/showtimes** - Request body changed:
   ```diff
   {
     "movieId": 2,
   - "theaterId": 1,  ❌ Không còn dùng
   + "roomId": 1,     ✅ Bắt buộc mới
     "showDate": "2026-03-05",
     ...
   }
   ```

2. **ShowtimeDto response** - Added fields:
   ```diff
   {
     "id": 2,
     "movieId": 1,
     "theaterId": 1,
     "theaterName": "CGV",
   + "roomId": 1,        ✅ New
   + "roomName": "Phòng 1", ✅ New
     "showDate": "2026-03-05",
     ...
   }
   ```

### **Database Migration Safety**
- ✅ Script tự động tạo default room cho các theater hiện có
- ✅ Script migrate tất cả showtimes sang room_id
- ✅ Có verification queries để check data integrity
- ⚠️ Nên backup database trước khi chạy migration

---

## 📝 Test Checklist

- [ ] Migration SQL chạy thành công
- [ ] Backend build và start không lỗi
- [ ] GET /api/rooms trả về danh sách phòng
- [ ] POST /api/rooms tạo phòng mới thành công
- [ ] POST /api/showtimes với roomId hoạt động
- [ ] Init seats sử dụng config từ room
- [ ] Số ghế = room.totalRows * room.totalCols
- [ ] Frontend vẫn hiển thị booking page (có thể chưa hiện roomName)

---

## 🐛 Troubleshooting

### **Lỗi: "Cinema room not found"**
→ Đảm bảo đã chạy migration SQL để tạo rooms

### **Lỗi: "Theater not found"**
→ RoomId không tồn tại, check bảng cinema_rooms

### **Seats vẫn là 80 ghế dù room là 96 ghế**
→ Xóa seats cũ và gọi lại `/api/showtimes/{id}/initialize-seats`

### **Frontend không hiển thị roomName**
→ Frontend chưa update, cần sửa code để hiển thị field mới

---

## 📚 Tài Liệu Tham Khảo

- Entity: `backend/src/main/java/com/movieticket/movieticket/entity/CinemaRoom.java`
- Controller: `backend/src/main/java/com/movieticket/movieticket/controller/CinemaRoomController.java`
- Migration: `backend/migration_add_cinema_rooms.sql`
- Service: `backend/src/main/java/com/movieticket/movieticket/service/impl/CinemaRoomServiceImpl.java`
