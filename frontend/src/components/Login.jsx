import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Notification from './Notification';
import { login } from '../utils/auth';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Forgot password states
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInvalid, setOtpInvalid] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [notification, setNotification] = useState(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ESC key handler for modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showForgotModal) {
        handleCloseForgotModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForgotModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Gọi API đăng nhập
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu token và thông tin user vào localStorage
        login(data.data.token, data.data.userInfo);

        // Login thành công - luôn redirect đến trang chủ
        navigate('/');
      } else {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau');
    }
  };

  const handleGetOTP = async () => {
    setForgotError('');
    setForgotSuccess('');
    setOtpInvalid(false);

    if (!forgotUsername || !forgotEmail) {
      setForgotError('Vui lòng điền đầy đủ tên đăng nhập và email');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setForgotError('Vui lòng điền đầy đủ mật khẩu mới');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          email: forgotEmail
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setCountdown(60);
        setOtp('');
        setForgotSuccess('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư');
      } else {
        setForgotError(data.message || 'Thông tin không chính xác. Vui lòng kiểm tra lại');
      }
    } catch (error) {
      console.error('Get OTP error:', error);
      setForgotError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau');
    }
  };

  const handleResendOTP = async () => {
    setForgotError('');
    setForgotSuccess('');
    setOtpInvalid(false);
    setOtp('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          email: forgotEmail
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        setForgotSuccess('Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư');
      } else {
        setForgotError('Không thể gửi lại mã OTP. Vui lòng thử lại');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setForgotError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau');
    }
  };

  const handleVerifyAndResetPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    setOtpInvalid(false);

    if (!otp || otp.trim() === '') {
      setForgotError('Vui lòng nhập mã OTP');
      return;
    }

    // Validate OTP: phải là đúng 4 chữ số
    if (!/^\d{4}$/.test(otp)) {
      setOtpInvalid(true);
      setForgotError('Mã OTP không đúng, vui lòng nhập lại OTP');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ message: 'Đặt lại mật khẩu thành công!', type: 'success' });
        setTimeout(() => {
          setShowForgotModal(false);
          resetForgotPasswordForm();
        }, 2000);
      } else {
        setForgotError(data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setForgotError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau');
    }
  };

  const resetForgotPasswordForm = () => {
    setForgotUsername('');
    setForgotEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setOtpInvalid(false);
    setCountdown(0);
    setForgotError('');
    setForgotSuccess('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    resetForgotPasswordForm();
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Đăng Nhập</button>
        </form>
        <div className="links">
          <button
            type="button"
            className="link-button"
            onClick={() => setShowForgotModal(true)}
          >
            Quên mật khẩu?
          </button>
          <br />
          <Link to="/register">Đăng ký tài khoản mới</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Quên Mật Khẩu</h3>
              <button className="close-btn" onClick={handleCloseForgotModal}>&times;</button>
            </div>

            <div className="modal-body">
              {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}
              {forgotError && <div className="error-message">{forgotError}</div>}

              {/* All fields in one form */}
              <div className="form-group">
                <label>Tên đăng nhập: <span className="required">*</span></label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  disabled={otpSent}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div className="form-group">
                <label>Email: <span className="required">*</span></label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={otpSent}
                  placeholder="Nhập email đã đăng ký"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới: <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={otpSent}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới: <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={otpSent}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* OTP Section - shown after clicking Get OTP */}
              {!otpSent ? (
                <div className="button-group">
                  <button
                    className="btn-primary"
                    onClick={handleGetOTP}
                  >
                    Lấy mã OTP
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleCloseForgotModal}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <div className="otp-section">
                    <div className="form-group">
                      <label>Mã OTP: <span className="required">*</span></label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã OTP"
                      />
                      {countdown > 0 && (
                        <small className="countdown-text">
                          Mã OTP có hiệu lực trong {countdown} giây
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="btn-primary"
                      onClick={handleVerifyAndResetPassword}
                    >
                      Xác nhận OTP
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={handleResendOTP}
                    >
                      Gửi lại OTP {countdown > 0 ? `(${countdown}s)` : ''}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={handleCloseForgotModal}
                    >
                      Hủy
                    </button>
                  </div>
                </>
              )}
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

export default Login;