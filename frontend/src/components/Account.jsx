import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import MyMovies from './MyMovies';
import MyWallet from './MyWallet';
import { getUserInfo, updateUserInfo } from '../utils/auth';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile'); // profile, movies, wallet
  const [userInfo, setUserInfo] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [pendingAvatar, setPendingAvatar] = useState(null); // Avatar mới chọn chưa lưu
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const info = getUserInfo();
    if (info) {
      setUserInfo(info);
      setEditForm({
        fullName: info.fullName || '',
        email: info.email || '',
        phone: info.phone || '',
        dateOfBirth: info.dateOfBirth || ''
      });
      if (info.avatar) {
        setAvatar(info.avatar);
      }
    } else {
      navigate('/');
    }

    // Update activeTab when location.state changes
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }

    // Listen for logout event
    const handleLogout = () => navigate('/');
    window.addEventListener('userLogout', handleLogout);

    // Listen for profile update event
    const handleProfileUpdate = () => {
      const updatedInfo = getUserInfo();
      if (updatedInfo) {
        setUserInfo(updatedInfo);
      }
    };
    window.addEventListener('userProfileUpdate', handleProfileUpdate);

    return () => {
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('userProfileUpdate', handleProfileUpdate);
    };
  }, [navigate, location.state]);

  // Hàm compress và resize ảnh
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Giới hạn kích thước tối đa 800x800px
          const maxSize = 800;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress với quality 0.7 (70%)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }

      try {
        // Compress và resize ảnh
        const compressedImage = await compressImage(file);
        setPendingAvatar(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Có lỗi xảy ra khi xử lý ảnh!');
      }
    }
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) return;

    setIsSavingAvatar(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập lại!');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: userInfo.fullName || userInfo.name,
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          dateOfBirth: userInfo.dateOfBirth || '',
          address: userInfo.address || '',
          avatar: pendingAvatar
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUserInfo = { ...userInfo, avatar: pendingAvatar };
        updateUserInfo(updatedUserInfo);
        setUserInfo(updatedUserInfo);
        setAvatar(pendingAvatar);
        setPendingAvatar(null);
        alert('Cập nhật ảnh đại diện thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện!');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Có lỗi xảy ra khi cập nhật ảnh đại diện!');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setPendingAvatar(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: userInfo.fullName || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      dateOfBirth: userInfo.dateOfBirth || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    // Validate phone number
    if (editForm.phone && !/^0\d{9}$/.test(editForm.phone)) {
      alert('Số điện thoại phải là 10 chữ số, bắt đầu bằng 0');
      return;
    }

    // Validate email
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      alert('Email không hợp lệ');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập lại!');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          dateOfBirth: editForm.dateOfBirth,
          address: userInfo.address,
          avatar: userInfo.avatar
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update localStorage with data from backend
        const updatedUserInfo = {
          ...userInfo,
          ...data.data
        };
        updateUserInfo(updatedUserInfo);
        setUserInfo(updatedUserInfo);
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Đổi mật khẩu thành công!');
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu!');
    }
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPassword({
      current: false,
      new: false,
      confirm: false
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };


  if (!userInfo) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="account-container">
        <div className="account-header">
          <h1>
            {activeTab === 'profile' && 'Tài Khoản'}
            {activeTab === 'movies' && 'Phim Của Tôi'}
            {activeTab === 'wallet' && 'Ví Của Tôi'}
          </h1>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="account-content-single">
            <div className="content-card">
              <div className="card-header">
                <h2>Thông Tin Cá Nhân</h2>
              </div>

              <div className="profile-content">
                <div className="avatar-section">
                  <div className="avatar-container">
                    {(pendingAvatar || avatar) ? (
                      <img src={pendingAvatar || avatar} alt="Avatar" className="avatar-image" />
                    ) : (
                      <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {pendingAvatar && (
                      <div className="avatar-pending-badge">Chưa lưu</div>
                    )}
                  </div>

                  {!pendingAvatar ? (
                    <label className="upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      {avatar ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện'}
                    </label>
                  ) : (
                    <div className="avatar-actions">
                      <button
                        className="save-avatar-btn"
                        onClick={handleSaveAvatar}
                        disabled={isSavingAvatar}
                      >
                        {isSavingAvatar ? 'Đang lưu...' : 'Lưu ảnh'}
                      </button>
                      <button
                        className="cancel-avatar-btn"
                        onClick={handleCancelAvatar}
                        disabled={isSavingAvatar}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
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
                    <div className="info-item">
                      <span className="label">Ngày sinh:</span>
                      <span className="value">{userInfo.dateOfBirth || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Vai trò:</span>
                      <span className="value">{userInfo.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Mật khẩu:</span>
                      <div className="password-display">
                        <span className="value password-stars">••••••••</span>
                        <button className="change-password-link" onClick={() => setIsChangingPassword(true)}>
                          Thay đổi
                        </button>
                      </div>
                    </div>
                    {userInfo.role !== 'ADMIN' && userInfo.membershipLevel && (
                      <div className="info-item">
                        <span className="label">Hạng thành viên:</span>
                        <span className={`value membership-badge ${userInfo.membershipLevel.toLowerCase()}`}>
                          {userInfo.membershipLevel}
                        </span>
                      </div>
                    )}
                    {!isEditing && (
                      <div className="edit-button-container">
                        <button className="edit-btn" onClick={handleEditClick}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Chỉnh sửa
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="profile-edit-form">
                    <div className="form-group">
                      <label>Tên đăng nhập:</label>
                      <input type="text" value={userInfo.username} disabled />
                    </div>
                    <div className="form-group">
                      <label>Họ và tên:</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại:</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại (10 số, bắt đầu bằng 0)"
                        pattern="^0\d{9}$"
                        maxLength="10"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngày sinh:</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editForm.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={handleCancelEdit}>
                        Hủy
                      </button>
                      <button className="save-btn" onClick={handleSaveProfile}>
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Movies Tab */}
        {activeTab === 'movies' && (
          <MyMovies />
        )}

        {/* My Wallet Tab */}
        {activeTab === 'wallet' && (
          <MyWallet />
        )}
      </div>

      {/* Modal Thay đổi Mật khẩu */}
      {isChangingPassword && (
        <div className="modal-overlay" onClick={handleCancelChangePassword}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thay đổi Mật khẩu</h3>
              <button className="close-btn" onClick={handleCancelChangePassword}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="password-change-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPassword.current ? (
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
                <label>Mật khẩu mới <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPassword.new ? (
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
                <label>Xác nhận mật khẩu mới <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPassword.confirm ? (
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
              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancelChangePassword}>
                  Hủy
                </button>
                <button className="save-btn" onClick={handleChangePassword}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Account;
