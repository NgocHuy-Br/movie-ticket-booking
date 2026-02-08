import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { login } from '../utils/auth';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cmnd: '',
    ten: '',
    sinhNhat: '',
    soDienThoai: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // CMND: bắt buộc, giả sử 9-12 digits
    if (!formData.cmnd.trim()) {
      newErrors.cmnd = 'CMND là bắt buộc';
    } else if (!/^\d{9,12}$/.test(formData.cmnd)) {
      newErrors.cmnd = 'CMND phải là số từ 9-12 chữ số';
    }

    // Tên: bắt buộc
    if (!formData.ten.trim()) {
      newErrors.ten = 'Tên là bắt buộc';
    }

    // Sinh nhật: bắt buộc
    if (!formData.sinhNhat) {
      newErrors.sinhNhat = 'Ngày sinh là bắt buộc';
    }

    // Số điện thoại: bắt buộc, 10 digits, bắt đầu bằng 0
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải là 10 chữ số, bắt đầu bằng 0';
    }

    // Username: bắt buộc
    if (!formData.username.trim()) {
      newErrors.username = 'Username là bắt buộc';
    }

    // Password: bắt buộc, ít nhất 6 ký tự
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Gọi API đăng ký
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cmnd: formData.cmnd,
            fullName: formData.ten,
            dateOfBirth: formData.sinhNhat,
            phone: formData.soDienThoai,
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Lưu token và thông tin user vào localStorage (auto-login)
          login(data.data.token, data.data.userInfo);

          alert('Đăng ký thành công!');
          // Redirect về trang chủ
          navigate('/');
        } else {
          alert(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Register error:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <>
      <Header />
      <div className="register-container">
        <h2>Đăng Ký Tài Khoản Mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cmnd">CMND/CCCD <span className="required">*</span></label>
            <input
              type="text"
              id="cmnd"
              name="cmnd"
              value={formData.cmnd}
              onChange={handleChange}
              placeholder="Nhập số CMND/CCCD"
            />
            {errors.cmnd && <span className="error">{errors.cmnd}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ten">Họ và Tên <span className="required">*</span></label>
            <input
              type="text"
              id="ten"
              name="ten"
              value={formData.ten}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
            {errors.ten && <span className="error">{errors.ten}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sinhNhat">Ngày Sinh <span className="required">*</span></label>
            <input
              type="date"
              id="sinhNhat"
              name="sinhNhat"
              value={formData.sinhNhat}
              onChange={handleChange}
            />
            {errors.sinhNhat && <span className="error">{errors.sinhNhat}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="soDienThoai">Số Điện Thoại <span className="required">*</span></label>
            <input
              type="tel"
              id="soDienThoai"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại (10 số, bắt đầu bằng 0)"
            />
            {errors.soDienThoai && <span className="error">{errors.soDienThoai}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username Đăng Nhập <span className="required">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập username"
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu <span className="required">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu <span className="required">*</span></label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit">Đăng Ký</button>
        </form>
        <div className="links">
          <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </>
  );
};

export default Register;