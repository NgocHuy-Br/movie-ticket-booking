import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { login } from '../utils/auth';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
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