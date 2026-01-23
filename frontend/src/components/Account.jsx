import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const getUserInfo = () => {
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const info = JSON.parse(userInfoStr);
          // Lấy avatar nếu có
          if (info.avatar) {
            setAvatar(info.avatar);
          }
          return info;
        }
      } catch (error) {
        console.error('Error reading user info:', error);
      }
      return null;
    };

    const info = getUserInfo();
    if (info) {
      setUserInfo(info);
    } else {
      // Nếu chưa đăng nhập, redirect về trang chủ
      navigate('/');
    }

    // Load booking history từ localStorage
    try {
      const history = localStorage.getItem('bookingHistory');
      let parsedHistory = [];
      if (history) {
        parsedHistory = JSON.parse(history);
        if (parsedHistory && parsedHistory.length > 0) {
          setBookingHistory(parsedHistory);
        }
      }
      
      // Kiểm tra xem đã có vé test có thể huỷ chưa
      const hasCancellableTestTicket = parsedHistory.some(ticket => 
        ticket.movie === 'Test Movie - Có thể huỷ' && ticket.status === 'purchased'
      );
      
      // Nếu chưa có vé test có thể huỷ, tạo một vé mới
      if (!hasCancellableTestTicket) {
        const now = new Date();
        const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 giờ sau
        const date = future.toISOString().split('T')[0];
        const hours = String(future.getHours()).padStart(2, '0');
        const mins = String(future.getMinutes()).padStart(2, '0');
        const time = `${hours}:${mins}`;
        
        const testTicket = {
          id: Date.now(),
          movie: 'Test Movie - Có thể huỷ',
          theater: 'CGV Vincom Center',
          date: date,
          time: time,
          seats: ['A5', 'A6'],
          total: 170000,
          status: 'purchased',
          ticketCode: `MV${date.replace(/-/g, '')}999`
        };
        
        const ticketsWithTest = [testTicket, ...parsedHistory];
        setBookingHistory(ticketsWithTest);
        localStorage.setItem('bookingHistory', JSON.stringify(ticketsWithTest));
      }
    } catch (error) {
      console.error('Error reading booking history:', error);
    }

    // Load payment history từ localStorage
    try {
      const paymentHistoryStr = localStorage.getItem('paymentHistory');
      if (paymentHistoryStr) {
        const parsedPaymentHistory = JSON.parse(paymentHistoryStr);
        if (parsedPaymentHistory && parsedPaymentHistory.length > 0) {
          setPaymentHistory(parsedPaymentHistory);
        }
      }
    } catch (error) {
      console.error('Error reading payment history:', error);
    }

    // Kiểm tra nếu có state từ navigation (ví dụ từ Payment page)
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [navigate, location]);

  const getPaymentMethodName = (method) => {
    const methods = {
      momo: 'Ví MoMo',
      zalopay: 'Ví ZaloPay',
      bank: 'Chuyển khoản ngân hàng'
    };
    return methods[method] || method;
  };

  // Hàm validate số tiền nạp
  const validateTopUpAmount = (amount) => {
    if (!amount || amount.trim() === '') {
      return 'Vui lòng nhập số tiền';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Số tiền phải lớn hơn 0';
    }
    if (numAmount < 1000) {
      return 'Số tiền tối thiểu là 1,000đ';
    }
    return '';
  };

  // Hàm xử lý thay đổi số tiền
  const handleTopUpAmountChange = (e) => {
    const value = e.target.value;
    setTopUpAmount(value);
    // Clear error khi user bắt đầu nhập
    if (topUpAmountError) {
      setTopUpAmountError('');
    }
  };

  // Hàm mở popup xác nhận nạp tiền
  const handleTopUpClick = () => {
    const error = validateTopUpAmount(topUpAmount);
    if (error) {
      setTopUpAmountError(error);
      return;
    }
    setTopUpAmountError('');
    setShowTopUpConfirmModal(true);
  };

  // Hàm xác nhận nạp tiền
  const handleConfirmTopUp = () => {
    const amount = parseFloat(topUpAmount);

    const newBalance = accountBalance + amount;
    setAccountBalance(newBalance);
    localStorage.setItem('accountBalance', newBalance.toString());

    // Thêm vào lịch sử thanh toán
    const newPayment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      method: getPaymentMethodName(topUpPaymentMethod),
      status: 'Deposit',
      type: 'topup'
    };

    const updatedPaymentHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedPaymentHistory);
    localStorage.setItem('paymentHistory', JSON.stringify(updatedPaymentHistory));

    // Lưu thông tin thành công để hiển thị trong popup
    setTopUpSuccessData({
      amount: amount,
      method: getPaymentMethodName(topUpPaymentMethod),
      newBalance: newBalance
    });

    // Tắt tất cả popup và mở popup thành công
    setTopUpAmount('');
    setTopUpAmountError('');
    setTopUpPaymentMethod('momo');
    setShowTopUpModal(false);
    setShowTopUpConfirmModal(false);
    setShowTopUpSuccessModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    // Dispatch custom event để header cập nhật
    window.dispatchEvent(new Event('userLogin'));
    navigate('/');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result;
        setAvatar(avatarUrl);
        // Lưu avatar vào localStorage
        const updatedUserInfo = { ...userInfo, avatar: avatarUrl };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock data mặc định
  const defaultBookingHistory = [
    { id: 1, movie: 'Avengers: Endgame', theater: 'CGV Vincom Center', date: '2024-01-15', time: '18:00', seats: ['A1', 'A2'], total: 170000, status: 'purchased', ticketCode: 'MV20240115001' },
    { id: 2, movie: 'Spider-Man: No Way Home', theater: 'Lotte Cinema', date: '2024-01-10', time: '20:00', seats: ['B5'], total: 85000, status: 'cancelled', ticketCode: 'MV20240110002' },
    { id: 3, movie: 'Dune', theater: 'Galaxy Cinema', date: '2024-01-25', time: '21:00', seats: ['D7'], total: 85000, status: 'purchased', ticketCode: 'MV20240125003' },
  ];

  const [bookingHistory, setBookingHistory] = useState(defaultBookingHistory);
  const [accountBalance, setAccountBalance] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState('momo'); // momo, zalopay, bank
  const [topUpAmountError, setTopUpAmountError] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTopUpConfirmModal, setShowTopUpConfirmModal] = useState(false);
  const [showTopUpSuccessModal, setShowTopUpSuccessModal] = useState(false);
  const [topUpSuccessData, setTopUpSuccessData] = useState(null);
  const [cancelTicketModal, setCancelTicketModal] = useState(null); // { bookingId, booking }

  // Load số dư tài khoản từ localStorage
  useEffect(() => {
    try {
      const balance = localStorage.getItem('accountBalance');
      if (balance) {
        setAccountBalance(parseFloat(balance));
      } else {
        // Mặc định số dư là 0
        setAccountBalance(0);
      }
    } catch (error) {
      console.error('Error reading account balance:', error);
    }
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'purchased':
        return { text: 'Đã mua', class: 'status-purchased' };
      case 'cancelled':
        return { text: 'Đã huỷ', class: 'status-cancelled' };
      default:
        return { text: 'Không xác định', class: '' };
    }
  };

  // Kiểm tra xem có thể huỷ vé không (còn > 60 phút trước giờ chiếu)
  const canCancelTicket = (booking) => {
    if (booking.status !== 'purchased') return false;
    
    const now = new Date();
    const [hours, minutes] = booking.time.split(':');
    const showTime = new Date(`${booking.date}T${hours}:${minutes}:00`);
    
    // Tính thời gian còn lại (milliseconds)
    const timeDiff = showTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 60;
  };

  // Hàm mở modal xác nhận huỷ vé
  const handleCancelTicketClick = (bookingId) => {
    const booking = bookingHistory.find(b => b.id === bookingId);
    if (booking) {
      setCancelTicketModal({ bookingId, booking });
    }
  };

  // Hàm xác nhận huỷ vé
  const handleConfirmCancelTicket = () => {
    if (!cancelTicketModal) return;

    const { bookingId, booking } = cancelTicketModal;

    // Cập nhật status thành 'cancelled'
    const updatedHistory = bookingHistory.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    setBookingHistory(updatedHistory);
    localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory));

    // Hoàn tiền vào tài khoản
    const newBalance = accountBalance + booking.total;
    setAccountBalance(newBalance);
    localStorage.setItem('accountBalance', newBalance.toString());

      // Thêm vào lịch sử thanh toán
      try {
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
        paymentHistory.unshift({
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: booking.total,
          method: 'Hoàn tiền',
          status: 'refund',
          type: 'refund',
          ticketCode: booking.ticketCode
        });
        localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
        setPaymentHistory(paymentHistory);
      } catch (error) {
        console.error('Error saving payment history:', error);
      }

    setCancelTicketModal(null);
    alert(`Đã huỷ vé thành công!\nSố tiền ${booking.total.toLocaleString('vi-VN')}đ đã được hoàn vào tài khoản.`);
  };


  if (!userInfo) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <h2>Thông Tin Profile</h2>
            <div className="avatar-section">
              <div className="avatar-container">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="avatar-image" />
                ) : (
                  <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {avatar ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện'}
              </label>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <span className="label">Tên đăng nhập:</span>
                <span className="value">{userInfo.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Họ và tên:</span>
                <span className="value">{userInfo.fullName || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{userInfo.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{userInfo.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>
        );

      case 'booking':
        return (
          <div className="booking-history-content">
            <h2>Vé Đã Mua</h2>
            {bookingHistory.length > 0 ? (
              <div className="history-list">
                {bookingHistory.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status);
                  return (
                    <div key={booking.id} className="history-item">
                      <div className="history-header">
                        <h3>{booking.movie}</h3>
                        <div className="history-header-right">
                          <span className={`ticket-status ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                          <span className="history-date">{booking.date}</span>
                        </div>
                      </div>
                      <div className="history-details">
                        <p><strong>Mã vé:</strong> <span className="ticket-code">{booking.ticketCode}</span></p>
                        <p><strong>Rạp:</strong> {booking.theater}</p>
                        <p><strong>Giờ chiếu:</strong> {booking.time}</p>
                        <p><strong>Ghế:</strong> {booking.seats.join(', ')}</p>
                        <p className="history-total"><strong>Tổng tiền:</strong> {booking.total.toLocaleString('vi-VN')}đ</p>
                        {canCancelTicket(booking) && (
                          <button 
                            className="cancel-ticket-btn"
                            onClick={() => handleCancelTicketClick(booking.id)}
                          >
                            Huỷ vé
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">Chưa có vé đã mua</p>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="payment-history-content">
            <div className="balance-section">
              <h2>Số Dư Tài Khoản</h2>
              <div className="balance-display">
                <span className="balance-amount">{accountBalance.toLocaleString('vi-VN')}đ</span>
                <button className="topup-btn" onClick={() => setShowTopUpModal(true)}>
                  Nạp tiền
                </button>
              </div>
            </div>

              {showTopUpModal && (
                <div className="modal-overlay" onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount('');
                  setTopUpAmountError('');
                  setTopUpPaymentMethod('momo');
                }}>
                <div className="modal-content topup-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Nạp Tiền Vào Tài Khoản</h3>
                  <div className="topup-form">
                    <div className="form-group">
                      <label>Số tiền (VNĐ) <span className="required">*</span></label>
                      <input
                        type="number"
                        value={topUpAmount}
                        onChange={handleTopUpAmountChange}
                        placeholder="Nhập số tiền"
                        min="1000"
                        step="1000"
                        className={topUpAmountError ? 'error' : ''}
                      />
                      {topUpAmountError && <span className="error">{topUpAmountError}</span>}
                    </div>

                    <div className="form-group">
                      <label>Phương Thức Thanh Toán <span className="required">*</span></label>
                      <div className="payment-methods">
                        <label className={`payment-method-option ${topUpPaymentMethod === 'momo' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="topUpPaymentMethod"
                            value="momo"
                            checked={topUpPaymentMethod === 'momo'}
                            onChange={(e) => setTopUpPaymentMethod(e.target.value)}
                          />
                          <span>Ví MoMo</span>
                        </label>
                        <label className={`payment-method-option ${topUpPaymentMethod === 'zalopay' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="topUpPaymentMethod"
                            value="zalopay"
                            checked={topUpPaymentMethod === 'zalopay'}
                            onChange={(e) => setTopUpPaymentMethod(e.target.value)}
                          />
                          <span>Ví ZaloPay</span>
                        </label>
                        <label className={`payment-method-option ${topUpPaymentMethod === 'bank' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="topUpPaymentMethod"
                            value="bank"
                            checked={topUpPaymentMethod === 'bank'}
                            onChange={(e) => setTopUpPaymentMethod(e.target.value)}
                          />
                          <span>Chuyển khoản ngân hàng</span>
                        </label>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => {
                        setShowTopUpModal(false);
                        setTopUpAmount('');
                        setTopUpAmountError('');
                        setTopUpPaymentMethod('momo');
                      }}>
                        Hủy
                      </button>
                      <button type="button" className="confirm-btn" onClick={handleTopUpClick}>
                        Xác nhận nạp tiền
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 style={{ marginTop: '30px' }}>Lịch Sử Thanh Toán</h2>
            {paymentHistory.length > 0 ? (
              <div className="history-list">
                {paymentHistory.map((payment) => {
                  const getStatusInfo = (status) => {
                    switch (status) {
                      case 'Deposit':
                        return { text: 'Deposit', class: 'status-deposit' };
                      case 'paid':
                        return { text: 'paid', class: 'status-paid' };
                      case 'refund':
                        return { text: 'refund', class: 'status-refund' };
                      case 'failed':
                        return { text: 'failed', class: 'status-failed' };
                      default:
                        return { text: status, class: '' };
                    }
                  };
                  const statusInfo = getStatusInfo(payment.status);
                  return (
                    <div key={payment.id} className="history-item">
                      <div className="history-header">
                        <h3>Giao dịch #{payment.id}</h3>
                        <span className={`history-status ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="history-details">
                        <p><strong>Ngày:</strong> {payment.date}</p>
                        <p><strong>Phương thức:</strong> {payment.method}</p>
                        {payment.ticketCode && (
                          <p><strong>Mã vé:</strong> <span className="ticket-code">{payment.ticketCode}</span></p>
                        )}
                        <p className={`history-total ${payment.status === 'Deposit' || payment.status === 'refund' ? 'positive' : ''}`}>
                          <strong>{payment.status === 'Deposit' || payment.status === 'refund' ? '+' : ''}Số tiền:</strong> {payment.amount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">Chưa có lịch sử thanh toán</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="account-container">
        <div className="account-header">
          <h1>Tài Khoản</h1>
        </div>

        <div className="account-layout">
          <div className="account-sidebar">
            <button
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin profile
            </button>
            <button
              className={`menu-item ${activeTab === 'booking' ? 'active' : ''}`}
              onClick={() => setActiveTab('booking')}
            >
              Vé đã mua
            </button>
            <button
              className={`menu-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Lịch sử thanh toán
            </button>
            <button
              className="menu-item logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>

          <div className="account-content">
            <div className="content-card">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận huỷ vé */}
      {cancelTicketModal && (
        <div className="modal-overlay" onClick={() => setCancelTicketModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác Nhận Huỷ Vé</h3>
            <div className="cancel-ticket-message">
              <p>Vé chỉ được phép huỷ trước giờ chiếu 60 phút.</p>
              <p>Số ghế trước đó sẽ bị mất.</p>
              <p>Tiền sẽ hoàn về tài khoản Movie của bạn.</p>
              <div className="ticket-info">
                <p><strong>Mã vé:</strong> {cancelTicketModal.booking.ticketCode}</p>
                <p><strong>Phim:</strong> {cancelTicketModal.booking.movie}</p>
                <p><strong>Giờ chiếu:</strong> {cancelTicketModal.booking.time}</p>
                <p><strong>Số tiền hoàn:</strong> {cancelTicketModal.booking.total.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setCancelTicketModal(null)}>
                No
              </button>
              <button className="confirm-btn" onClick={handleConfirmCancelTicket}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận nạp tiền */}
      {showTopUpConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowTopUpConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác Nhận Nạp Tiền</h3>
            <div className="topup-confirm-message">
              <p>Bạn có chắc chắn muốn nạp tiền với thông tin sau:</p>
              <div className="topup-info">
                <p><strong>Số tiền:</strong> {parseFloat(topUpAmount || 0).toLocaleString('vi-VN')}đ</p>
                <p><strong>Phương thức:</strong> {getPaymentMethodName(topUpPaymentMethod)}</p>
                <p><strong>Số dư hiện tại:</strong> {accountBalance.toLocaleString('vi-VN')}đ</p>
                <p><strong>Số dư sau nạp:</strong> {(accountBalance + parseFloat(topUpAmount || 0)).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowTopUpConfirmModal(false)}>
                No
              </button>
              <button className="confirm-btn" onClick={handleConfirmTopUp}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nạp tiền thành công */}
      {showTopUpSuccessModal && topUpSuccessData && (
        <div className="modal-overlay" onClick={() => setShowTopUpSuccessModal(false)}>
          <div className="modal-content topup-success-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#28a745', marginBottom: '20px' }}>✓ Nạp Tiền Thành Công!</h3>
            <div className="topup-success-info">
              <div className="success-topup-details">
                <p><strong>Số tiền nạp:</strong> {topUpSuccessData.amount.toLocaleString('vi-VN')}đ</p>
                <p><strong>Phương thức:</strong> {topUpSuccessData.method}</p>
                <p style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #28a745' }}>
                  <strong style={{ color: '#28a745' }}>Số dư hiện tại:</strong> 
                  <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '18px', marginLeft: '10px' }}>
                    {topUpSuccessData.newBalance.toLocaleString('vi-VN')}đ
                  </span>
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="confirm-btn" 
                onClick={() => setShowTopUpSuccessModal(false)}
                style={{ width: '100%' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Account;
