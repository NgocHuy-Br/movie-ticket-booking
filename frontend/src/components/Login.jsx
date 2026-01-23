import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Hardcode credentials
    if (username === 'thuyne' && password === '123123') {
      // Lưu thông tin user vào localStorage
      const userInfo = {
        username: 'thuyne',
        fullName: 'Nguyễn Thị Thúy',
        email: 'thuyne@example.com',
        phone: '0123456789'
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Dispatch custom event để header cập nhật
      window.dispatchEvent(new Event('userLogin'));
      
      // Kiểm tra xem có redirect path nào được lưu không
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Login thành công - redirect đến trang chủ
        navigate('/');
      }
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
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
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Đăng Nhập</button>
      </form>
      <div className="links">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
        <br />
        <Link to="/register">Đăng ký tài khoản mới</Link>
      </div>
    </div>
    </>
  );
};

export default Login;