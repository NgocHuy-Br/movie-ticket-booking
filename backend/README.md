# 🎬 Movie Ticket Booking - Backend (Spring Boot)

> REST API for Movie Ticket Booking System

## 🛠️ Tech Stack

- **Framework:** Spring Boot 3.5.7
- **Language:** Java 17
- **Database:** MySQL 8.0
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT
- **Build Tool:** Maven 3.9+
- **Documentation:** Swagger/OpenAPI

## 📁 Cấu trúc project

```
backend/
├── src/main/java/com/movieticket/movieticket/
│   ├── MovieTicketBookingApplication.java  # Main class
│   ├── config/                             # Configuration classes
│   │   ├── SecurityConfig.java             # Spring Security config
│   │   ├── CorsConfig.java                 # CORS configuration
│   │   └── SwaggerConfig.java              # API documentation
│   ├── controller/                         # REST Controllers
│   │   ├── AuthController.java
│   │   ├── MovieController.java
│   │   ├── BookingController.java
│   │   └── UserController.java
│   ├── dto/                                # Data Transfer Objects
│   │   ├── request/
│   │   └── response/
│   ├── entity/                             # JPA Entities
│   │   ├── User.java
│   │   ├── Movie.java
│   │   ├── Cinema.java
│   │   ├── Showtime.java
│   │   ├── Seat.java
│   │   └── Booking.java
│   ├── repository/                         # JPA Repositories
│   │   ├── UserRepository.java
│   │   ├── MovieRepository.java
│   │   └── BookingRepository.java
│   ├── service/                            # Service interfaces
│   │   ├── AuthService.java
│   │   ├── MovieService.java
│   │   └── BookingService.java
│   ├── service/impl/                       # Service implementations
│   │   ├── AuthServiceImpl.java
│   │   ├── MovieServiceImpl.java
│   │   └── BookingServiceImpl.java
│   └── security/                           # Security components
│       ├── JwtTokenProvider.java
│       ├── JwtAuthenticationFilter.java
│       └── CustomUserDetailsService.java
└── src/main/resources/
    ├── application.properties              # Main configuration
    └── data.sql                            # (Optional) Seed data
```

## 🚀 Getting Started

### Yêu cầu

- ✅ Java 17 hoặc cao hơn ([Download JDK](https://adoptium.net/))
- ✅ Maven 3.9+ (hoặc dùng Maven wrapper: `./mvnw`)
- ✅ MySQL 8.0+ đang chạy
- ✅ IDE: IntelliJ IDEA / VS Code với Extension Pack for Java

### 1. Cài đặt Database

```sql
-- Kết nối MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE movieticket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (optional, để bảo mật)
CREATE USER 'movieticket_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON movieticket_db.* TO 'movieticket_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Cấu hình application.properties

Mở file `src/main/resources/application.properties` và cập nhật:

```properties
# Application Name
spring.application.name=MovieTicketBooking

# Server Port
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/movieticket_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=your-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=http://localhost:3000,http://localhost:5173

# Logging
logging.level.com.movieticket=DEBUG
logging.level.org.springframework.security=DEBUG
```

### 3. Build và chạy project

#### Cách 1: Dùng Maven Wrapper (Khuyến nghị)

```bash
# Build project
./mvnw clean install

# Chạy application
./mvnw spring-boot:run
```

#### Cách 2: Dùng Maven đã cài đặt

```bash
mvn clean install
mvn spring-boot:run
```

#### Cách 3: Chạy từ IDE

- **IntelliJ IDEA:** Nhấn nút ▶️ Run bên cạnh `main()` method
- **VS Code:** Open `MovieTicketBookingApplication.java` → Run Java

### 4. Kiểm tra application đã chạy

```bash
# Mở browser hoặc dùng curl
curl http://localhost:8080/actuator/health

# Expected response:
{"status":"UP"}
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       # Đăng ký tài khoản
POST   /api/auth/login          # Đăng nhập (trả về JWT token)
POST   /api/auth/refresh        # Refresh token
GET    /api/auth/me             # Thông tin user hiện tại
```

### Movies
```
GET    /api/movies              # Danh sách phim
GET    /api/movies/{id}         # Chi tiết phim
GET    /api/movies/search       # Tìm kiếm phim
POST   /api/movies              # Thêm phim (ADMIN only)
PUT    /api/movies/{id}         # Cập nhật phim (ADMIN only)
DELETE /api/movies/{id}         # Xóa phim (ADMIN only)
```

### Showtimes
```
GET    /api/showtimes           # Danh sách suất chiếu
GET    /api/showtimes/{id}      # Chi tiết suất chiếu
GET    /api/showtimes/movie/{movieId}  # Suất chiếu của phim
```

### Bookings
```
POST   /api/bookings            # Đặt vé
GET    /api/bookings            # Lịch sử đặt vé (user)
GET    /api/bookings/{id}       # Chi tiết đơn đặt
PUT    /api/bookings/{id}/cancel # Hủy vé
```

## 📚 API Documentation (Swagger)

Sau khi chạy app, truy cập:

```
http://localhost:8080/swagger-ui.html
```

Tại đây bạn có thể:
- ✅ Xem toàn bộ API
- ✅ Test API trực tiếp trên giao diện web
- ✅ Xem request/response schema

## 🧪 Testing

### Run all tests
```bash
./mvnw test
```

### Run specific test class
```bash
./mvnw test -Dtest=MovieServiceTest
```

### Run with coverage
```bash
./mvnw clean test jacoco:report
# Report: target/site/jacoco/index.html
```

## 🔐 Security & JWT

### JWT Token Flow

1. Client gửi `POST /api/auth/login` với username/password
2. Server xác thực và trả về JWT token
3. Client lưu token (localStorage/cookies)
4. Mọi request sau gửi kèm header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Example với curl

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Gọi protected API
curl http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### Lỗi: Port 8080 đã được sử dụng
```bash
# Windows: Tìm và kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Hoặc đổi port trong application.properties
server.port=8081
```

### Lỗi: Cannot connect to MySQL
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Kiểm tra connection string trong application.properties
# Đảm bảo username/password đúng
```

### Lỗi: Table doesn't exist
```properties
# Set ddl-auto = create để tạo lại tables (CHỈ dùng lần đầu)
spring.jpa.hibernate.ddl-auto=create
```

## 📦 Build Production

```bash
# Build JAR file
./mvnw clean package -DskipTests

# File output: target/movieticket-0.0.1-SNAPSHOT.jar

# Run JAR
java -jar target/movieticket-0.0.1-SNAPSHOT.jar
```

## 🔧 Useful Maven Commands

```bash
# Clean project
./mvnw clean

# Compile
./mvnw compile

# Run tests
./mvnw test

# Package (create JAR)
./mvnw package

# Install to local Maven repo
./mvnw install

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📝 Notes

- Database schema sẽ tự động được tạo khi chạy lần đầu (ddl-auto=update)
- JWT secret key phải đổi trong production
- CORS origins cần cập nhật theo domain thực tế khi deploy
- Sử dụng `application-dev.properties` và `application-prod.properties` cho các môi trường khác nhau

## 🤝 Contributing

Xem file `../README.md` (root project) để biết hướng dẫn đóng góp.

---

**Backend Status:** ✅ Ready for Development

**Next Steps:** 
1. Cấu hình database
2. Chạy application
3. Test API với Swagger UI
4. Tích hợp với Frontend
