import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './Booking.css';

const Booking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // State management
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [localSelectedSeats, setLocalSelectedSeats] = useState({});

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/movies/${movieId}`);
        setMovie(response.data.data);
      } catch (error) {
        console.error('Error fetching movie:', error);
        alert('Không thể tải thông tin phim');
        navigate('/');
      }
    };

    fetchMovie();
  }, [movieId, navigate]);

  // Fetch showtimes and extract unique theaters
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/showtimes?movieId=${movieId}`);
        const showtimesData = response.data.data;
        console.log('[DEBUG] Showtimes data:', showtimesData);

        // Extract unique theaters from showtimes
        const uniqueTheaters = [];
        const theaterIds = new Set();

        showtimesData.forEach(showtime => {
          if (!theaterIds.has(showtime.theaterId)) {
            theaterIds.add(showtime.theaterId);
            uniqueTheaters.push({
              id: showtime.theaterId,
              name: showtime.theaterName
            });
          }
        });

        console.log('[DEBUG] Unique theaters:', uniqueTheaters);
        setTheaters(uniqueTheaters);
        setShowtimes(showtimesData);

        // Auto-select first theater
        if (uniqueTheaters.length > 0) {
          console.log('[DEBUG] Auto-selecting first theater:', uniqueTheaters[0].id);
          setSelectedTheater(uniqueTheaters[0].id);
        }
      } catch (error) {
        console.error('[ERROR] Error fetching showtimes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId]);

  // Fetch seats when showtime is selected
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedShowtime) {
        console.log('[DEBUG] No showtime selected');
        return;
      }

      console.log('[DEBUG] Fetching seats for showtime ID:', selectedShowtime);

      try {
        const response = await axios.get(`http://localhost:8080/api/showtimes/${selectedShowtime}/seats`);
        console.log('[DEBUG] Seats API response:', response.data);
        const seatsData = response.data.data;
        console.log('[DEBUG] Seats data array:', seatsData);

        // Convert seats array to object for easier lookup
        const seatsMap = {};
        seatsData.forEach(seat => {
          seatsMap[seat.seatNumber] = seat.status; // AVAILABLE or OCCUPIED
        });

        console.log('[DEBUG] Seats map:', seatsMap);
        console.log('[DEBUG] Total seats:', Object.keys(seatsMap).length);

        setSeats(seatsMap);
        setLocalSelectedSeats({});
        setSelectedSeats([]);
      } catch (error) {
        console.error('[ERROR] Error fetching seats:', error);
        console.error('[ERROR] Error details:', error.response?.data || error.message);
        alert('Không thể tải sơ đồ ghế. Vui lòng kiểm tra console để xem chi tiết lỗi.');
      }
    };

    fetchSeats();
  }, [selectedShowtime]);

  const handleSeatClick = (seatId) => {
    const seatStatus = seats[seatId];
    if (seatStatus === 'OCCUPIED') return; // Không thể chọn ghế đã được đặt bởi người khác

    const isCurrentlySelected = localSelectedSeats[seatId];

    setLocalSelectedSeats(prev => {
      const newSeats = { ...prev };
      if (isCurrentlySelected) {
        delete newSeats[seatId];
      } else {
        newSeats[seatId] = true;
      }
      return newSeats;
    });

    setSelectedSeats(prevSeats => {
      if (isCurrentlySelected) {
        return prevSeats.filter(s => s !== seatId);
      } else {
        if (prevSeats.includes(seatId)) {
          return prevSeats;
        }
        return [...prevSeats, seatId];
      }
    });
  };

  const getTotalPrice = () => {
    if (!selectedShowtime) return 0;
    const showtime = showtimes.find(s => s.id === selectedShowtime);
    if (!showtime) return 0;
    return selectedSeats.length * (showtime.price || 0);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế!');
      return;
    }

    if (!selectedShowtime) {
      alert('Vui lòng chọn suất chiếu!');
      return;
    }

    const showtime = showtimes.find(s => s.id === selectedShowtime);
    if (!showtime) return;

    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        movieTitle: movie.title,
        movieId: movieId,
        showtimeId: selectedShowtime,
        theater: showtime.theaterName,
        showDate: showtime.showDate,
        showTime: showtime.showTime,
        seats: selectedSeats,
        totalPrice: getTotalPrice()
      }
    });
  };

  // Get filtered showtimes for selected theater
  const getFilteredShowtimes = () => {
    if (!selectedTheater) return [];
    return showtimes.filter(s => s.theaterId === selectedTheater);
  };

  // Get rows and columns from seats data
  const getSeatsLayout = () => {
    const seatNumbers = Object.keys(seats);
    console.log('[DEBUG getSeatsLayout] seatNumbers:', seatNumbers);

    if (seatNumbers.length === 0) {
      console.log('[DEBUG getSeatsLayout] No seats, returning empty');
      return { rows: [], cols: [] };
    }

    const rows = [...new Set(seatNumbers.map(s => s.charAt(0)))].sort();
    const cols = [...new Set(seatNumbers.map(s => parseInt(s.substring(1))))].sort((a, b) => a - b);

    console.log('[DEBUG getSeatsLayout] rows:', rows);
    console.log('[DEBUG getSeatsLayout] cols:', cols);

    return { rows, cols };
  };

  if (loading || !movie) {
    return (
      <>
        <Header />
        <div className="booking-container">
          <div className="loading">Đang tải thông tin...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="booking-container">
        <div className="booking-header">
          <h1>Đặt Vé Xem Phim</h1>
          <h2>{movie.title} <span className="age-rating-badge">{movie.ageRating || '13+'}</span></h2>
        </div>

        <div className="booking-content">
          <div className="booking-info">
            <div className="info-section">
              <h3>Rạp xem</h3>
              {theaters.length === 0 ? (
                <p className="no-data">Không có rạp chiếu phim này</p>
              ) : (
                <div className="theater-buttons">
                  {theaters.map((theater) => (
                    <button
                      key={theater.id}
                      className={selectedTheater === theater.id ? 'active' : ''}
                      onClick={() => {
                        setSelectedTheater(theater.id);
                        setSelectedShowtime(null);
                        setSeats({});
                        setSelectedSeats([]);
                        setLocalSelectedSeats({});
                      }}
                    >
                      {theater.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="info-section">
              <h3>Khung giờ chiếu</h3>
              {!selectedTheater ? (
                <p className="no-data">Vui lòng chọn rạp</p>
              ) : getFilteredShowtimes().length === 0 ? (
                <p className="no-data">Không có suất chiếu</p>
              ) : (
                <div className="time-slots">
                  {getFilteredShowtimes().map((showtime) => {
                    const displayTime = `${showtime.showTime.substring(0, 5)}`;
                    const displayDate = new Date(showtime.showDate).toLocaleDateString('vi-VN');
                    return (
                      <button
                        key={showtime.id}
                        className={`time-slot ${selectedShowtime === showtime.id ? 'active' : ''}`}
                        onClick={() => {
                          console.log('[DEBUG CLICK] Time slot clicked, showtime:', showtime);
                          console.log('[DEBUG CLICK] Setting selectedShowtime to:', showtime.id);
                          setSelectedShowtime(showtime.id);
                          setSelectedSeats([]);
                          setLocalSelectedSeats({});
                        }}
                        title={`${displayDate} - ${displayTime}`}
                      >
                        <div className="time-slot-time">{displayTime}</div>
                        <div className="time-slot-date">{displayDate}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="seating-section">
            <h3>Chọn ghế</h3>
            {(() => {
              console.log('[DEBUG RENDER] selectedShowtime:', selectedShowtime);
              console.log('[DEBUG RENDER] seats:', seats);
              console.log('[DEBUG RENDER] Object.keys(seats).length:', Object.keys(seats).length);
              return null;
            })()}
            {!selectedShowtime ? (
              <p className="no-data">Vui lòng chọn suất chiếu</p>
            ) : Object.keys(seats).length === 0 ? (
              <p className="no-data">Đang tải sơ đồ ghế...</p>
            ) : (() => {
              const { rows, cols } = getSeatsLayout();
              console.log('[DEBUG LAYOUT] rows:', rows);
              console.log('[DEBUG LAYOUT] cols:', cols);

              return (
                <>
                  <div className="screen">MÀN HÌNH</div>

                  <div className="seats-legend">
                    <div className="legend-item">
                      <div className="seat-sample available"></div>
                      <span>Trống</span>
                    </div>
                    <div className="legend-item">
                      <div className="seat-sample selected"></div>
                      <span>Đang chọn</span>
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
                            const isSelected = localSelectedSeats[seatId];
                            const isOccupied = seatStatus === 'OCCUPIED';

                            return (
                              <button
                                key={seatId}
                                className={`seat ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'available'}`}
                                onClick={() => handleSeatClick(seatId)}
                                disabled={isOccupied}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="booking-summary">
            <div className="summary-info">
              <p><strong>Ghế đã chọn:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}</p>
              {selectedSeats.length > 0 && selectedShowtime && (
                <>
                  <p><strong>Giá vé:</strong> {showtimes.find(s => s.id === selectedShowtime)?.price?.toLocaleString('vi-VN')}đ/vé</p>
                  <p className="total-price"><strong>Tổng tiền:</strong> {getTotalPrice().toLocaleString('vi-VN')}đ</p>
                </>
              )}
              {selectedSeats.length === 0 && (
                <p className="no-selection">Vui lòng chọn ghế để xem giá</p>
              )}
            </div>
            <button className="confirm-btn" onClick={handleConfirm} disabled={selectedSeats.length === 0}>
              Xác nhận đặt vé
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;