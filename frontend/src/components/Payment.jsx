import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin từ Booking page
  const bookingData = location.state || {
    movieTitle: 'Avengers: Endgame',
    movieId: 1,
    theater: 'CGV Vincom Center',
    time: '11:00',
    seats: ['A1', 'A2'],
    totalPrice: 170000
  };

  const [paymentInfo, setPaymentInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'momo' // momo, zalopay, bank, movie
  });

  const [accountBalance, setAccountBalance] = useState(0);
  const [balanceError, setBalanceError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Load thông tin user và số dư từ localStorage khi component mount
  useEffect(() => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setPaymentInfo(prev => ({
          ...prev,
          fullName: userInfo.fullName || '',
          email: userInfo.email || '',
          phone: userInfo.phone || ''
        }));
      }

      // Load số dư tài khoản
      const balance = localStorage.getItem('accountBalance');
      if (balance) {
        setAccountBalance(parseFloat(balance));
      } else {
        setAccountBalance(0);
      }
    } catch (error) {
      console.error('Error reading user info:', error);
    }
  }, []);

  // Kiểm tra số dư khi paymentMethod thay đổi
  useEffect(() => {
    if (paymentInfo.paymentMethod === 'movie') {
      if (accountBalance < bookingData.totalPrice) {
        setBalanceError('Số dư không đủ. Vui lòng nạp thêm hoặc chọn hình thức thanh toán khác.');
      } else {
        setBalanceError('');
      }
    } else {
      setBalanceError('');
    }
  }, [paymentInfo.paymentMethod, accountBalance, bookingData.totalPrice]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!paymentInfo.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!paymentInfo.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(paymentInfo.phone)) {
      newErrors.phone = 'Số điện thoại phải là 10 chữ số, bắt đầu bằng 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm sinh mã vé (tạm thời, sẽ lấy từ database sau)
  const generateTicketCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(3, '0');
    return `MV${year}${month}${day}${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra số dư nếu chọn thanh toán bằng tài khoản Movie
    if (paymentInfo.paymentMethod === 'movie') {
      if (accountBalance < bookingData.totalPrice) {
        setBalanceError('Số dư không đủ. Vui lòng nạp thêm hoặc chọn hình thức thanh toán khác.');
        return;
      }
    }
    
    if (validateForm()) {
      // Mở popup xác nhận thay vì thanh toán trực tiếp
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPayment = () => {
      // Sinh mã vé
      const ticketCode = generateTicketCode();
      
      // Lưu thông tin vé vào localStorage (tạm thời, sẽ lưu vào database sau)
      const newBooking = {
        id: Date.now(),
        movie: bookingData.movieTitle,
        theater: bookingData.theater,
        date: new Date().toISOString().split('T')[0],
        time: bookingData.time,
        seats: bookingData.seats,
        total: bookingData.totalPrice,
        status: 'purchased', // Mặc định là 'purchased', có thể đổi thành 'cancelled' nếu huỷ
        ticketCode: ticketCode
      };

      // Lấy danh sách vé hiện có
      try {
        const existingHistory = localStorage.getItem('bookingHistory');
        let bookingHistory = [];
        if (existingHistory) {
          bookingHistory = JSON.parse(existingHistory);
        }
        bookingHistory.unshift(newBooking); // Thêm vào đầu danh sách
        localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
      } catch (error) {
        console.error('Error saving booking history:', error);
      }

      // Nếu thanh toán bằng tài khoản Movie, trừ tiền từ tài khoản
      if (paymentInfo.paymentMethod === 'movie') {
        const newBalance = accountBalance - bookingData.totalPrice;
        setAccountBalance(newBalance);
        localStorage.setItem('accountBalance', newBalance.toString());
      }

      // Lưu vào lịch sử thanh toán
      try {
        const existingPaymentHistory = localStorage.getItem('paymentHistory');
        let paymentHistory = [];
        if (existingPaymentHistory) {
          paymentHistory = JSON.parse(existingPaymentHistory);
        }
        
        const newPayment = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: bookingData.totalPrice,
          method: getPaymentMethodName(paymentInfo.paymentMethod),
          status: 'paid',
          type: 'purchase',
          ticketCode: ticketCode
        };
        
        paymentHistory.unshift(newPayment);
        localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
      } catch (error) {
        console.error('Error saving payment history:', error);
      }

    // Xử lý thanh toán ở đây
    setShowConfirmModal(false);
    
    // Xóa thông tin booking đã lưu sau khi thanh toán thành công
    const bookingKey = `booking_${bookingData.movieId}`;
    localStorage.removeItem(bookingKey);
    
    // Lưu thông tin thành công để hiển thị trong popup
    setSuccessData({
      movieTitle: bookingData.movieTitle,
      theater: bookingData.theater,
      time: bookingData.time,
      seats: bookingData.seats,
      totalPrice: bookingData.totalPrice,
      paymentMethod: getPaymentMethodName(paymentInfo.paymentMethod),
      ticketCode: ticketCode,
      email: paymentInfo.email
    });
    
    // Hiển thị popup thành công
    setShowSuccessModal(true);
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      momo: 'Ví MoMo',
      zalopay: 'Ví ZaloPay',
      bank: 'Chuyển khoản ngân hàng',
      movie: 'Tài khoản Movie'
    };
    return methods[method] || method;
  };

  return (
    <>
      <Header />
      <div className="payment-container">
      <div className="payment-header">
        <h1>Thanh Toán</h1>
      </div>

      <div className="payment-content">
        <div className="booking-summary-section">
          <h2>Thông Tin Đặt Vé</h2>
          <div className="summary-card">
            <div className="summary-item">
              <span className="label">Phim:</span>
              <span className="value">{bookingData.movieTitle}</span>
            </div>
            <div className="summary-item">
              <span className="label">Rạp:</span>
              <span className="value">{bookingData.theater}</span>
            </div>
            <div className="summary-item">
              <span className="label">Giờ chiếu:</span>
              <span className="value">{bookingData.time}</span>
            </div>
            <div className="summary-item">
              <span className="label">Ghế đã chọn:</span>
              <span className="value">{bookingData.seats.join(', ')}</span>
            </div>
            <div className="summary-item">
              <span className="label">Số lượng vé:</span>
              <span className="value">{bookingData.seats.length} vé</span>
            </div>
            <div className="summary-item total">
              <span className="label">Tổng tiền:</span>
              <span className="value">{bookingData.totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        <div className="payment-form-section">
          <h2>Thông Tin Thanh Toán</h2>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="fullName">Họ và Tên <span className="required">*</span></label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={paymentInfo.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={paymentInfo.email}
                onChange={handleChange}
                placeholder="Nhập email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số Điện Thoại <span className="required">*</span></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={paymentInfo.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Phương Thức Thanh Toán <span className="required">*</span></label>
              <div className="payment-methods">
                <label className={`payment-method-option ${paymentInfo.paymentMethod === 'momo' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentInfo.paymentMethod === 'momo'}
                    onChange={handleChange}
                  />
                  <span>Ví MoMo</span>
                </label>
                <label className={`payment-method-option ${paymentInfo.paymentMethod === 'zalopay' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="zalopay"
                    checked={paymentInfo.paymentMethod === 'zalopay'}
                    onChange={handleChange}
                  />
                  <span>Ví ZaloPay</span>
                </label>
                <label className={`payment-method-option ${paymentInfo.paymentMethod === 'bank' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentInfo.paymentMethod === 'bank'}
                    onChange={handleChange}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
                <label className={`payment-method-option ${paymentInfo.paymentMethod === 'movie' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="movie"
                    checked={paymentInfo.paymentMethod === 'movie'}
                    onChange={handleChange}
                  />
                  <span>Thanh toán bằng tài khoản Movie</span>
                </label>
              </div>
              {paymentInfo.paymentMethod === 'movie' && (
                <div className="movie-account-info">
                  <p className="balance-text">Số dư tài khoản: <span className="balance-amount">{accountBalance.toLocaleString('vi-VN')}đ</span></p>
                  {balanceError && (
                    <div className="balance-error">
                      <p>{balanceError}</p>
                      <button 
                        type="button"
                        className="topup-redirect-btn"
                        onClick={() => navigate('/account', { state: { tab: 'payment' } })}
                      >
                        Nạp tiền
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                Quay lại
              </button>
              <button type="submit" className="submit-btn">
                Xác Nhận Thanh Toán
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Modal xác nhận thanh toán */}
    {showConfirmModal && (
      <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
        <div className="modal-content payment-confirm-modal" onClick={(e) => e.stopPropagation()}>
          <h3>Xác Nhận Thanh Toán</h3>
          <div className="payment-confirm-info">
            <p>Bạn có chắc chắn muốn thanh toán với thông tin sau:</p>
            <div className="confirm-booking-details">
              <p><strong>Phim:</strong> {bookingData.movieTitle}</p>
              <p><strong>Rạp:</strong> {bookingData.theater}</p>
              <p><strong>Giờ chiếu:</strong> {bookingData.time}</p>
              <p><strong>Ghế:</strong> {bookingData.seats.join(', ')}</p>
              <p><strong>Phương thức thanh toán:</strong> {getPaymentMethodName(paymentInfo.paymentMethod)}</p>
              {paymentInfo.paymentMethod === 'movie' && (
                <p><strong>Số dư sau thanh toán:</strong> {(accountBalance - bookingData.totalPrice).toLocaleString('vi-VN')}đ</p>
              )}
              <p className="confirm-total"><strong>Tổng tiền:</strong> {bookingData.totalPrice.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
              No
            </button>
            <button className="confirm-btn" onClick={handleConfirmPayment}>
              Yes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal thanh toán thành công */}
    {showSuccessModal && successData && (
      <div className="modal-overlay" onClick={() => {
        setShowSuccessModal(false);
        navigate('/');
      }}>
        <div className="modal-content payment-success-modal" onClick={(e) => e.stopPropagation()}>
          <h3 style={{ color: '#28a745', marginBottom: '20px' }}>✓ Thanh Toán Thành Công!</h3>
          <div className="payment-success-info">
            <div className="success-booking-details">
              <p><strong>Phim:</strong> {successData.movieTitle}</p>
              <p><strong>Rạp:</strong> {successData.theater}</p>
              <p><strong>Giờ chiếu:</strong> {successData.time}</p>
              <p><strong>Ghế:</strong> {successData.seats.join(', ')}</p>
              <p><strong>Phương thức thanh toán:</strong> {successData.paymentMethod}</p>
              <p><strong>Tổng tiền:</strong> {successData.totalPrice.toLocaleString('vi-VN')}đ</p>
              <p style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #28a745' }}>
                <strong style={{ color: '#28a745' }}>Mã vé:</strong> 
                <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '16px', marginLeft: '10px' }}>
                  {successData.ticketCode}
                </span>
              </p>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Mã vé đã được gửi đến email: {successData.email}
              </p>
            </div>
          </div>
          <div className="modal-actions">
            <button 
              className="confirm-btn" 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              style={{ width: '100%' }}
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Payment;

