import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

    const handlePrintTicket = async (booking) => {
        try {
            // Create a temporary div with Vietnamese content
            const ticketDiv = document.createElement('div');
            ticketDiv.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; padding: 40px; background: white; font-family: Arial, sans-serif;';

            ticketDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">VÉ XEM PHIM</h1>
                    <p style="font-size: 20px; margin: 5px 0;">Mã vé: ${booking.ticketCode}</p>
                    <hr style="border: 2px solid #333; margin: 20px 0;">
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">Phim: ${booking.movieTitle}</h2>
                    <p style="font-size: 18px; margin: 8px 0;"><strong>Rạp:</strong> ${booking.theaterName}</p>
                    <p style="font-size: 18px; margin: 8px 0;"><strong>Ngày chiếu:</strong> ${formatDate(booking.showDate)}</p>
                    <p style="font-size: 18px; margin: 8px 0;"><strong>Giờ chiếu:</strong> ${formatTime(booking.showTime)}</p>
                    <p style="font-size: 18px; margin: 8px 0;"><strong>Ghế:</strong> ${booking.seats.join(', ')}</p>
                    <p style="font-size: 20px; margin: 8px 0; color: #e50914;"><strong>Tổng tiền: ${formatCurrency(booking.totalPrice)}</strong></p>
                </div>
                
                <hr style="border: 1px solid #ccc; margin: 25px 0;">
                
                <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">THÔNG TIN KHÁCH HÀNG</h3>
                    <p style="font-size: 16px; margin: 6px 0;"><strong>Họ tên:</strong> ${booking.userName}</p>
                    ${booking.userEmail ? `<p style="font-size: 16px; margin: 6px 0;"><strong>Email:</strong> ${booking.userEmail}</p>` : ''}
                    ${booking.userPhone ? `<p style="font-size: 16px; margin: 6px 0;"><strong>Số điện thoại:</strong> ${booking.userPhone}</p>` : ''}
                    ${booking.userBirthDate ? `<p style="font-size: 16px; margin: 6px 0;"><strong>Ngày sinh:</strong> ${formatDate(booking.userBirthDate)}</p>` : ''}
                    ${booking.userCmnd ? `<p style="font-size: 16px; margin: 6px 0;"><strong>CMND/CCCD:</strong> ${booking.userCmnd}</p>` : ''}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
                    <p style="font-size: 14px; color: #666; margin: 5px 0;">Ngày đặt: ${formatDate(booking.bookingDate)}</p>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                    <p style="font-size: 16px; margin: 8px 0;">Vui lòng mang vé này đến rạp</p>
                    <p style="font-size: 16px; margin: 8px 0;">Cảm ơn quý khách đã sử dụng dịch vụ</p>
                    <p style="font-size: 12px; margin: 15px 0; color: #666;">Ticket Code: ${booking.ticketCode}</p>
                </div>
            `;

            document.body.appendChild(ticketDiv);

            // Convert HTML to canvas with better quality
            const canvas = await html2canvas(ticketDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            document.body.removeChild(ticketDiv);

            // Convert canvas to PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const fileName = `Ve-${booking.movieTitle.replace(/[^a-zA-Z0-9]/g, '')}-${booking.ticketCode}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Lỗi khi tạo PDF');
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

                            <div className="booking-actions">
                                <button
                                    className={`print-ticket-btn ${booking.status === 'CANCELLED' ? 'disabled' : ''}`}
                                    onClick={() => handlePrintTicket(booking)}
                                    disabled={booking.status === 'CANCELLED'}
                                >
                                    In vé
                                </button>
                                {booking.canCancel && (
                                    <button
                                        className="cancel-booking-btn"
                                        onClick={() => handleCancelBooking(booking.id)}
                                    >
                                        Hủy vé
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMovies;
