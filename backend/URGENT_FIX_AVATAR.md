# 🚨 URGENT FIX: Avatar Upload Error

## Vấn đề
```
SQL Error: 1406, SQLState: 22001
Data truncation: Data too long for column 'avatar' at row 1
```

## Nguyên nhân
- Database column `avatar` đang là **TEXT** (max 64KB)
- Base64 image thường **200KB-2MB**
- Cần đổi sang **LONGTEXT** (max 4GB)

---

## ⚡ Giải pháp nhanh

### Chọn 1 trong 3 cách:

### **Cách 1: MySQL Workbench** ⭐ Khuyên dùng
1. Mở **MySQL Workbench**
2. Connect vào database của bạn
3. Mở file: `backend/fix_avatar_column.sql`
4. Click nút **Execute** (⚡ icon)
5. ✅ Xong!

### **Cách 2: phpMyAdmin**
1. Login vào **phpMyAdmin** (thường là `http://localhost/phpmyadmin`)
2. Chọn database `movie_ticket_booking`
3. Click tab **SQL**
4. Copy đoạn này và paste vào:
```sql
ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;
```
5. Click **Go**
6. ✅ Xong!

### **Cách 3: Command Line**
```bash
# Mở PowerShell tại thư mục backend
cd backend

# Chạy lệnh (thay YOUR_PASSWORD bằng password MySQL của bạn)
Get-Content fix_avatar_column.sql | mysql -u root -pYOUR_PASSWORD
```

---

## ✅ Kiểm tra đã fix thành công chưa

Chạy query này trong MySQL:
```sql
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'movie_ticket_booking' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'avatar';
```

**Kết quả mong muốn:**
```
COLUMN_TYPE
-----------
longtext
```

---

## 🔄 Sau khi fix

1. **KHÔNG CẦN** restart backend (đã chạy rồi)
2. Reload trang Account: http://localhost:5173/account
3. Thử upload ảnh avatar lại
4. ✅ Thành công!

---

## 📊 Thông tin kỹ thuật

| Type | Max Size | Suitable for |
|------|----------|--------------|
| TEXT | 64 KB | ❌ Không đủ cho Base64 image |
| MEDIUMTEXT | 16 MB | ⚠️ Có thể đủ nhưng không an toàn |
| **LONGTEXT** | 4 GB | ✅ Hoàn hảo cho Base64 images |

---

## ❓ Nếu vẫn lỗi

1. Kiểm tra xem đã chạy SQL thành công chưa
2. Kiểm tra kết quả bằng query ở trên
3. Nếu vẫn là `text` thay vì `longtext` → Chạy lại SQL
4. Clear browser cache và thử lại
