import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyMovies.css';

const MyMovies = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
    const [sortBy, setSortBy] = useState('bookingDate'); // bookingDate, showDate
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

    useEffect(() => {
        fetchBookings();
    }, [filter, sortBy, sortOrder]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = {};

            if (filter !== 'all') {
                params.status = filter.toUpperCase();
            }
            if (sortBy) {
                params.sortBy = sortBy;
                params.sortOrder = sortOrder;
            }

            const response = await axios.get('http://localhost:8080/api/bookings', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setBookings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (booking) => {
        const showDateTime = new Date(`${booking.showDate}T${booking.showTime}`);
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        if (booking.status === 'CANCELLED') {
            return <span className="status-badge cancelled">Đã hủy</span>;
        }

        if (showDateTime < now) {
            return <span className="status-badge completed">Đã chiếu</span>;
        }

        if (showDateTime <= threeDaysFromNow) {
            return <span className="status-badge upcoming-soon">Sắp chiếu</span>;
        }

        return <span className="status-badge upcoming">Sắp tới</span>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        return timeStr.substring(0, 5); // HH:mm
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy vé này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8080/api/bookings/${bookingId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Hủy vé thành công!');
            fetchBookings(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi hủy vé');
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="my-movies-container">
            <div className="filters-toolbar">
                <div className="filter-group">
                    <label>Bộ lọc:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="purchased">Đã đặt</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="used">Đã sử dụng</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sắp xếp:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="bookingDate">Ngày đặt</option>
                        <option value="showDate">Ngày chiếu</option>
                    </select>

                    <button
                        className="sort-order-btn"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa có vé nào</p>
                </div>
            ) : (
                <div className="bookings-grid">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <h3 className="movie-title">{booking.movieTitle}</h3>
                                {getStatusBadge(booking)}
                            </div>

                            <div className="booking-details">
                                <div className="detail-row">
                                    <strong>Rạp:</strong>
                                    <span>{booking.theaterName}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Ngày chiếu:</strong>
                                    <span>{formatDate(booking.showDate)} - {formatTime(booking.showTime)}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Ghế:</strong>
                                    <span>{booking.seats.join(', ')}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Tổng tiền:</strong>
                                    <span className="price">{formatCurrency(booking.totalPrice)}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Mã vé:</strong>
                                    <span className="ticket-code">{booking.ticketCode}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Ngày đặt:</strong>
                                    <span>{formatDate(booking.bookingDate)}</span>
                                </div>
                            </div>

                            {booking.canCancel && (
                                <button
                                    className="cancel-booking-btn"
                                    onClick={() => handleCancelBooking(booking.id)}
                                >
                                    Hủy vé
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMovies;
