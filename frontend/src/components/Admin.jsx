import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { getUserInfo, getAuthHeaders } from '../utils/auth';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('movies');
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [settings, setSettings] = useState({
        TOTAL_ROWS: '10',
        SEATS_PER_ROW: '8',
        MAX_TICKETS_PER_BOOKING: '10',
        SEAT_HOLD_MINUTES: '10',
        MIN_GAP_BETWEEN_SHOWS: '30'
    });
    const [loading, setLoading] = useState(true);

    // Theater management states
    const [showTheaterModal, setShowTheaterModal] = useState(false);
    const [theaterForm, setTheaterForm] = useState({
        id: null,
        name: '',
        city: '',
        address: '',
        phone: '',
        totalRooms: 1
    });
    const [isEditMode, setIsEditMode] = useState(false);

    // Movie management states
    const [showMovieModal, setShowMovieModal] = useState(false);
    const [movieForm, setMovieForm] = useState({
        id: null,
        title: '',
        description: '',
        genre: '',
        imageUrl: '',
        releaseDate: '',
        ageRating: 'P',
        duration: 90,
        status: 'NOW_SHOWING'
    });
    const [isEditModeMovie, setIsEditModeMovie] = useState(false);

    // Showtime management states
    const [showShowtimeModal, setShowShowtimeModal] = useState(false);
    const [showtimeForm, setShowtimeForm] = useState({
        id: null,
        movieId: '',
        theaterId: '',
        showDate: '',
        showTime: '',
        price: 50000
    });
    const [isEditModeShowtime, setIsEditModeShowtime] = useState(false);

    // Genre management states
    const [genres, setGenres] = useState([]);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [genreForm, setGenreForm] = useState({
        id: null,
        name: '',
        description: ''
    });
    const [isEditModeGenre, setIsEditModeGenre] = useState(false);

    useEffect(() => {
        const user = getUserInfo();
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        setUserInfo(user);
        setLoading(false);
    }, [navigate]);

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === 'movies') {
            fetchMovies();
            fetchGenres();
        } else if (activeTab === 'theaters') {
            fetchTheaters();
        } else if (activeTab === 'showtimes') {
            fetchShowtimes();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'statistics') {
            fetchStatistics();
        } else if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    const fetchMovies = async () => {
        try {
            console.log('🔍 Fetching movies...');
            const response = await fetch('http://localhost:8080/api/movies', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            console.log('📦 Movies response:', data);
            if (data.success) {
                console.log('✅ Setting movies:', data.data?.length, 'items');
                setMovies(data.data || []);
            } else {
                console.error('❌ Fetch movies failed:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        }
    };

    const fetchTheaters = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/theaters', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setTheaters(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch theaters:', error);
        }
    };

    const fetchShowtimes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/showtimes', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setShowtimes(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch showtimes:', error);
        }
    };

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
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/settings', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/bookings', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setBookings(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const fetchGenres = async () => {
        try {
            console.log('🏷️ Fetching genres...');
            const response = await fetch('http://localhost:8080/api/admin/genres', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            console.log('📦 Genres response:', data);
            if (data.success) {
                console.log('✅ Setting genres:', data.data?.length, 'items');
                setGenres(data.data || []);
            } else {
                console.error('❌ Fetch genres failed:', data.message);
                alert('⚠️ Không thể tải danh sách thể loại: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to fetch genres:', error);
            alert('⚠️ Lỗi kết nối: Không thể tải danh sách thể loại. Vui lòng kiểm tra backend đã chạy chưa.');
        }
    };

    const searchBookingByTicket = async (ticketCode) => {
        if (!ticketCode.trim()) {
            alert('Vui lòng nhập mã vé!');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/admin/bookings/search?ticketCode=${ticketCode.trim()}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const data = await response.json();
                alert('❌ ' + (data.message || 'Không tìm thấy vé!'));
                return;
            }

            const data = await response.json();
            if (data.success && data.data) {
                setBookings([data.data]); // Show only searched booking
                alert('✅ Tìm thấy vé!');
            } else {
                alert('❌ ' + (data.message || 'Không tìm thấy vé!'));
                setBookings([]);
            }
        } catch (error) {
            console.error('Failed to search booking:', error);
            alert('❌ Lỗi kết nối! Vui lòng thử lại.');
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role?role=${newRole}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Đã cập nhật quyền người dùng!');
                fetchUsers();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('❌ Không thể cập nhật quyền!');
        }
    };

    const updateUserMembership = async (userId, newLevel) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/membership?membershipLevel=${newLevel}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Đã cập nhật hạng thành viên!');
                fetchUsers();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to update membership:', error);
            alert('❌ Không thể cập nhật hạng thành viên!');
        }
    };

    const saveSettings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/settings', {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Đã lưu cấu hình thành công!');
                setSettings(data.data);
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('❌ Không thể lưu cấu hình!');
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings({
            ...settings,
            [key]: value
        });
    };

    // Theater CRUD functions
    const openAddTheaterModal = () => {
        setTheaterForm({
            id: null,
            name: '',
            city: '',
            address: '',
            phone: '',
            totalRooms: 1
        });
        setIsEditMode(false);
        setShowTheaterModal(true);
    };

    const openEditTheaterModal = (theater) => {
        setTheaterForm({
            id: theater.id,
            name: theater.name,
            city: theater.city || '',
            address: theater.address || '',
            phone: theater.phone || '',
            totalRooms: theater.totalRooms || 1
        });
        setIsEditMode(true);
        setShowTheaterModal(true);
    };

    const closeTheaterModal = () => {
        setShowTheaterModal(false);
        setTheaterForm({
            id: null,
            name: '',
            city: '',
            address: '',
            phone: '',
            totalRooms: 1
        });
        setIsEditMode(false);
    };

    const handleTheaterFormChange = (e) => {
        const { name, value } = e.target;
        setTheaterForm({
            ...theaterForm,
            [name]: value
        });
    };

    const saveTheater = async () => {
        // Validation
        if (!theaterForm.name.trim()) {
            alert('Vui lòng nhập tên rạp!');
            return;
        }
        if (!theaterForm.totalRooms || theaterForm.totalRooms < 1 || theaterForm.totalRooms > 50) {
            alert('Số phòng phải từ 1-50!');
            return;
        }
        if (theaterForm.phone && theaterForm.phone.trim()) {
            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(theaterForm.phone.replace(/[\s-]/g, ''))) {
                alert('Số điện thoại không hợp lệ! (9-11 chữ số)');
                return;
            }
        }

        try {
            const url = isEditMode
                ? `http://localhost:8080/api/theaters/${theaterForm.id}`
                : 'http://localhost:8080/api/theaters';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: theaterForm.name,
                    city: theaterForm.city,
                    address: theaterForm.address,
                    phone: theaterForm.phone,
                    totalRooms: parseInt(theaterForm.totalRooms)
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(isEditMode ? '✅ Đã cập nhật rạp thành công!' : '✅ Đã thêm rạp mới thành công!');
                closeTheaterModal();
                fetchTheaters(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save theater:', error);
            alert('❌ Không thể lưu thông tin rạp!');
        }
    };

    const deleteTheater = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa rạp "${name}"?\n\nLưu ý: Chỉ xóa được nếu rạp chưa có suất chiếu!`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/theaters/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã xóa rạp thành công!');
                fetchTheaters(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to delete theater:', error);
            alert('❌ Không thể xóa rạp!');
        }
    };

    // ===== Movie Management Functions =====
    const openAddMovieModal = () => {
        setMovieForm({
            id: null,
            title: '',
            description: '',
            genre: '',
            imageUrl: '',
            releaseDate: '',
            ageRating: 'P',
            duration: 90,
            status: 'NOW_SHOWING'
        });
        setIsEditModeMovie(false);
        setShowMovieModal(true);
    };

    const openEditMovieModal = (movie) => {
        setMovieForm({
            id: movie.id,
            title: movie.title,
            description: movie.description,
            genre: movie.genre || '',
            imageUrl: movie.imageUrl,
            releaseDate: movie.releaseDate || '',
            ageRating: movie.ageRating,
            duration: movie.duration,
            status: movie.status
        });
        setIsEditModeMovie(true);
        setShowMovieModal(true);
    };

    const closeMovieModal = () => {
        setShowMovieModal(false);
        setMovieForm({
            id: null,
            title: '',
            description: '',
            genre: '',
            imageUrl: '',
            releaseDate: '',
            ageRating: 'P',
            duration: 90,
            status: 'NOW_SHOWING'
        });
        setIsEditModeMovie(false);
    };

    const handleMovieFormChange = (e) => {
        const { name, value } = e.target;
        setMovieForm({
            ...movieForm,
            [name]: value
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 2MB!');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setMovieForm({
                    ...movieForm,
                    imageUrl: reader.result // Base64 string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMovie = async () => {
        // Validation
        if (!movieForm.title.trim()) {
            alert('Vui lòng nhập tên phim!');
            return;
        }
        if (!movieForm.duration || movieForm.duration < 30 || movieForm.duration > 300) {
            alert('Thời lượng phim phải từ 30-300 phút!');
            return;
        }

        try {
            const url = isEditModeMovie
                ? `http://localhost:8080/api/movies/${movieForm.id}`
                : 'http://localhost:8080/api/movies';

            const method = isEditModeMovie ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: movieForm.title,
                    description: movieForm.description,
                    duration: parseInt(movieForm.duration),
                    genre: movieForm.genre,
                    ageRating: movieForm.ageRating,
                    imageUrl: movieForm.imageUrl,
                    releaseDate: movieForm.releaseDate || null,
                    status: movieForm.status
                })
            });

            const data = await response.json();
            console.log('💾 Save movie response:', data);

            if (data.success) {
                alert(isEditModeMovie ? '✅ Đã cập nhật phim thành công!' : '✅ Đã thêm phim mới thành công!');
                closeMovieModal();
                console.log('🔄 Calling fetchMovies after save...');
                await fetchMovies(); // Reload list
                console.log('✅ fetchMovies completed');
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save movie:', error);
            alert('❌ Không thể lưu thông tin phim!');
        }
    };

    const deleteMovie = async (id, title) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phim "${title}"?\n\nLưu ý: Chỉ xóa được nếu phim chưa có suất chiếu!`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã xóa phim thành công!');
                fetchMovies(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to delete movie:', error);
            alert('❌ Không thể xóa phim!');
        }
    };

    // ===== Genre Management Functions =====
    const openAddGenreModal = () => {
        setGenreForm({
            id: null,
            name: '',
            description: ''
        });
        setIsEditModeGenre(false);
        setShowGenreModal(true);
    };

    const openEditGenreModal = (genre) => {
        setGenreForm({
            id: genre.id,
            name: genre.name,
            description: genre.description || ''
        });
        setIsEditModeGenre(true);
        setShowGenreModal(true);
    };

    const closeGenreModal = () => {
        setShowGenreModal(false);
        setGenreForm({
            id: null,
            name: '',
            description: ''
        });
        setIsEditModeGenre(false);
    };

    const handleGenreFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGenreForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveGenre = async (e) => {
        e.preventDefault();

        if (!genreForm.name.trim()) {
            alert('Vui lòng nhập tên thể loại!');
            return;
        }

        try {
            const url = isEditModeGenre
                ? `http://localhost:8080/api/admin/genres/${genreForm.id}`
                : 'http://localhost:8080/api/admin/genres';

            const response = await fetch(url, {
                method: isEditModeGenre ? 'PUT' : 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: genreForm.name,
                    description: genreForm.description
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(isEditModeGenre ? '✅ Cập nhật thể loại thành công!' : '✅ Thêm thể loại thành công!');
                closeGenreModal();
                fetchGenres();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save genre:', error);
            alert('❌ Lỗi khi lưu thể loại!');
        }
    };

    const deleteGenre = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thể loại "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/genres/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã xóa thể loại thành công!');
                fetchGenres();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to delete genre:', error);
            alert('❌ Không thể xóa thể loại!');
        }
    };

    const openGenreManagementModal = () => {
        fetchGenres();
        setShowGenreModal(true);
    };

    // ===== Showtime Management Functions =====
    const openAddShowtimeModal = () => {
        setShowtimeForm({
            id: null,
            movieId: '',
            theaterId: '',
            showDate: '',
            showTime: '',
            price: 50000
        });
        setIsEditModeShowtime(false);
        setShowShowtimeModal(true);
    };

    const openEditShowtimeModal = (showtime) => {
        setShowtimeForm({
            id: showtime.id,
            movieId: showtime.movieId,
            theaterId: showtime.theaterId,
            showDate: showtime.showDate,
            showTime: showtime.showTime,
            price: showtime.price
        });
        setIsEditModeShowtime(true);
        setShowShowtimeModal(true);
    };

    const closeShowtimeModal = () => {
        setShowShowtimeModal(false);
        setShowtimeForm({
            id: null,
            movieId: '',
            theaterId: '',
            showDate: '',
            showTime: '',
            price: 50000
        });
        setIsEditModeShowtime(false);
    };

    const handleShowtimeFormChange = (e) => {
        const { name, value } = e.target;
        setShowtimeForm({
            ...showtimeForm,
            [name]: value
        });
    };

    const saveShowtime = async () => {
        // Validation
        if (!showtimeForm.movieId) {
            alert('Vui lòng chọn phim!');
            return;
        }
        if (!showtimeForm.theaterId) {
            alert('Vui lòng chọn rạp!');
            return;
        }
        if (!showtimeForm.showDate) {
            alert('Vui lòng chọn ngày chiếu!');
            return;
        }

        // Validate date is not in the past
        const selectedDate = new Date(showtimeForm.showDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert('Ngày chiếu không được trong quá khứ!');
            return;
        }

        if (!showtimeForm.showTime) {
            alert('Vui lòng chọn giờ chiếu!');
            return;
        }
        if (!showtimeForm.price || showtimeForm.price < 10000) {
            alert('Giá vé phải từ 10,000 VNĐ trở lên!');
            return;
        }

        try {
            const url = isEditModeShowtime
                ? `http://localhost:8080/api/showtimes/${showtimeForm.id}`
                : 'http://localhost:8080/api/showtimes';

            const method = isEditModeShowtime ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    movieId: parseInt(showtimeForm.movieId),
                    theaterId: parseInt(showtimeForm.theaterId),
                    showDate: showtimeForm.showDate,
                    showTime: showtimeForm.showTime,
                    price: parseFloat(showtimeForm.price)
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(isEditModeShowtime ? '✅ Đã cập nhật suất chiếu thành công!' : '✅ Đã thêm suất chiếu mới thành công!');
                closeShowtimeModal();
                fetchShowtimes(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save showtime:', error);
            alert('❌ Không thể lưu thông tin suất chiếu!');
        }
    };

    const deleteShowtime = async (id, movieTitle, theaterName, showDate, showTime) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu?\n\nPhim: ${movieTitle}\nRạp: ${theaterName}\nNgày: ${showDate}\nGiờ: ${showTime}\n\nLưu ý: Chỉ xóa được nếu chưa có booking!`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/showtimes/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã xóa suất chiếu thành công!');
                fetchShowtimes(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to delete showtime:', error);
            alert('❌ Không thể xóa suất chiếu!');
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

                {/* Tab Navigation */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        <span className="tab-icon">🎬</span>
                        <span className="tab-text">Quản lý Phim</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'theaters' ? 'active' : ''}`}
                        onClick={() => setActiveTab('theaters')}
                    >
                        <span className="tab-icon">🏢</span>
                        <span className="tab-text">Quản lý Rạp</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('showtimes')}
                    >
                        <span className="tab-icon">🎞️</span>
                        <span className="tab-text">Quản lý Suất Chiếu</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <span className="tab-icon">👥</span>
                        <span className="tab-text">Quản lý Người dùng</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <span className="tab-icon">🎫</span>
                        <span className="tab-text">Quản lý Đặt vé</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('statistics')}
                    >
                        <span className="tab-icon">📊</span>
                        <span className="tab-text">Thống kê & Báo cáo</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span className="tab-icon">⚙️</span>
                        <span className="tab-text">Cấu hình Hệ thống</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'movies' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🎬 Quản lý Phim</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="add-btn" onClick={openGenreManagementModal} style={{ backgroundColor: '#6c757d' }}>
                                        🏷️ Chỉnh sửa thể loại
                                    </button>
                                    <button className="add-btn" onClick={openAddMovieModal}>
                                        + Thêm phim mới
                                    </button>
                                </div>
                            </div>
                            <p className="section-description">Thêm, sửa, xóa thông tin phim</p>

                            {movies.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có phim nào. Hãy thêm phim mới!</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên phim</th>
                                                <th>Thể loại</th>
                                                <th>Mô tả</th>
                                                <th>Độ tuổi</th>
                                                <th>Thời lượng</th>
                                                <th>Ngày khởi chiếu</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movies.map(movie => (
                                                <tr key={movie.id}>
                                                    <td>{movie.id}</td>
                                                    <td>
                                                        <strong>{movie.title}</strong>
                                                        {movie.imageUrl && (
                                                            <div style={{ marginTop: '4px' }}>
                                                                <img
                                                                    src={movie.imageUrl}
                                                                    alt={movie.title}
                                                                    style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            background: '#e3f2fd',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.9em',
                                                            color: '#1976d2'
                                                        }}>
                                                            {movie.genre || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={{ maxWidth: '250px' }}>
                                                        {movie.description ? (
                                                            movie.description.length > 80
                                                                ? movie.description.substring(0, 80) + '...'
                                                                : movie.description
                                                        ) : '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge age-${movie.ageRating}`}>
                                                            {movie.ageRating}
                                                        </span>
                                                    </td>
                                                    <td>{movie.duration} phút</td>
                                                    <td>
                                                        {movie.releaseDate ?
                                                            new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                                                            : '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge status-${movie.status}`}>
                                                            {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' :
                                                                movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã kết thúc'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => openEditMovieModal(movie)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => deleteMovie(movie.id, movie.title)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'theaters' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🏢 Quản lý Rạp</h2>
                                <button className="add-btn" onClick={openAddTheaterModal}>
                                    + Thêm rạp mới
                                </button>
                            </div>
                            <p className="section-description">Quản lý thông tin rạp chiếu phim</p>

                            {theaters.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có rạp nào. Hãy thêm rạp mới!</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên rạp</th>
                                                <th>Thành phố</th>
                                                <th>Địa chỉ</th>
                                                <th>Số điện thoại</th>
                                                <th>Số phòng</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {theaters.map(theater => (
                                                <tr key={theater.id}>
                                                    <td>{theater.id}</td>
                                                    <td><strong>{theater.name}</strong></td>
                                                    <td>{theater.city || '-'}</td>
                                                    <td>{theater.address || '-'}</td>
                                                    <td>{theater.phone || '-'}</td>
                                                    <td>{theater.totalRooms || 1}</td>
                                                    <td>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => openEditTheaterModal(theater)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => deleteTheater(theater.id, theater.name)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'showtimes' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🎞️ Quản lý Suất Chiếu</h2>
                                <button className="add-btn" onClick={openAddShowtimeModal}>
                                    + Thêm suất chiếu mới
                                </button>
                            </div>
                            <p className="section-description">Tạo và quản lý lịch chiếu phim</p>

                            {showtimes.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có suất chiếu nào. Hãy thêm suất chiếu mới!</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Phim</th>
                                                <th>Rạp</th>
                                                <th>Ngày chiếu</th>
                                                <th>Giờ chiếu</th>
                                                <th>Giá vé</th>
                                                <th>Ghế trống</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {showtimes.map(showtime => (
                                                <tr key={showtime.id}>
                                                    <td>{showtime.id}</td>
                                                    <td><strong>{showtime.movieTitle || 'N/A'}</strong></td>
                                                    <td>{showtime.theaterName || 'N/A'}</td>
                                                    <td>{showtime.showDate}</td>
                                                    <td>{showtime.showTime}</td>
                                                    <td>{(showtime.price || 0).toLocaleString('vi-VN')}₫</td>
                                                    <td>
                                                        <span className={showtime.availableSeats === 0 ? 'text-danger' : ''}>
                                                            {showtime.availableSeats}/{showtime.totalSeats}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => openEditShowtimeModal(showtime)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => deleteShowtime(
                                                                showtime.id,
                                                                showtime.movieTitle,
                                                                showtime.theaterName,
                                                                showtime.showDate,
                                                                showtime.showTime
                                                            )}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>👥 Quản lý Người dùng</h2>
                            </div>
                            <p className="section-description">Xem danh sách và quản lý quyền người dùng</p>

                            {users.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có người dùng nào.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>SĐT</th>
                                                <th>Quyền</th>
                                                <th>Hạng</th>
                                                <th>Điểm</th>
                                                <th>Số dư</th>
                                                <th>Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td><strong>{user.name}</strong></td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email || '-'}</td>
                                                    <td>{user.phone}</td>
                                                    <td>
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => {
                                                                if (window.confirm(`Bạn có chắc muốn đổi quyền của ${user.name} thành ${e.target.value}?`)) {
                                                                    updateUserRole(user.id, e.target.value);
                                                                }
                                                            }}
                                                            className={`role-select role-${user.role}`}
                                                        >
                                                            <option value="USER">USER</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={user.membershipLevel}
                                                            onChange={(e) => {
                                                                if (window.confirm(`Bạn có chắc muốn đổi hạng của ${user.name} thành ${e.target.value}?`)) {
                                                                    updateUserMembership(user.id, e.target.value);
                                                                }
                                                            }}
                                                            className={`membership-select membership-${user.membershipLevel}`}
                                                        >
                                                            <option value="NORMAL">NORMAL</option>
                                                            <option value="GOLD">GOLD</option>
                                                            <option value="PLATINUM">PLATINUM</option>
                                                        </select>
                                                    </td>
                                                    <td>{user.points || 0}</td>
                                                    <td>{(user.accountBalance || 0).toLocaleString('vi-VN')}₫</td>
                                                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🎫 Quản lý Đặt vé</h2>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        id="ticketSearchInput"
                                        placeholder="Nhập mã vé để tìm kiếm..."
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: '2px solid #e9ecef',
                                            fontSize: '1em',
                                            width: '250px'
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                searchBookingByTicket(e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        className="add-btn"
                                        onClick={() => {
                                            const input = document.getElementById('ticketSearchInput');
                                            searchBookingByTicket(input.value);
                                        }}
                                    >
                                        🔍 Tìm kiếm
                                    </button>
                                    <button
                                        className="add-btn"
                                        style={{ background: '#6c757d' }}
                                        onClick={() => {
                                            document.getElementById('ticketSearchInput').value = '';
                                            fetchBookings();
                                        }}
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                            </div>
                            <p className="section-description">Xem và quản lý danh sách đặt vé</p>

                            {bookings.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có đặt vé nào.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Mã vé</th>
                                                <th>Khách hàng</th>
                                                <th>Phim</th>
                                                <th>Rạp</th>
                                                <th>Ngày chiếu</th>
                                                <th>Giờ chiếu</th>
                                                <th>Ghế</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày đặt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(booking => (
                                                <tr key={booking.id}>
                                                    <td><strong>{booking.ticketCode}</strong></td>
                                                    <td>{booking.userName}</td>
                                                    <td>{booking.movieTitle}</td>
                                                    <td>{booking.theaterName}</td>
                                                    <td>{booking.showDate}</td>
                                                    <td>{booking.showTime}</td>
                                                    <td>{booking.seats?.join(', ') || '-'}</td>
                                                    <td>{(booking.totalPrice || 0).toLocaleString('vi-VN')}₫</td>
                                                    <td>
                                                        <span className={`badge status-${booking.status}`}>
                                                            {booking.status === 'PURCHASED' ? 'Đã thanh toán' :
                                                                booking.status === 'PENDING' ? 'Chờ thanh toán' :
                                                                    booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(booking.bookingDate).toLocaleString('vi-VN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>📊 Thống kê & Báo cáo</h2>
                            </div>
                            <p className="section-description">Xem chi tiết doanh thu và thống kê hệ thống</p>

                            {statistics ? (
                                <>
                                    {/* Main Stats Cards */}
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
                                                <h3>{(statistics.totalRevenue || 0).toLocaleString('vi-VN')}₫</h3>
                                                <p>Tổng doanh thu</p>
                                            </div>
                                        </div>

                                        <div className="stat-card highlight">
                                            <div className="stat-icon">📅</div>
                                            <div className="stat-info">
                                                <h3>{statistics.todayBookings || 0} vé</h3>
                                                <p>Đặt vé hôm nay</p>
                                                <small style={{ fontSize: '0.9em', color: '#666' }}>
                                                    {(statistics.todayRevenue || 0).toLocaleString('vi-VN')}₫
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Statistics */}
                                    <div className="stats-details">
                                        {/* Top Movies */}
                                        <div className="stats-section">
                                            <h3>🏆 Top 5 Phim Bán Chạy</h3>
                                            {statistics.topMovies && Object.keys(statistics.topMovies).length > 0 ? (
                                                <div className="top-movies-list">
                                                    {Object.entries(statistics.topMovies).map(([title, count], index) => (
                                                        <div key={title} className="top-movie-item">
                                                            <span className="rank">#{index + 1}</span>
                                                            <span className="movie-title">{title}</span>
                                                            <span className="movie-count">{count} vé</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="no-data">Chưa có dữ liệu</p>
                                            )}
                                        </div>

                                        {/* Bookings by Status */}
                                        <div className="stats-section">
                                            <h3>📋 Trạng thái Đặt vé</h3>
                                            {statistics.bookingsByStatus && Object.keys(statistics.bookingsByStatus).length > 0 ? (
                                                <div className="status-list">
                                                    {Object.entries(statistics.bookingsByStatus).map(([status, count]) => (
                                                        <div key={status} className="status-item">
                                                            <span className={`status-badge status-${status}`}>
                                                                {status === 'PURCHASED' ? 'Đã thanh toán' :
                                                                    status === 'PENDING' ? 'Chờ thanh toán' :
                                                                        status === 'CANCELLED' ? 'Đã hủy' : status}
                                                            </span>
                                                            <span className="status-count">{count} đơn</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="no-data">Chưa có dữ liệu</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Revenue by Month */}
                                    <div className="stats-section revenue-chart">
                                        <h3>📈 Doanh thu 6 tháng gần đây</h3>
                                        {statistics.revenueByMonth && Object.keys(statistics.revenueByMonth).length > 0 ? (
                                            <div className="revenue-bars">
                                                {Object.entries(statistics.revenueByMonth).map(([month, revenue]) => {
                                                    const maxRevenue = Math.max(...Object.values(statistics.revenueByMonth));
                                                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue * 100) : 0;
                                                    return (
                                                        <div key={month} className="revenue-bar-wrapper">
                                                            <div className="revenue-label">
                                                                <span className="month">{month}</span>
                                                                <span className="amount">{Number(revenue).toLocaleString('vi-VN')}₫</span>
                                                            </div>
                                                            <div className="revenue-bar-container">
                                                                <div
                                                                    className="revenue-bar"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="no-data">Chưa có dữ liệu</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <p>Đang tải dữ liệu thống kê...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>⚙️ Cấu hình Hệ thống</h2>
                            </div>
                            <p className="section-description">
                                Cài đặt chung cho toàn hệ thống. Thay đổi sẽ áp dụng cho các suất chiếu mới tạo.
                            </p>

                            <div className="settings-container">
                                <div className="settings-section">
                                    <h3>📺 Cấu hình Phòng Chiếu</h3>
                                    <p className="settings-note">
                                        Áp dụng cho TẤT CẢ phòng chiếu của TẤT CẢ rạp trong hệ thống
                                    </p>

                                    <div className="setting-item">
                                        <label>Số hàng ghế:</label>
                                        <input
                                            type="number"
                                            value={settings.TOTAL_ROWS}
                                            onChange={(e) => handleSettingChange('TOTAL_ROWS', e.target.value)}
                                            min={5}
                                            max={20}
                                        />
                                        <span className="hint">
                                            Ví dụ: {settings.TOTAL_ROWS} → Hàng A đến {String.fromCharCode(64 + parseInt(settings.TOTAL_ROWS))}
                                        </span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Số ghế mỗi hàng:</label>
                                        <input
                                            type="number"
                                            value={settings.SEATS_PER_ROW}
                                            onChange={(e) => handleSettingChange('SEATS_PER_ROW', e.target.value)}
                                            min={6}
                                            max={15}
                                        />
                                        <span className="hint">
                                            Ví dụ: {settings.SEATS_PER_ROW} → Ghế 1 đến {settings.SEATS_PER_ROW}
                                        </span>
                                    </div>

                                    <div className="calculated-result">
                                        <strong>→ Tổng số ghế mỗi phòng: {parseInt(settings.TOTAL_ROWS) * parseInt(settings.SEATS_PER_ROW)} ghế</strong>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>🎫 Giới hạn Đặt vé</h3>

                                    <div className="setting-item">
                                        <label>Số vé tối đa mỗi lần đặt:</label>
                                        <input
                                            type="number"
                                            value={settings.MAX_TICKETS_PER_BOOKING}
                                            onChange={(e) => handleSettingChange('MAX_TICKETS_PER_BOOKING', e.target.value)}
                                            min={1}
                                            max={50}
                                        />
                                        <span className="hint">vé</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Thời gian giữ ghế:</label>
                                        <input
                                            type="number"
                                            value={settings.SEAT_HOLD_MINUTES}
                                            onChange={(e) => handleSettingChange('SEAT_HOLD_MINUTES', e.target.value)}
                                            min={5}
                                            max={30}
                                        />
                                        <span className="hint">phút (Timeout khi khách đang đặt vé)</span>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>🎬 Quy định Suất chiếu</h3>

                                    <div className="setting-item">
                                        <label>Khoảng cách tối thiểu giữa các suất:</label>
                                        <input
                                            type="number"
                                            value={settings.MIN_GAP_BETWEEN_SHOWS}
                                            onChange={(e) => handleSettingChange('MIN_GAP_BETWEEN_SHOWS', e.target.value)}
                                            min={15}
                                            max={60}
                                        />
                                        <span className="hint">phút (Thời gian dọn dẹp phòng)</span>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="save-settings-btn" onClick={saveSettings}>
                                        💾 Lưu cài đặt
                                    </button>
                                </div>

                                <div className="settings-warning">
                                    ⚠️ <strong>Lưu ý:</strong> Các thay đổi này chỉ áp dụng cho các suất chiếu
                                    TẠO MỚI sau khi lưu. Các suất chiếu và booking đã tạo KHÔNG bị ảnh hưởng.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Theater Modal */}
            {showTheaterModal && (
                <div className="modal-overlay" onClick={closeTheaterModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? '✏️ Chỉnh sửa rạp' : '➕ Thêm rạp mới'}</h2>
                            <button className="modal-close" onClick={closeTheaterModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên rạp <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={theaterForm.name}
                                    onChange={handleTheaterFormChange}
                                    placeholder="VD: CGV Vincom Center"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={theaterForm.city}
                                    onChange={handleTheaterFormChange}
                                    placeholder="VD: Hà Nội"
                                />
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <textarea
                                    name="address"
                                    value={theaterForm.address}
                                    onChange={handleTheaterFormChange}
                                    placeholder="VD: 191 Bà Triệu, Hai Bà Trưng, Hà Nội"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={theaterForm.phone}
                                    onChange={handleTheaterFormChange}
                                    placeholder="VD: 1900xxxx"
                                />
                            </div>

                            <div className="form-group">
                                <label>Số phòng chiếu <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="totalRooms"
                                    value={theaterForm.totalRooms}
                                    onChange={handleTheaterFormChange}
                                    min={1}
                                    max={20}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeTheaterModal}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={saveTheater}>
                                {isEditMode ? '💾 Cập nhật' : '➕ Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Movie Modal */}
            {showMovieModal && (
                <div className="modal-overlay" onClick={closeMovieModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditModeMovie ? '✏️ Chỉnh sửa phim' : '➕ Thêm phim mới'}</h2>
                            <button className="modal-close" onClick={closeMovieModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên phim <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={movieForm.title}
                                    onChange={handleMovieFormChange}
                                    placeholder="VD: Avengers: Endgame"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả phim</label>
                                <textarea
                                    name="description"
                                    value={movieForm.description}
                                    onChange={handleMovieFormChange}
                                    placeholder="Mô tả nội dung phim..."
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ảnh poster <span className="required">*</span></label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{
                                        padding: '10px',
                                        border: '2px dashed #e9ecef',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <small style={{ color: '#666', fontSize: '0.85em' }}>
                                    Chọn ảnh (JPG, PNG, GIF) - Tối đa 2MB
                                </small>
                                {movieForm.imageUrl && (
                                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                        <img
                                            src={movieForm.imageUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '280px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                            }}
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                        <div style={{ marginTop: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setMovieForm({ ...movieForm, imageUrl: '' })}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85em'
                                                }}
                                            >
                                                🗑️ Xóa ảnh
                                            </button>
                                        </div>
                                    </div>
                                )}                            </div>

                            <div className="form-group">
                                <label>Thể loại phim</label>
                                <select
                                    name="genre"
                                    value={movieForm.genre}
                                    onChange={handleMovieFormChange}
                                >
                                    <option value="">-- Chọn thể loại --</option>
                                    {genres.map(genre => (
                                        <option key={genre.id} value={genre.name}>
                                            {genre.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ngày khởi chiếu</label>
                                <input
                                    type="date"
                                    name="releaseDate"
                                    value={movieForm.releaseDate}
                                    onChange={handleMovieFormChange}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Độ tuổi <span className="required">*</span></label>
                                    <select
                                        name="ageRating"
                                        value={movieForm.ageRating}
                                        onChange={handleMovieFormChange}
                                    >
                                        <option value="P">P - Phổ biến</option>
                                        <option value="C13">C13 - Trên 13 tuổi</option>
                                        <option value="C16">C16 - Trên 16 tuổi</option>
                                        <option value="C18">C18 - Trên 18 tuổi</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Thời lượng (phút) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={movieForm.duration}
                                        onChange={handleMovieFormChange}
                                        min={30}
                                        max={300}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Trạng thái <span className="required">*</span></label>
                                <select
                                    name="status"
                                    value={movieForm.status}
                                    onChange={handleMovieFormChange}
                                >
                                    <option value="NOW_SHOWING">Đang chiếu</option>
                                    <option value="COMING_SOON">Sắp chiếu</option>
                                    <option value="ENDED">Đã kết thúc</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeMovieModal}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={saveMovie}>
                                {isEditModeMovie ? '💾 Cập nhật' : '➕ Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Showtime Modal */}
            {showShowtimeModal && (
                <div className="modal-overlay" onClick={closeShowtimeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditModeShowtime ? '✏️ Chỉnh sửa suất chiếu' : '➕ Thêm suất chiếu mới'}</h2>
                            <button className="modal-close" onClick={closeShowtimeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Phim <span className="required">*</span></label>
                                <select
                                    name="movieId"
                                    value={showtimeForm.movieId}
                                    onChange={handleShowtimeFormChange}
                                    required
                                >
                                    <option value="">-- Chọn phim --</option>
                                    {movies.filter(m => m.status === 'NOW_SHOWING' || m.status === 'COMING_SOON').map(movie => (
                                        <option key={movie.id} value={movie.id}>
                                            {movie.title} ({movie.duration} phút - {movie.ageRating})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Rạp chiếu <span className="required">*</span></label>
                                <select
                                    name="theaterId"
                                    value={showtimeForm.theaterId}
                                    onChange={handleShowtimeFormChange}
                                    required
                                >
                                    <option value="">-- Chọn rạp --</option>
                                    {theaters.map(theater => (
                                        <option key={theater.id} value={theater.id}>
                                            {theater.name} - {theater.city} ({theater.totalRooms} phòng)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Ngày chiếu <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        name="showDate"
                                        value={showtimeForm.showDate}
                                        onChange={handleShowtimeFormChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Giờ chiếu <span className="required">*</span></label>
                                    <input
                                        type="time"
                                        name="showTime"
                                        value={showtimeForm.showTime}
                                        onChange={handleShowtimeFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Giá vé (VNĐ) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    value={showtimeForm.price}
                                    onChange={handleShowtimeFormChange}
                                    min={10000}
                                    step={5000}
                                    placeholder="50000"
                                    required
                                />
                                <span className="hint" style={{ fontSize: '0.9em', color: '#666', marginTop: '4px', display: 'block' }}>
                                    {showtimeForm.price ? `${parseInt(showtimeForm.price).toLocaleString('vi-VN')}₫` : ''}
                                </span>
                            </div>

                            {isEditModeShowtime && (
                                <div className="alert-info" style={{
                                    background: '#e3f2fd',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginTop: '16px',
                                    color: '#1565c0',
                                    fontSize: '0.9em'
                                }}>
                                    ⚠️ <strong>Lưu ý:</strong> Thay đổi thời gian/ngày chiếu có thể ảnh hưởng đến booking hiện tại!
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeShowtimeModal}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={saveShowtime}>
                                {isEditModeShowtime ? '💾 Cập nhật' : '➕ Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Genre Management Modal */}
            {showGenreModal && (
                <div className="modal-overlay" onClick={closeGenreModal}>
                    <div className="modal-content genre-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🏷️ Quản lý Thể loại Phim</h3>
                            <button className="close-btn" onClick={closeGenreModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="genre-management-section">
                                {/* Add/Edit Genre Form */}
                                <div className="genre-form-section">
                                    <h4>{isEditModeGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</h4>
                                    <form onSubmit={saveGenre}>
                                        <div className="form-group">
                                            <label>Tên thể loại *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={genreForm.name}
                                                onChange={handleGenreFormChange}
                                                placeholder="VD: Hành Động, Kinh Dị..."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Mô tả</label>
                                            <input
                                                type="text"
                                                name="description"
                                                value={genreForm.description}
                                                onChange={handleGenreFormChange}
                                                placeholder="Mô tả ngắn về thể loại"
                                            />
                                        </div>

                                        <div className="form-actions">
                                            <button type="button" className="btn-cancel" onClick={() => {
                                                setGenreForm({
                                                    id: null,
                                                    name: '',
                                                    description: ''
                                                });
                                                setIsEditModeGenre(false);
                                            }}>
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn-save">
                                                {isEditModeGenre ? '💾 Cập nhật' : '➕ Thêm mới'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Genres List */}
                                <div className="genres-list-section">
                                    <h4>Danh sách thể loại ({genres.length})</h4>
                                    {genres.length === 0 ? (
                                        <p className="empty-message">Chưa có thể loại nào</p>
                                    ) : (
                                        <div className="genres-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Tên</th>
                                                        <th>Mô tả</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {genres.map(genre => (
                                                        <tr key={genre.id}>
                                                            <td>{genre.id}</td>
                                                            <td><strong>{genre.name}</strong></td>
                                                            <td>{genre.description || '-'}</td>
                                                            <td>
                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() => openEditGenreModal(genre)}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => deleteGenre(genre.id, genre.name)}
                                                                    title="Xóa"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeGenreModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Admin;
