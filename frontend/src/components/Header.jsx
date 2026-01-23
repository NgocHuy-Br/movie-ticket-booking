import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const checkLoginStatus = () => {
      const userInfo = localStorage.getItem('userInfo');
      setIsLoggedIn(!!userInfo);
    };

    checkLoginStatus();
    
    // Lắng nghe sự kiện storage để cập nhật khi login/logout
    window.addEventListener('storage', checkLoginStatus);
    
    // Custom event để cập nhật khi login trong cùng tab
    const handleUserLogin = () => {
      checkLoginStatus();
    };
    window.addEventListener('userLogin', handleUserLogin);

    // Polling để kiểm tra thay đổi (fallback cho cùng tab)
    const interval = setInterval(checkLoginStatus, 500);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('userLogin', handleUserLogin);
      clearInterval(interval);
    };
  }, []);

  const handleAccountClick = () => {
    navigate('/account');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h2>Movie Ticket</h2>
        </Link>
        <div className="header-right">
          {isLoggedIn ? (
            <button className="account-btn" onClick={handleAccountClick}>
              <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Tài Khoản</span>
            </button>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">
                <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Đăng nhập</span>
              </Link>
              <span className="separator">/</span>
              <Link to="/register" className="auth-link">
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

