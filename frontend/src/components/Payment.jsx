import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Notification from './Notification';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin từ Booking page
  const bookingData = location.state || {
    movieTitle: 'Avengers: Endgame',
    movieId: 1,
    showtimeId: 1,  // CRITICAL: Must have showtimeId for booking API
    theater: 'CGV Vincom Center',
    showDate: '2024-03-04',
    showTime: '11:00',
    seats: ['A1', 'A2'],
    totalPrice: 170000
  };

  // Debug log for booking data
  useEffect(() => {
    console.log('📋 Payment page received booking data:', bookingData);
    if (!bookingData.showtimeId) {
      console.error('❌ Missing showtimeId in booking data!');
    }
  }, []);

  const [paymentInfo, setPaymentInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'wallet' // visa, wallet
  });

  const [visaInfo, setVisaInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [accountBalance, setAccountBalance] = useState(0);
  const [balanceError, setBalanceError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load thông tin user và fetch số dư từ backend
  useEffect(() => {
    const loadUserInfo = async () => {
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

        // Fetch số dư tài khoản từ backend
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.data.accountBalance !== undefined) {
            setAccountBalance(data.data.accountBalance);
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  // ESC key handler for modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showConfirmModal) {
          setShowConfirmModal(false);
        } else if (showSuccessModal) {
          setShowSuccessModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showConfirmModal, showSuccessModal]);

  // Kiểm tra số dư khi paymentMethod thay đổi
  useEffect(() => {
    if (paymentInfo.paymentMethod === 'wallet') {
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

  const validateVisaCard = () => {
    const cardNumber = visaInfo.cardNumber.replace(/\s/g, '');
    if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
      return false;
    }

    if (!visaInfo.cardHolder.trim() || !/^[a-zA-Z\s]+$/.test(visaInfo.cardHolder)) {
      return false;
    }

    if (!visaInfo.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(visaInfo.expiryDate)) {
      return false;
    }

    const [month, year] = visaInfo.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    if (expiry < now) {
      return false;
    }

    if (!visaInfo.cvv || !/^\d{3,4}$/.test(visaInfo.cvv)) {
      return false;
    }

    return true;
  };

  const handleVisaInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    if (field === 'cardHolder') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
    }

    setVisaInfo(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    // Validate Visa card if visa payment is selected
    if (paymentInfo.paymentMethod === 'visa') {
      if (!validateVisaCard()) {
        newErrors.visa = 'Thông tin thẻ không hợp lệ. Vui lòng kiểm tra lại!';
      }
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

    // Kiểm tra số dư nếu chọn thanh toán bằng ví
    if (paymentInfo.paymentMethod === 'wallet') {
      if (accountBalance < bookingData.totalPrice) {
        setBalanceError('Số dư không đủ. Vui lòng nạp thêm hoặc chọn hình thức thanh toán khác.');
        return;
      }
    }

    if (validateForm()) {
      // Mở popup xác nhận thay vì thanh toán trực tiếp
      setShowConfirmModal(true);
    } else {
      if (errors.visa) {
        setNotification({ message: errors.visa, type: 'error' });
      }
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setShowConfirmModal(false);

      // Validate required booking data
      if (!bookingData.showtimeId || !bookingData.seats || bookingData.seats.length === 0) {
        setNotification({ message: 'Thông tin đặt vé không hợp lệ. Vui lòng quay lại trang đặt vé.', type: 'error' });
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      // Chuẩn bị request data
      const bookingRequest = {
        showtimeId: bookingData.showtimeId,
        seats: bookingData.seats,
        paymentMethod: paymentInfo.paymentMethod === 'wallet' ? 'wallet' : 'visa'
      };

      console.log('🎫 Creating booking with request:', bookingRequest);

      // Gọi API tạo booking
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingRequest)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        throw new Error('Lỗi server. Vui lòng kiểm tra backend logs.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Đặt vé thất bại');
      }

      const booking = result.data;

      // Cập nhật số dư nếu thanh toán bằng ví
      if (paymentInfo.paymentMethod === 'wallet') {
        // Fetch updated balance from backend
        const userResponse = await fetch('http://localhost:8080/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        if (userData.success && userData.data.accountBalance !== undefined) {
          setAccountBalance(userData.data.accountBalance);
          // Update localStorage userInfo
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          userInfo.accountBalance = userData.data.accountBalance;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          // Dispatch event to update header
          window.dispatchEvent(new Event('userProfileUpdate'));
        }
      }

      // Xóa thông tin booking đã lưu sau khi thanh toán thành công
      const bookingKey = `booking_${bookingData.movieId}`;
      localStorage.removeItem(bookingKey);

      // Lưu thông tin thành công để hiển thị trong popup
      setSuccessData({
        movieTitle: booking.movieTitle,
        theater: booking.theaterName,
        showDate: booking.showDate,
        showTime: booking.showTime,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        paymentMethod: getPaymentMethodName(paymentInfo.paymentMethod),
        ticketCode: booking.ticketCode,
        email: paymentInfo.email
      });

      // Hiển thị popup thành công
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      setNotification({ message: error.message || 'Đã có lỗi xảy ra khi đặt vé. Vui lòng thử lại!', type: 'error' });
      setShowConfirmModal(false);
    }
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      visa: 'Thẻ Visa/Mastercard',
      wallet: 'Ví của tôi'
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
                <span className="label">Ngày chiếu:</span>
                <span className="value">{bookingData.showDate}</span>
              </div>
              <div className="summary-item">
                <span className="label">Giờ chiếu:</span>
                <span className="value">{bookingData.showTime}</span>
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
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={paymentInfo.phone}
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label>Phương Thức Thanh Toán <span className="required">*</span></label>
                <div className="payment-methods">
                  <label className={`payment-method-option ${paymentInfo.paymentMethod === 'visa' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="visa"
                      checked={paymentInfo.paymentMethod === 'visa'}
                      onChange={handleChange}
                    />
                    <span>Thẻ Visa/Mastercard</span>
                  </label>
                  <label className={`payment-method-option ${paymentInfo.paymentMethod === 'wallet' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentInfo.paymentMethod === 'wallet'}
                      onChange={handleChange}
                    />
                    <span>Thanh toán bằng Ví của tôi</span>
                  </label>
                </div>

                {/* Visa Card Form */}
                {paymentInfo.paymentMethod === 'visa' && (
                  <div className="visa-form" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h4 style={{ marginBottom: '15px', color: '#333' }}>Thông tin thẻ Visa/Mastercard</h4>

                    <div className="form-group">
                      <label>Số thẻ <span className="required">*</span></label>
                      <input
                        type="text"
                        value={visaInfo.cardNumber}
                        onChange={(e) => handleVisaInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    <div className="form-group">
                      <label>Tên chủ thẻ <span className="required">*</span></label>
                      <input
                        type="text"
                        value={visaInfo.cardHolder}
                        onChange={(e) => handleVisaInputChange('cardHolder', e.target.value)}
                        placeholder="NGUYEN VAN A"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Ngày hết hạn <span className="required">*</span></label>
                        <input
                          type="text"
                          value={visaInfo.expiryDate}
                          onChange={(e) => handleVisaInputChange('expiryDate', e.target.value)}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV <span className="required">*</span></label>
                        <input
                          type="text"
                          value={visaInfo.cvv}
                          onChange={(e) => handleVisaInputChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Balance Display */}
                {paymentInfo.paymentMethod === 'wallet' && (
                  <div className="movie-account-info" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                    <p className="balance-text">Số dư tài khoản: <span className="balance-amount" style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1em' }}>{accountBalance.toLocaleString('vi-VN')}đ</span></p>
                    {balanceError && (
                      <div className="balance-error" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffc107' }}>
                        <p style={{ color: '#856404', marginBottom: '10px' }}>{balanceError}</p>
                        <button
                          type="button"
                          className="topup-redirect-btn"
                          onClick={() => navigate('/account', { state: { activeTab: 'wallet' } })}
                          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
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
        <div className="modal-overlay">
          <div className="modal-content payment-confirm-modal">
            <h3>Xác Nhận Thanh Toán</h3>
            <div className="payment-confirm-info">
              <p>Bạn có chắc chắn muốn thanh toán với thông tin sau:</p>
              <div className="confirm-booking-details">
                <p><strong>Phim:</strong> {bookingData.movieTitle}</p>
                <p><strong>Rạp:</strong> {bookingData.theater}</p>
                <p><strong>Ngày chiếu:</strong> {bookingData.showDate}</p>
                <p><strong>Giờ chiếu:</strong> {bookingData.showTime}</p>
                <p><strong>Ghế:</strong> {bookingData.seats.join(', ')}</p>
                <p><strong>Phương thức thanh toán:</strong> {getPaymentMethodName(paymentInfo.paymentMethod)}</p>
                {paymentInfo.paymentMethod === 'wallet' && (
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
                <p><strong>Ngày chiếu:</strong> {successData.showDate}</p>
                <p><strong>Giờ chiếu:</strong> {successData.showTime}</p>
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

      {/* Notification popup */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default Payment;

