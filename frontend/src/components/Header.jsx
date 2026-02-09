import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const checkLoginStatus = () => {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const userData = JSON.parse(userInfoStr);
          setUserInfo(userData);
          setIsLoggedIn(true);
        } catch (e) {
          console.error('Failed to parse userInfo:', e);
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('redirectAfterLogin');
    setIsLoggedIn(false);
    setUserInfo(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  const handleAccountClick = () => {
    navigate('/account');
    setShowDropdown(false);
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
    setShowDropdown(false);
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return <span className="role-badge admin-badge">Admin</span>;
    }
    return null;
  };

  const getMembershipBadge = (level) => {
    const badges = {
      'PLATINUM': <span className="membership-badge platinum">Platinum</span>,
      'GOLD': <span className="membership-badge gold">Gold</span>,
      'NORMAL': <span className="membership-badge normal">Normal</span>
    };
    return badges[level] || null;
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h2>Movie Ticket</h2>
        </Link>
        <div className="header-right">
          {isLoggedIn && userInfo ? (
            <div className="user-menu">
              <button
                className="user-info-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt={userInfo.username} />
                  ) : (
                    <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">{userInfo.fullName || userInfo.username}</span>
                  <div className="user-badges">
                    {userInfo.role === 'ADMIN' && <span className="role-text">Quản trị viên</span>}
                  </div>
                </div>
                <svg className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-username">{userInfo.username}</p>
                    <p className="dropdown-email">{userInfo.email || 'Chưa cập nhật email'}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  {userInfo.role === 'ADMIN' && (
                    <>
                      <button className="dropdown-item" onClick={handleAdminDashboard}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" />
                          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Quản trị hệ thống
                      </button>
                      <div className="dropdown-divider"></div>
                    </>
                  )}
                  <button className="dropdown-item" onClick={handleAccountClick}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Tài khoản của tôi
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">
                <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

