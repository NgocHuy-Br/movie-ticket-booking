import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import './Booking.css';

const Booking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  
  // Mock data - tạm thời hardcode
  const movieData = {
    1: { title: 'Avengers: Endgame', ageRating: '13+' },
    2: { title: 'Spider-Man: No Way Home', ageRating: '13+' },
    3: { title: 'The Matrix Resurrections', ageRating: '16+' },
    4: { title: 'Dune', ageRating: '13+' },
    5: { title: 'No Time to Die', ageRating: '16+' },
    6: { title: 'Black Widow', ageRating: '13+' },
    7: { title: 'Fast & Furious 9', ageRating: '16+' },
    8: { title: 'Shang-Chi', ageRating: '13+' },
  };

  const movie = movieData[movieId] || movieData[1];
  
  // Rạp xem - nhiều rạp hơn
  const theaters = [
    'CGV Vincom Center', 
    'CGV Vincom Đồng Khởi',
    'CGV Vincom Q9',
    'CGV Landmark 81', 
    'CGV Crescent Mall',
    'Lotte Cinema Đà Nẵng',
    'Lotte Cinema Hà Nội',
    'Galaxy Cinema Nguyễn Du',
    'Galaxy Cinema Quang Trung',
    'BHD Star Cineplex',
    'BHD Star Bitexco',
    'Mega GS Cinemas',
    'Beta Cinemas',
    'Cinestar Hai Bà Trưng'
  ];
  const [selectedTheater, setSelectedTheater] = useState(theaters[0]);
  
  // Khung giờ chiếu - từ 9:00 đến 21:00
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', 
    '13:00', '13:30', '14:00', '14:30', 
    '15:00', '15:30', '16:00', '16:30', 
    '17:00', '17:30', '18:00', '18:30', 
    '19:00', '19:30', '20:00', '20:30', 
    '21:00'
  ];
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  
  // Giá vé
  const ticketPrice = 85000;
  
  // Sơ đồ ghế: 8 hàng (A-H), 10 cột (1-10)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Trạng thái ghế: null = trống, 'selected' = đã chọn, 'occupied' = đã có người
  const [seats, setSeats] = useState(() => {
    const initialSeats = {};
    rows.forEach(row => {
      cols.forEach(col => {
        const seatId = `${row}${col}`;
        // Random một số ghế đã được đặt (20%)
        initialSeats[seatId] = Math.random() < 0.2 ? 'occupied' : null;
      });
    });
    return initialSeats;
  });
  
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Load lại thông tin booking từ localStorage khi component mount
  useEffect(() => {
    const bookingKey = `booking_${movieId}`;
    try {
      const savedBooking = localStorage.getItem(bookingKey);
      if (savedBooking) {
        const bookingData = JSON.parse(savedBooking);
        
        // Khôi phục rạp và giờ chiếu
        if (bookingData.theater && theaters.includes(bookingData.theater)) {
          setSelectedTheater(bookingData.theater);
        }
        if (bookingData.time && timeSlots.includes(bookingData.time)) {
          setSelectedTime(bookingData.time);
        }
        
        // Khôi phục trạng thái ghế
        if (bookingData.seats && bookingData.seatsState) {
          // Sử dụng seatsState đã lưu để giữ nguyên trạng thái occupied
          setSeats(bookingData.seatsState);
          setSelectedSeats(bookingData.seats);
        } else if (bookingData.seats) {
          // Fallback: nếu không có seatsState, chỉ khôi phục selected seats
          setSeats(prevSeats => {
            const newSeats = { ...prevSeats };
            bookingData.seats.forEach(seatId => {
              if (newSeats[seatId] !== 'occupied') {
                newSeats[seatId] = 'selected';
              }
            });
            return newSeats;
          });
          setSelectedSeats(bookingData.seats);
        }
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const handleSeatClick = (seatId) => {
    if (seats[seatId] === 'occupied') return; // Không thể chọn ghế đã có người
    
    const isCurrentlySelected = seats[seatId] === 'selected';
    
    setSeats(prev => {
      const newSeats = { ...prev };
      if (isCurrentlySelected) {
        newSeats[seatId] = null;
      } else {
        newSeats[seatId] = 'selected';
      }
      return newSeats;
    });
    
    // Update selected seats list separately to avoid race condition
    setSelectedSeats(prevSeats => {
      if (isCurrentlySelected) {
        return prevSeats.filter(s => s !== seatId);
      } else {
        // Check if seat is already in the list to avoid duplicates
        if (prevSeats.includes(seatId)) {
          return prevSeats;
        }
        return [...prevSeats, seatId];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedSeats.length * ticketPrice;
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế!');
      return;
    }
    
    // Lưu thông tin booking vào localStorage để khôi phục khi quay lại
    const bookingKey = `booking_${movieId}`;
    const bookingData = {
      theater: selectedTheater,
      time: selectedTime,
      seats: selectedSeats,
      seatsState: seats // Lưu cả trạng thái ghế
    };
    localStorage.setItem(bookingKey, JSON.stringify(bookingData));
    
    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        movieTitle: movie.title,
        movieId: movieId,
        theater: selectedTheater,
        time: selectedTime,
        seats: selectedSeats,
        totalPrice: getTotalPrice()
      }
    });
  };

  return (
    <>
      <Header />
      <div className="booking-container">
      <div className="booking-header">
        <h1>Đặt Vé Xem Phim</h1>
        <h2>{movie.title} <span className="age-rating-badge">{movie.ageRating}</span></h2>
      </div>

      <div className="booking-content">
        <div className="booking-info">
          <div className="info-section">
            <h3>Rạp xem</h3>
            <div className="theater-buttons">
              {theaters.map((theater) => (
                <button
                  key={theater}
                  className={selectedTheater === theater ? 'active' : ''}
                  onClick={() => setSelectedTheater(theater)}
                >
                  {theater}
                </button>
              ))}
            </div>
          </div>

          <div className="info-section">
            <h3>Khung giờ chiếu</h3>
            <div className="time-slots">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="seating-section">
          <h3>Chọn ghế</h3>
          <div className="screen">MÀN HÌNH</div>
          
          <div className="seats-legend">
            <div className="legend-item">
              <div className="seat-sample available"></div>
              <span>Trống</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample selected"></div>
              <span>Đã chọn</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample occupied"></div>
              <span>Đã đặt</span>
            </div>
          </div>

          <div className="seats-grid">
            <div className="row-numbers">
              {rows.map(row => (
                <div key={row} className="row-number">{row}</div>
              ))}
            </div>
            <div className="seats-container">
              {rows.map(row => (
                <div key={row} className="seat-row">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const seatStatus = seats[seatId];
                    return (
                      <button
                        key={seatId}
                        className={`seat ${seatStatus || 'available'}`}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={seatStatus === 'occupied'}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="booking-summary">
          <div className="summary-info">
            <p><strong>Ghế đã chọn:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}</p>
            {selectedSeats.length > 0 && (
              <>
                <p><strong>Giá vé:</strong> {ticketPrice.toLocaleString('vi-VN')}đ/vé</p>
                <p className="total-price"><strong>Tổng tiền:</strong> {getTotalPrice().toLocaleString('vi-VN')}đ</p>
              </>
            )}
            {selectedSeats.length === 0 && (
              <p className="no-selection">Vui lòng chọn ghế để xem giá</p>
            )}
          </div>
          <button className="confirm-btn" onClick={handleConfirm}>
            Xác nhận đặt vé
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Booking;

