# 🎬 Movie Ticket Booking System

> Full-stack web application for booking movie tickets - PTIT 2025

## 📋 Tổng quan

Hệ thống đặt vé xem phim trực tuyến được xây dựng với Spring Boot (Backend) và React (Frontend).

## 🛠️ Công nghệ sử dụng

### Backend
- **Framework:** Spring Boot 3.5.7
- **Language:** Java 17
- **Database:** MySQL
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18
- **Language:** JavaScript/TypeScript
- **Build Tool:** Vite
- **UI Library:** TailwindCSS / Material-UI (tùy chọn)
- **State Management:** React Context / Redux Toolkit
- **HTTP Client:** Axios

## 📁 Cấu trúc dự án

```
movie-ticket-booking/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/movieticket/movieticket/
│   │   │   │       ├── config/          # Security, CORS, JWT config
│   │   │   │       ├── controller/      # REST API endpoints
│   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │       ├── entity/          # JPA Entities
│   │   │   │       ├── repository/      # Database repositories
│   │   │   │       ├── service/         # Business logic
│   │   │   │       └── security/        # JWT, Authentication
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service calls
│   │   ├── context/            # React Context
│   │   ├── utils/              # Helper functions
│   │   └── App.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Java 17 hoặc cao hơn
- Node.js 18+ và npm/yarn
- MySQL 8.0+
- Git

### 1️⃣ Clone repository

```bash
git clone <repository-url>
cd movie-ticket-booking
```

### 2️⃣ Setup Backend

```bash
cd backend

# Cấu hình database trong application.properties
# Tạo database: movieticket_db

# Chạy ứng dụng
./mvnw spring-boot:run

# Hoặc sử dụng IDE (IntelliJ IDEA, VS Code)
```

**Backend sẽ chạy tại:** `http://localhost:8080`

**API Documentation (Swagger):** `http://localhost:8080/swagger-ui.html`

### 3️⃣ Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Cấu hình API URL trong file .env
# VITE_API_BASE_URL=http://localhost:8080/api

# Chạy development server
npm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Movies
- `GET /api/movies` - Danh sách phim
- `GET /api/movies/{id}` - Chi tiết phim
- `POST /api/movies` - Thêm phim (Admin)
- `PUT /api/movies/{id}` - Cập nhật phim (Admin)
- `DELETE /api/movies/{id}` - Xóa phim (Admin)

### Bookings
- `POST /api/bookings` - Đặt vé
- `GET /api/bookings/user/{userId}` - Lịch sử đặt vé
- `GET /api/bookings/{id}` - Chi tiết đơn đặt vé

## 🔐 Authentication Flow

1. User đăng ký/đăng nhập
2. Backend trả về JWT token
3. Frontend lưu token vào localStorage
4. Mọi request sau đó gửi kèm header: `Authorization: Bearer <token>`

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 📦 Build & Deploy

### Build Backend
```bash
cd backend
./mvnw clean package
# File JAR: target/movieticket-0.0.1-SNAPSHOT.jar
```

### Build Frontend
```bash
cd frontend
npm run build
# Build output: dist/
```

## 👥 Đóng góp

1. Fork project
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

This project is licensed under the MIT License

## 📧 Liên hệ

- **Tên dự án:** Movie Ticket Booking System
- **Trường:** PTIT (Posts and Telecommunications Institute of Technology)
- **Năm:** 2025
- **Môn học:** Lập trình Web (HK4)

---

⭐ **Happy Coding!** ⭐
