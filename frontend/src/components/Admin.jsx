import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { getUserInfo, getAuthHeaders } from '../utils/auth';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getUserInfo();
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        setUserInfo(user);
        fetchStatistics();
    }, [navigate]);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/statistics', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="admin-container">
                    <div className="loading">Đang tải...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="admin-container">
                <div className="admin-header">
                    <h1>🎬 Quản Trị Hệ Thống</h1>
                    <p>Chào mừng, {userInfo?.fullName || userInfo?.username}!</p>
                </div>

                {statistics && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>{statistics.totalUsers || 0}</h3>
                                <p>Người dùng</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🎬</div>
                            <div className="stat-info">
                                <h3>{statistics.totalMovies || 0}</h3>
                                <p>Phim</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🏢</div>
                            <div className="stat-info">
                                <h3>{statistics.totalTheaters || 0}</h3>
                                <p>Rạp</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🎫</div>
                            <div className="stat-info">
                                <h3>{statistics.totalBookings || 0}</h3>
                                <p>Vé đã đặt</p>
                            </div>
                        </div>

                        <div className="stat-card highlight">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <h3>{(statistics.totalRevenue || 0).toLocaleString('vi-VN')}đ</h3>
                                <p>Tổng doanh thu</p>
                            </div>
                        </div>

                        <div className="stat-card highlight">
                            <div className="stat-icon">📅</div>
                            <div className="stat-info">
                                <h3>{(statistics.todayRevenue || 0).toLocaleString('vi-VN')}đ</h3>
                                <p>Doanh thu hôm nay</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="admin-sections">
                    <div className="admin-section">
                        <h2>🎬 Quản lý Phim</h2>
                        <p>Thêm, sửa, xóa thông tin phim</p>
                        <button className="admin-btn">Quản lý phim</button>
                    </div>

                    <div className="admin-section">
                        <h2>🏢 Quản lý Rạp</h2>
                        <p>Quản lý thông tin rạp chiếu phim</p>
                        <button className="admin-btn">Quản lý rạp</button>
                    </div>

                    <div className="admin-section">
                        <h2>🎞️ Quản lý Suất Chiếu</h2>
                        <p>Tạo và quản lý lịch chiếu phim</p>
                        <button className="admin-btn">Quản lý suất chiếu</button>
                    </div>

                    <div className="admin-section">
                        <h2>📊 Thống kê & Báo cáo</h2>
                        <p>Xem chi tiết doanh thu và thống kê</p>
                        <button className="admin-btn" onClick={() => alert('Chức năng chi tiết đang phát triển!')}>
                            Xem báo cáo
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
