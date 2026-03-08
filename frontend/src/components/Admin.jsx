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
        MAX_TICKETS_PER_BOOKING: '10',
        SEAT_HOLD_MINUTES: '10',
        MIN_GAP_BETWEEN_SHOWS: '30',
        MIN_HOURS_BEFORE_CANCEL: '48',
        REFUND_PERCENTAGE: '80'
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
        totalRooms: 1,
        defaultRows: 10,
        defaultCols: 8
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [theaterSearch, setTheaterSearch] = useState('');
    const [theaterSortField, setTheaterSortField] = useState('');
    const [theaterSortOrder, setTheaterSortOrder] = useState('asc');
    const [theaterCityFilter, setTheaterCityFilter] = useState('');

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
    const [movieSearch, setMovieSearch] = useState('');
    const [movieSortField, setMovieSortField] = useState('');
    const [movieSortOrder, setMovieSortOrder] = useState('asc');
    const [movieGenreFilter, setMovieGenreFilter] = useState('');

    // Showtime management states
    const [showShowtimeModal, setShowShowtimeModal] = useState(false);
    const [showtimeForm, setShowtimeForm] = useState({
        id: null,
        movieId: '',
        theaterId: '',
        roomId: '',
        showDate: '',
        showTime: '',
        price: 50000
    });
    const [isEditModeShowtime, setIsEditModeShowtime] = useState(false);
    const [showtimeSearch, setShowtimeSearch] = useState('');
    const [showtimeSortField, setShowtimeSortField] = useState('');
    const [showtimeSortOrder, setShowtimeSortOrder] = useState('asc');
    const [showtimeTheaterFilter, setShowtimeTheaterFilter] = useState('');
    const [cinemaRooms, setCinemaRooms] = useState([]);

    // Room management states
    const [rooms, setRooms] = useState([]);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [roomForm, setRoomForm] = useState({
        id: null,
        theaterId: '',
        name: '',
        totalRows: 10,
        totalCols: 8
    });
    const [isEditModeRoom, setIsEditModeRoom] = useState(false);
    const [roomTheaterFilter, setRoomTheaterFilter] = useState('');
    const [roomSortField, setRoomSortField] = useState('');
    const [roomSortOrder, setRoomSortOrder] = useState('asc');

    // Genre management states
    const [genres, setGenres] = useState([]);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [genreForm, setGenreForm] = useState({
        id: null,
        name: '',
        description: ''
    });
    const [isEditModeGenre, setIsEditModeGenre] = useState(false);

    // User management states
    const [userSearch, setUserSearch] = useState('');
    const [userSortField, setUserSortField] = useState('');
    const [userSortOrder, setUserSortOrder] = useState('asc');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [userMembershipFilter, setUserMembershipFilter] = useState('');

    // Booking management states
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingSortField, setBookingSortField] = useState('');
    const [bookingSortOrder, setBookingSortOrder] = useState('asc');
    const [bookingTheaterFilter, setBookingTheaterFilter] = useState('');

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
        console.log('🔄 Active tab changed to:', activeTab);
        if (activeTab === 'movies') {
            fetchMovies();
            fetchGenres();
        } else if (activeTab === 'theaters') {
            fetchTheaters();
        } else if (activeTab === 'rooms') {
            fetchRooms();
            fetchTheaters(); // Need theaters for filter dropdown
        } else if (activeTab === 'showtimes') {
            fetchShowtimes();
            fetchTheaters(); // Need theaters for filter dropdown
        } else if (activeTab === 'users') {
            console.log('👥 Fetching users for users tab...');
            fetchUsers();
        } else if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'statistics') {
            fetchStatistics();
        } else if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    // Debug: Log whenever users state changes
    useEffect(() => {
        console.log('📊 Users state changed. Count:', users.length, 'Users:', users);
    }, [users]);

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

    const fetchCinemaRooms = async (theaterId) => {
        if (!theaterId) {
            setCinemaRooms([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/rooms?theaterId=${theaterId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setCinemaRooms(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch cinema rooms:', error);
            setCinemaRooms([]);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/rooms', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setRooms(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            alert('Không thể tải danh sách phòng chiếu!');
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
            console.log('🔍 Fetching users...');
            console.log('🔑 Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: getAuthHeaders()
            });
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (!response.ok) {
                console.error('❌ Response not OK, status:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                alert(`Lỗi khi tải danh sách người dùng: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log('📦 Users response:', data);
            console.log('✅ Users data array:', data.data);
            console.log('📊 Data type:', typeof data.data, 'Is array:', Array.isArray(data.data));

            if (data.success && data.data) {
                console.log('🎯 Setting users to state:', data.data.length, 'users');
                setUsers(data.data);
                console.log('✅ Users state updated');
            } else {
                console.error('❌ API returned success=false or no data:', data);
                alert(`Lỗi API: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
            console.error('❌ Error stack:', error.stack);
            alert(`Lỗi kết nối: ${error.message}`);
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
            totalRooms: 1,
            defaultRows: 10,
            defaultCols: 8
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
            totalRooms: theater.totalRooms || 1,
            defaultRows: theater.defaultRows || 10,
            defaultCols: theater.defaultCols || 8
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
            totalRooms: 1,
            defaultRows: 10,
            defaultCols: 8
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
                    totalRooms: parseInt(theaterForm.totalRooms),
                    defaultRows: parseInt(theaterForm.defaultRows),
                    defaultCols: parseInt(theaterForm.defaultCols)
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

    const migrateCinemaRooms = async () => {
        const confirmMessage =
            '⚠️ CẢNH BÁO: Hành động này sẽ:\n\n' +
            '❌ XÓA TẤT CẢ SUẤT CHIẾU hiện tại\n' +
            '❌ XÓA TẤT CẢ PHÒNG CHIẾU hiện tại\n' +
            '✅ TẠO LẠI phòng theo format: "Phòng 01, 02,..."\n' +
            '✅ Mỗi phòng: 10 hàng × 8 cột = 80 ghế\n\n' +
            'Bạn có chắc chắn muốn tiếp tục?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/admin/migrate-cinema-rooms', {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                const result = data.data;
                alert(
                    '✅ MIGRATION THÀNH CÔNG!\n\n' +
                    `📊 Thống kê:\n` +
                    `• Đã xóa ${result.deletedShowtimes} suất chiếu\n` +
                    `• Đã xóa ${result.deletedRooms} phòng cũ\n` +
                    `• Đã tạo ${result.createdRooms} phòng mới cho ${result.theaters} rạp\n\n` +
                    `🎉 Tất cả phòng giờ có format chuẩn với 80 ghế!`
                );
                // Reload data
                await fetchTheaters();
                await fetchShowtimes();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to migrate cinema rooms:', error);
            alert('❌ Không thể thực hiện migration!');
        }
    };

    // Room management functions
    const openAddRoomModal = () => {
        setRoomForm({
            id: null,
            theaterId: '',
            name: '',
            totalRows: 10,
            totalCols: 8
        });
        setIsEditModeRoom(false);
        setShowRoomModal(true);
    };

    const openEditRoomModal = (room) => {
        setRoomForm({
            id: room.id,
            theaterId: room.theaterId,
            name: room.name,
            totalRows: room.totalRows,
            totalCols: room.totalCols
        });
        setIsEditModeRoom(true);
        setShowRoomModal(true);
    };

    const closeRoomModal = () => {
        setShowRoomModal(false);
        setRoomForm({
            id: null,
            theaterId: '',
            name: '',
            totalRows: 10,
            totalCols: 8
        });
        setIsEditModeRoom(false);
    };

    const handleRoomFormChange = (e) => {
        const { name, value } = e.target;
        setRoomForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveRoom = async () => {
        // Validation
        if (!roomForm.theaterId) {
            alert('Vui lòng chọn rạp chiếu!');
            return;
        }
        if (!roomForm.name.trim()) {
            alert('Vui lòng nhập tên phòng!');
            return;
        }
        if (!roomForm.totalRows || roomForm.totalRows < 1 || roomForm.totalRows > 20) {
            alert('Số hàng ghế phải từ 1-20!');
            return;
        }
        if (!roomForm.totalCols || roomForm.totalCols < 1 || roomForm.totalCols > 20) {
            alert('Số ghế mỗi hàng phải từ 1-20!');
            return;
        }

        try {
            const url = isEditModeRoom
                ? `http://localhost:8080/api/rooms/${roomForm.id}`
                : 'http://localhost:8080/api/rooms';

            const method = isEditModeRoom ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theaterId: parseInt(roomForm.theaterId),
                    name: roomForm.name,
                    totalRows: parseInt(roomForm.totalRows),
                    totalCols: parseInt(roomForm.totalCols)
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(isEditModeRoom ? '✅ Đã cập nhật phòng chiếu thành công!' : '✅ Đã thêm phòng chiếu mới thành công!');
                closeRoomModal();
                fetchRooms(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to save room:', error);
            alert('❌ Không thể lưu thông tin phòng chiếu!');
        }
    };

    const deleteRoom = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${name}"?\n\nLưu ý: Chỉ xóa được nếu phòng chưa có suất chiếu!`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã xóa phòng chiếu thành công!');
                fetchRooms(); // Reload list
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to delete room:', error);
            alert('❌ Không thể xóa phòng chiếu!');
        }
    };

    // Sort theater handler
    const handleTheaterSort = (field) => {
        if (theaterSortField === field) {
            setTheaterSortOrder(theaterSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setTheaterSortField(field);
            setTheaterSortOrder('asc');
        }
    };

    const handleRoomSort = (field) => {
        if (roomSortField === field) {
            setRoomSortOrder(roomSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setRoomSortField(field);
            setRoomSortOrder('asc');
        }
    };

    // Filter and sort theaters
    const getFilteredAndSortedTheaters = () => {
        let filtered = [...theaters];

        // Filter by city
        if (theaterCityFilter) {
            filtered = filtered.filter(theater =>
                theater.city === theaterCityFilter
            );
        }

        // Filter by search (theater name only)
        if (theaterSearch.trim()) {
            const searchLower = theaterSearch.toLowerCase();
            filtered = filtered.filter(theater =>
                theater.name && theater.name.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (theaterSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (theaterSortField) {
                    case 'name':
                        aVal = (a.name || '').toLowerCase();
                        bVal = (b.name || '').toLowerCase();
                        break;
                    case 'city':
                        aVal = (a.city || '').toLowerCase();
                        bVal = (b.city || '').toLowerCase();
                        break;
                    case 'address':
                        aVal = (a.address || '').toLowerCase();
                        bVal = (b.address || '').toLowerCase();
                        break;
                    case 'rooms':
                        aVal = a.totalRooms || 0;
                        bVal = b.totalRooms || 0;
                        break;
                    default:
                        return 0;
                }

                if (aVal < bVal) return theaterSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return theaterSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    // Get unique cities from theaters
    const getUniqueCities = () => {
        const cities = [...new Set(theaters.map(t => t.city).filter(c => c))];
        return cities.sort();
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
            status: 'COMING_SOON'
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

            // For new movies, don't send status (BE will default to COMING_SOON)
            const payload = {
                title: movieForm.title,
                description: movieForm.description,
                duration: parseInt(movieForm.duration),
                genre: movieForm.genre,
                ageRating: movieForm.ageRating,
                imageUrl: movieForm.imageUrl,
                releaseDate: movieForm.releaseDate || null
            };

            // Only include status for edit mode
            if (isEditModeMovie) {
                payload.status = movieForm.status;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
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

    // Movie filter and sort functions
    const handleMovieSort = (field) => {
        if (movieSortField === field) {
            setMovieSortOrder(movieSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setMovieSortField(field);
            setMovieSortOrder('asc');
        }
    };

    const getFilteredAndSortedMovies = () => {
        let filtered = [...movies];

        // Filter by genre
        if (movieGenreFilter) {
            filtered = filtered.filter(movie => movie.genre === movieGenreFilter);
        }

        // Filter by movie name (search)
        if (movieSearch.trim()) {
            const searchLower = movieSearch.toLowerCase().trim();
            filtered = filtered.filter(movie =>
                movie.title && movie.title.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (movieSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (movieSortField) {
                    case 'title':
                        aVal = (a.title || '').toLowerCase();
                        bVal = (b.title || '').toLowerCase();
                        break;
                    case 'genre':
                        aVal = (a.genre || '').toLowerCase();
                        bVal = (b.genre || '').toLowerCase();
                        break;
                    case 'ageRating':
                        aVal = a.ageRating || '';
                        bVal = b.ageRating || '';
                        break;
                    case 'duration':
                        aVal = a.duration || 0;
                        bVal = b.duration || 0;
                        break;
                    case 'releaseDate':
                        aVal = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
                        bVal = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
                        break;
                    case 'status':
                        aVal = a.status || '';
                        bVal = b.status || '';
                        break;
                    default:
                        return 0;
                }

                if (movieSortField === 'duration' || movieSortField === 'releaseDate') {
                    return movieSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                if (aVal < bVal) return movieSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return movieSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const getUniqueGenres = () => {
        const genreSet = new Set(movies.map(m => m.genre).filter(g => g));
        return [...genreSet].sort();
    };

    // ===== User Management Functions =====
    const getFilteredAndSortedUsers = () => {
        let filtered = [...users];

        // Filter by role
        if (userRoleFilter) {
            filtered = filtered.filter(user => user.role === userRoleFilter);
        }

        // Filter by membership level
        if (userMembershipFilter) {
            filtered = filtered.filter(user => user.membershipLevel === userMembershipFilter);
        }

        // Search by name, username, email
        if (userSearch.trim()) {
            const searchLower = userSearch.toLowerCase().trim();
            filtered = filtered.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchLower)) ||
                (user.username && user.username.toLowerCase().includes(searchLower)) ||
                (user.email && user.email.toLowerCase().includes(searchLower))
            );
        }

        // Sort
        if (userSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (userSortField) {
                    case 'name':
                        aVal = (a.name || '').toLowerCase();
                        bVal = (b.name || '').toLowerCase();
                        break;
                    case 'username':
                        aVal = (a.username || '').toLowerCase();
                        bVal = (b.username || '').toLowerCase();
                        break;
                    case 'role':
                        aVal = a.role || '';
                        bVal = b.role || '';
                        break;
                    case 'membershipLevel':
                        aVal = a.membershipLevel || '';
                        bVal = b.membershipLevel || '';
                        break;
                    case 'points':
                        aVal = a.points || 0;
                        bVal = b.points || 0;
                        break;
                    case 'accountBalance':
                        aVal = a.accountBalance || 0;
                        bVal = b.accountBalance || 0;
                        break;
                    case 'createdAt':
                        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        break;
                    default:
                        return 0;
                }

                // Numeric fields
                if (['points', 'accountBalance', 'createdAt'].includes(userSortField)) {
                    return userSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // String fields
                if (aVal < bVal) return userSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return userSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    // ===== Booking Management Functions =====
    const getFilteredAndSortedBookings = () => {
        let filtered = [...bookings];

        // Filter by theater
        if (bookingTheaterFilter) {
            filtered = filtered.filter(booking => booking.theaterName === bookingTheaterFilter);
        }

        // Search by ticket code, customer name, or movie title
        if (bookingSearch.trim()) {
            const searchLower = bookingSearch.toLowerCase().trim();
            filtered = filtered.filter(booking =>
                (booking.ticketCode && booking.ticketCode.toLowerCase().includes(searchLower)) ||
                (booking.userName && booking.userName.toLowerCase().includes(searchLower)) ||
                (booking.movieTitle && booking.movieTitle.toLowerCase().includes(searchLower))
            );
        }

        // Sort
        if (bookingSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (bookingSortField) {
                    case 'userName':
                        aVal = (a.userName || '').toLowerCase();
                        bVal = (b.userName || '').toLowerCase();
                        break;
                    case 'movieTitle':
                        aVal = (a.movieTitle || '').toLowerCase();
                        bVal = (b.movieTitle || '').toLowerCase();
                        break;
                    case 'theaterName':
                        aVal = (a.theaterName || '').toLowerCase();
                        bVal = (b.theaterName || '').toLowerCase();
                        break;
                    case 'showDate':
                        aVal = a.showDate ? new Date(a.showDate).getTime() : 0;
                        bVal = b.showDate ? new Date(b.showDate).getTime() : 0;
                        break;
                    case 'showTime':
                        aVal = a.showTime || '';
                        bVal = b.showTime || '';
                        break;
                    case 'seats':
                        aVal = (a.seats || []).join(', ');
                        bVal = (b.seats || []).join(', ');
                        break;
                    case 'totalPrice':
                        aVal = a.totalPrice || 0;
                        bVal = b.totalPrice || 0;
                        break;
                    case 'status':
                        aVal = a.status || '';
                        bVal = b.status || '';
                        break;
                    case 'bookingDate':
                        aVal = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
                        bVal = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
                        break;
                    default:
                        return 0;
                }

                // Numeric and date fields
                if (['showDate', 'totalPrice', 'bookingDate'].includes(bookingSortField)) {
                    return bookingSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // String fields
                if (aVal < bVal) return bookingSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return bookingSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const handleBookingSort = (field) => {
        if (bookingSortField === field) {
            setBookingSortOrder(bookingSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setBookingSortField(field);
            setBookingSortOrder('asc');
        }
    };

    const getUniqueTheaters = () => {
        const theaterSet = new Set(bookings.map(b => b.theaterName).filter(t => t));
        return [...theaterSet].sort();
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
            roomId: '',
            showDate: '',
            showTime: '',
            price: '50,000'
        });
        setCinemaRooms([]);
        setIsEditModeShowtime(false);
        setShowShowtimeModal(true);
    };

    const openEditShowtimeModal = async (showtime) => {
        setShowtimeForm({
            id: showtime.id,
            movieId: showtime.movieId,
            theaterId: showtime.theaterId,
            roomId: showtime.roomId || '',
            showDate: showtime.showDate,
            showTime: showtime.showTime,
            price: showtime.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        });
        setIsEditModeShowtime(true);
        setShowShowtimeModal(true);
        // Fetch rooms for selected theater
        if (showtime.theaterId) {
            await fetchCinemaRooms(showtime.theaterId);
        }
    };

    const closeShowtimeModal = () => {
        setShowShowtimeModal(false);
        setShowtimeForm({
            id: null,
            movieId: '',
            theaterId: '',
            roomId: '',
            showDate: '',
            showTime: '',
            price: '50,000'
        });
        setCinemaRooms([]);
        setIsEditModeShowtime(false);
    };

    const handleShowtimeFormChange = async (e) => {
        const { name, value } = e.target;

        // Format price with thousand separators
        if (name === 'price') {
            const formatted = value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setShowtimeForm({
                ...showtimeForm,
                [name]: formatted
            });
            return;
        }

        setShowtimeForm({
            ...showtimeForm,
            [name]: value
        });

        // Fetch cinema rooms when theater is selected
        if (name === 'theaterId') {
            setShowtimeForm(prev => ({ ...prev, roomId: '' }));
            await fetchCinemaRooms(value);
        }
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
        if (!showtimeForm.roomId) {
            alert('Vui lòng chọn phòng chiếu!');
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
        const priceValue = parseFloat(showtimeForm.price.replace(/,/g, ''));
        if (!priceValue || priceValue < 10000) {
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
                    roomId: parseInt(showtimeForm.roomId),
                    showDate: showtimeForm.showDate,
                    showTime: showtimeForm.showTime,
                    price: parseFloat(showtimeForm.price.replace(/,/g, ''))
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

    // Sort showtime handler
    const handleShowtimeSort = (field) => {
        if (showtimeSortField === field) {
            // Toggle sort order if clicking same field
            setShowtimeSortOrder(showtimeSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setShowtimeSortField(field);
            setShowtimeSortOrder('asc');
        }
    };

    // Filter and sort showtimes
    const getFilteredAndSortedShowtimes = () => {
        let filtered = [...showtimes];

        // Filter by theater
        if (showtimeTheaterFilter) {
            filtered = filtered.filter(showtime =>
                showtime.theaterId === parseInt(showtimeTheaterFilter)
            );
        }

        // Filter by search (movie title only)
        if (showtimeSearch.trim()) {
            const searchLower = showtimeSearch.toLowerCase();
            filtered = filtered.filter(showtime =>
                showtime.movieTitle && showtime.movieTitle.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (showtimeSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (showtimeSortField) {
                    case 'movie':
                        aVal = (a.movieTitle || '').toLowerCase();
                        bVal = (b.movieTitle || '').toLowerCase();
                        break;
                    case 'theater':
                        aVal = (a.theaterName || '').toLowerCase();
                        bVal = (b.theaterName || '').toLowerCase();
                        break;
                    case 'room':
                        aVal = (a.roomName || '').toLowerCase();
                        bVal = (b.roomName || '').toLowerCase();
                        break;
                    case 'date':
                        aVal = a.showDate || '';
                        bVal = b.showDate || '';
                        break;
                    case 'time':
                        aVal = a.showTime || '';
                        bVal = b.showTime || '';
                        break;
                    case 'price':
                        aVal = a.price || 0;
                        bVal = b.price || 0;
                        break;
                    default:
                        return 0;
                }

                if (aVal < bVal) return showtimeSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return showtimeSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const filteredRooms = (() => {
        let filtered = rooms.filter(room => {
            if (roomTheaterFilter && room.theaterId !== parseInt(roomTheaterFilter)) {
                return false;
            }
            return true;
        });

        // Sort
        if (roomSortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;
                switch (roomSortField) {
                    case 'name':
                        aVal = a.name || '';
                        bVal = b.name || '';
                        break;
                    case 'theater':
                        aVal = a.theaterName || '';
                        bVal = b.theaterName || '';
                        break;
                    case 'city':
                        const aTheater = theaters.find(t => t.id === a.theaterId);
                        const bTheater = theaters.find(t => t.id === b.theaterId);
                        aVal = aTheater?.city || '';
                        bVal = bTheater?.city || '';
                        break;
                    case 'totalRows':
                        aVal = a.totalRows || 0;
                        bVal = b.totalRows || 0;
                        break;
                    case 'totalCols':
                        aVal = a.totalCols || 0;
                        bVal = b.totalCols || 0;
                        break;
                    case 'totalSeats':
                        aVal = a.totalSeats || 0;
                        bVal = b.totalSeats || 0;
                        break;
                    default:
                        return 0;
                }

                if (aVal < bVal) return roomSortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return roomSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    })();

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
                        className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        <span className="tab-icon">🎪</span>
                        <span className="tab-text">Quản lý Phòng Chiếu</span>
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
                                    <button className="add-btn" onClick={openGenreManagementModal} style={{ backgroundColor: '#6c757d', width: 'auto', padding: '10px 35px' }}>
                                        🏷️ Thể loại
                                    </button>
                                    <button className="add-btn" onClick={openAddMovieModal} style={{ width: 'auto', padding: '10px 35px' }}>
                                        + Thêm
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <select
                                    value={movieGenreFilter}
                                    onChange={(e) => setMovieGenreFilter(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '200px'
                                    }}
                                >
                                    <option value="">🎭 Tất cả thể loại</option>
                                    {getUniqueGenres().map(genre => (
                                        <option key={genre} value={genre}>{genre}</option>
                                    ))}
                                </select>

                                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm theo tên phim..."
                                        value={movieSearch}
                                        onChange={(e) => setMovieSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 35px 10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {movieSearch && (
                                        <button
                                            onClick={() => setMovieSearch('')}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '22px',
                                                cursor: 'pointer',
                                                color: '#999',
                                                padding: '0 8px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {movies.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có phim nào. Hãy thêm phim mới!</p>
                                </div>
                            ) : getFilteredAndSortedMovies().length === 0 ? (
                                <div className="empty-state">
                                    <p>Không tìm thấy phim nào phù hợp với bộ lọc.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
                                                <th
                                                    onClick={() => handleMovieSort('title')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Tên phim {movieSortField === 'title' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleMovieSort('genre')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Thể loại {movieSortField === 'genre' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th>Mô tả</th>
                                                <th
                                                    onClick={() => handleMovieSort('ageRating')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Độ tuổi {movieSortField === 'ageRating' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleMovieSort('duration')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Thời lượng {movieSortField === 'duration' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleMovieSort('releaseDate')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Ngày khởi chiếu {movieSortField === 'releaseDate' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleMovieSort('status')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Trạng thái {movieSortField === 'status' ? (movieSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredAndSortedMovies().map((movie, index) => (
                                                <tr key={movie.id}>
                                                    <td>{index + 1}</td>
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
                                                                movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã rời rạp'}
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
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="add-btn"
                                        onClick={migrateCinemaRooms}
                                        style={{
                                            width: 'auto',
                                            padding: '10px 20px',
                                            backgroundColor: '#ff9800',
                                            fontSize: '0.9em'
                                        }}
                                        title="Xóa tất cả phòng cũ và tạo lại theo format chuẩn"
                                    >
                                        🔄 Chuẩn hóa phòng
                                    </button>
                                    <button
                                        className="add-btn"
                                        onClick={openAddTheaterModal}
                                        style={{ width: 'auto', padding: '10px 35px' }}
                                    >
                                        + Thêm
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <select
                                    value={theaterCityFilter}
                                    onChange={(e) => setTheaterCityFilter(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '200px'
                                    }}
                                >
                                    <option value="">🏙️ Tất cả thành phố</option>
                                    {getUniqueCities().map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>

                                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm theo tên rạp..."
                                        value={theaterSearch}
                                        onChange={(e) => setTheaterSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 35px 10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {theaterSearch && (
                                        <button
                                            onClick={() => setTheaterSearch('')}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '22px',
                                                cursor: 'pointer',
                                                color: '#999',
                                                padding: '0 8px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {theaters.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có rạp nào. Hãy thêm rạp mới!</p>
                                </div>
                            ) : getFilteredAndSortedTheaters().length === 0 ? (
                                <div className="empty-state">
                                    <p>Không tìm thấy rạp nào phù hợp với bộ lọc.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
                                                <th
                                                    onClick={() => handleTheaterSort('name')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Tên rạp {theaterSortField === 'name' ? (theaterSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleTheaterSort('city')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Thành phố {theaterSortField === 'city' ? (theaterSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleTheaterSort('address')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Địa chỉ {theaterSortField === 'address' ? (theaterSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th>Số điện thoại</th>
                                                <th
                                                    onClick={() => handleTheaterSort('totalRooms')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Số phòng {theaterSortField === 'totalRooms' ? (theaterSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredAndSortedTheaters().map((theater, index) => (
                                                <tr key={theater.id}>
                                                    <td>{index + 1}</td>
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

                    {activeTab === 'rooms' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🎪 Quản lý Phòng Chiếu</h2>
                                <button className="add-btn" onClick={openAddRoomModal} style={{ width: 'auto', padding: '10px 35px' }}>
                                    + Thêm
                                </button>
                            </div>

                            {/* Theater Filter */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Lọc theo rạp:
                                </label>
                                <select
                                    value={roomTheaterFilter}
                                    onChange={(e) => setRoomTheaterFilter(e.target.value)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        minWidth: '250px'
                                    }}
                                >
                                    <option value="">Tất cả rạp</option>
                                    {theaters.map(theater => (
                                        <option key={theater.id} value={theater.id}>
                                            {theater.name} {theater.city ? `- ${theater.city}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rooms Table */}
                            {filteredRooms.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    Không có phòng chiếu nào
                                </p>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
                                                <th
                                                    onClick={() => handleRoomSort('name')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Tên phòng {roomSortField === 'name' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleRoomSort('theater')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Rạp chiếu {roomSortField === 'theater' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleRoomSort('city')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Thành phố {roomSortField === 'city' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleRoomSort('totalRows')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Số hàng {roomSortField === 'totalRows' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleRoomSort('totalCols')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Số ghế/hàng {roomSortField === 'totalCols' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleRoomSort('totalSeats')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Tổng ghế {roomSortField === 'totalSeats' ? (roomSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th style={{ width: '150px' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRooms.map((room, index) => (
                                                <tr key={room.id}>
                                                    <td>{index + 1}</td>
                                                    <td><strong>{room.name}</strong></td>
                                                    <td>{room.theaterName}</td>
                                                    <td>
                                                        {theaters.find(t => t.id === room.theaterId)?.city || 'N/A'}
                                                    </td>
                                                    <td>{room.totalRows}</td>
                                                    <td>{room.totalCols}</td>
                                                    <td>
                                                        <span style={{
                                                            background: '#e3f2fd',
                                                            color: '#1976d2',
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {room.totalSeats} ghế
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => openEditRoomModal(room)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => deleteRoom(room.id, room.name)}
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
                    )}

                    {activeTab === 'showtimes' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2>🎞️ Quản lý Suất Chiếu</h2>
                                <button className="add-btn" onClick={openAddShowtimeModal} style={{ width: 'auto', padding: '10px 35px' }}>
                                    + Thêm
                                </button>
                            </div>

                            {/* Filters */}
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                marginBottom: '20px',
                                alignItems: 'center'
                            }}>
                                {/* Theater Filter Dropdown */}
                                <div style={{ flex: '0 0 250px' }}>
                                    <select
                                        value={showtimeTheaterFilter}
                                        onChange={(e) => setShowtimeTheaterFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            fontSize: '15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: 'white',
                                            transition: 'border-color 0.3s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#5e72e4'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    >
                                        <option value="">🎭 Tất cả rạp</option>
                                        {theaters.map(theater => (
                                            <option key={theater.id} value={theater.id}>
                                                {theater.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Search Box */}
                                <div style={{
                                    position: 'relative',
                                    flex: '1',
                                    maxWidth: '400px'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm theo tên phim..."
                                        value={showtimeSearch}
                                        onChange={(e) => setShowtimeSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 20px',
                                            fontSize: '15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            transition: 'border-color 0.3s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#5e72e4'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                    {showtimeSearch && (
                                        <button
                                            onClick={() => setShowtimeSearch('')}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '22px',
                                                color: '#999',
                                                cursor: 'pointer',
                                                padding: '5px 8px',
                                                lineHeight: '1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#333'}
                                            onMouseLeave={(e) => e.target.style.color = '#999'}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showtimes.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có suất chiếu nào. Hãy thêm suất chiếu mới!</p>
                                </div>
                            ) : getFilteredAndSortedShowtimes().length === 0 ? (
                                <div className="empty-state">
                                    <p>🔍 Không tìm thấy suất chiếu phù hợp với bộ lọc hiện tại</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
                                                <th
                                                    onClick={() => handleShowtimeSort('movie')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Phim {showtimeSortField === 'movie' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleShowtimeSort('theater')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Rạp {showtimeSortField === 'theater' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleShowtimeSort('room')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Phòng {showtimeSortField === 'room' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleShowtimeSort('date')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Ngày chiếu {showtimeSortField === 'date' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleShowtimeSort('time')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Giờ chiếu {showtimeSortField === 'time' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleShowtimeSort('price')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Giá vé {showtimeSortField === 'price' ? (showtimeSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th>Ghế trống</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredAndSortedShowtimes().map((showtime, index) => (
                                                <tr key={showtime.id}>
                                                    <td>{index + 1}</td>
                                                    <td><strong>{showtime.movieTitle || 'N/A'}</strong></td>
                                                    <td>{showtime.theaterName || 'N/A'}</td>
                                                    <td>{showtime.roomName || 'N/A'}</td>
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

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <select
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '150px'
                                    }}
                                >
                                    <option value="">👤 Tất cả quyền</option>
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>

                                <select
                                    value={userMembershipFilter}
                                    onChange={(e) => setUserMembershipFilter(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '180px'
                                    }}
                                >
                                    <option value="">💎 Tất cả hạng</option>
                                    <option value="NORMAL">NORMAL</option>
                                    <option value="GOLD">GOLD</option>
                                    <option value="PLATINUM">PLATINUM</option>
                                </select>

                                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm theo tên, username, email..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 35px 10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {userSearch && (
                                        <button
                                            onClick={() => setUserSearch('')}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '22px',
                                                cursor: 'pointer',
                                                color: '#999',
                                                padding: '0 8px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {users.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có người dùng nào.</p>
                                </div>
                            ) : getFilteredAndSortedUsers().length === 0 ? (
                                <div className="empty-state">
                                    <p>Không tìm thấy người dùng nào phù hợp với bộ lọc.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
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
                                            {getFilteredAndSortedUsers().map((user, index) => (
                                                <tr key={user.id}>
                                                    <td>{index + 1}</td>
                                                    <td><strong>{user.name}</strong></td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email || '-'}</td>
                                                    <td>{user.phone}</td>
                                                    <td>
                                                        <span className={`role-badge role-${user.role}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {user.membershipLevel === '-' ? (
                                                            <span style={{ color: '#999' }}>-</span>
                                                        ) : (
                                                            <span className={`membership-badge membership-${user.membershipLevel}`}>
                                                                {user.membershipLevel}
                                                            </span>
                                                        )}
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
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <select
                                    value={bookingTheaterFilter}
                                    onChange={(e) => setBookingTheaterFilter(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '200px'
                                    }}
                                >
                                    <option value="">🎬 Tất cả rạp</option>
                                    {getUniqueTheaters().map(theater => (
                                        <option key={theater} value={theater}>{theater}</option>
                                    ))}
                                </select>

                                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Tìm theo mã vé, khách hàng, phim..."
                                        value={bookingSearch}
                                        onChange={(e) => setBookingSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 35px 10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {bookingSearch && (
                                        <button
                                            onClick={() => setBookingSearch('')}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '22px',
                                                cursor: 'pointer',
                                                color: '#999',
                                                padding: '0 8px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                <button
                                    className="add-btn"
                                    style={{ background: '#6c757d', width: 'auto', padding: '10px 35px' }}
                                    onClick={() => {
                                        setBookingSearch('');
                                        setBookingTheaterFilter('');
                                        setBookingSortField('');
                                        setBookingSortOrder('asc');
                                    }}
                                >
                                    Xem tất cả
                                </button>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="empty-state">
                                    <p>Chưa có đặt vé nào.</p>
                                </div>
                            ) : getFilteredAndSortedBookings().length === 0 ? (
                                <div className="empty-state">
                                    <p>Không tìm thấy đặt vé nào phù hợp với bộ lọc.</p>
                                </div>
                            ) : (
                                <div className="data-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>TT</th>
                                                <th>Mã vé</th>
                                                <th
                                                    onClick={() => handleBookingSort('userName')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Khách hàng {bookingSortField === 'userName' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('movieTitle')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Phim {bookingSortField === 'movieTitle' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('theaterName')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Rạp {bookingSortField === 'theaterName' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('showDate')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Ngày chiếu {bookingSortField === 'showDate' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('showTime')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Giờ chiếu {bookingSortField === 'showTime' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('seats')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Ghế {bookingSortField === 'seats' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('totalPrice')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Tổng tiền {bookingSortField === 'totalPrice' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('status')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Trạng thái {bookingSortField === 'status' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                                <th
                                                    onClick={() => handleBookingSort('bookingDate')}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    Ngày đặt {bookingSortField === 'bookingDate' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : <span style={{ letterSpacing: '-2px' }}>↑↓</span>}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredAndSortedBookings().map((booking, index) => (
                                                <tr key={booking.id}>
                                                    <td>{index + 1}</td>
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

                            <div className="settings-container">
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

                                <div className="settings-section">
                                    <h3>💎 Chương trình Thành viên</h3>
                                    <p className="settings-note">
                                        Cấu hình hệ thống tích điểm và giảm giá cho các hạng thành viên
                                    </p>

                                    <div className="setting-item">
                                        <label>Tích điểm:</label>
                                        <input
                                            type="number"
                                            value={settings.POINTS_PER_THOUSAND || 1}
                                            onChange={(e) => handleSettingChange('POINTS_PER_THOUSAND', e.target.value)}
                                            min={1}
                                            max={10}
                                        />
                                        <span className="hint">điểm cho mỗi 1.000đ chi tiêu</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Điểm đạt hạng Gold:</label>
                                        <input
                                            type="number"
                                            value={settings.GOLD_POINTS_THRESHOLD || 100}
                                            onChange={(e) => handleSettingChange('GOLD_POINTS_THRESHOLD', e.target.value)}
                                            min={10}
                                            max={10000}
                                        />
                                        <span className="hint">điểm</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Giảm giá hạng Gold:</label>
                                        <input
                                            type="number"
                                            value={settings.GOLD_DISCOUNT_PERCENT || 5}
                                            onChange={(e) => handleSettingChange('GOLD_DISCOUNT_PERCENT', e.target.value)}
                                            min={0}
                                            max={50}
                                            step={0.5}
                                        />
                                        <span className="hint">%</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Điểm đạt hạng Platinum:</label>
                                        <input
                                            type="number"
                                            value={settings.PLATINUM_POINTS_THRESHOLD || 500}
                                            onChange={(e) => handleSettingChange('PLATINUM_POINTS_THRESHOLD', e.target.value)}
                                            min={10}
                                            max={10000}
                                        />
                                        <span className="hint">điểm</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Giảm giá hạng Platinum:</label>
                                        <input
                                            type="number"
                                            value={settings.PLATINUM_DISCOUNT_PERCENT || 10}
                                            onChange={(e) => handleSettingChange('PLATINUM_DISCOUNT_PERCENT', e.target.value)}
                                            min={0}
                                            max={50}
                                            step={0.5}
                                        />
                                        <span className="hint">%</span>
                                    </div>

                                    <div className="calculated-result">
                                        <strong>
                                            → Mỗi 1.000đ = {settings.POINTS_PER_THOUSAND || 1} điểm |
                                            Gold ({settings.GOLD_POINTS_THRESHOLD || 100} điểm): -{settings.GOLD_DISCOUNT_PERCENT || 5}% |
                                            Platinum ({settings.PLATINUM_POINTS_THRESHOLD || 500} điểm): -{settings.PLATINUM_DISCOUNT_PERCENT || 10}%
                                        </strong>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>❌ Chính sách Hủy vé & Hoàn tiền</h3>
                                    <p className="settings-note">
                                        Quy định về thời gian và tỷ lệ hoàn tiền khi khách hàng hủy vé
                                    </p>

                                    <div className="setting-item">
                                        <label>Thời gian hủy vé tối thiểu:</label>
                                        <input
                                            type="number"
                                            value={settings.MIN_HOURS_BEFORE_CANCEL}
                                            onChange={(e) => handleSettingChange('MIN_HOURS_BEFORE_CANCEL', e.target.value)}
                                            min={1}
                                            max={168}
                                        />
                                        <span className="hint">giờ trước suất chiếu (Ví dụ: 48 = 2 ngày trước)</span>
                                    </div>

                                    <div className="setting-item">
                                        <label>Tỷ lệ hoàn tiền:</label>
                                        <input
                                            type="number"
                                            value={settings.REFUND_PERCENTAGE}
                                            onChange={(e) => handleSettingChange('REFUND_PERCENTAGE', e.target.value)}
                                            min={0}
                                            max={100}
                                        />
                                        <span className="hint">% (Ví dụ: 80 = hoàn 80% giá trị vé)</span>
                                    </div>

                                    <div className="calculated-result">
                                        <strong>
                                            → Khách hàng phải hủy vé trước {settings.MIN_HOURS_BEFORE_CANCEL} giờ và được hoàn {settings.REFUND_PERCENTAGE}% tiền
                                        </strong>
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
                <div className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.mousedownOnOverlay = 'true';
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.mousedownOnOverlay === 'true') {
                            closeTheaterModal();
                        }
                        delete e.currentTarget.dataset.mousedownOnOverlay;
                    }}>
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

                            <div style={{
                                background: '#fff3e0',
                                border: '1px solid #ffb74d',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '16px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#f57c00', fontSize: '1em' }}>
                                    🎫 Cấu hình số ghế mặc định cho tất cả phòng
                                </h4>
                                <p style={{ fontSize: '0.9em', color: '#666', margin: '0 0 12px 0' }}>
                                    Khi tạo rạp, tất cả phòng sẽ có cùng số ghế. Bạn có thể tùy chỉnh từng phòng sau.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Số hàng ghế <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            name="defaultRows"
                                            value={theaterForm.defaultRows}
                                            onChange={handleTheaterFormChange}
                                            min={1}
                                            max={20}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Số ghế mỗi hàng <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            name="defaultCols"
                                            value={theaterForm.defaultCols}
                                            onChange={handleTheaterFormChange}
                                            min={1}
                                            max={20}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    background: '#fff',
                                    borderRadius: '6px',
                                    fontSize: '0.9em',
                                    color: '#333'
                                }}>
                                    <strong>📊 Tổng số ghế mỗi phòng:</strong>{' '}
                                    <span style={{ color: '#f57c00', fontWeight: 'bold', fontSize: '1.1em' }}>
                                        {theaterForm.defaultRows * theaterForm.defaultCols} ghế
                                    </span>
                                    {' '}({theaterForm.defaultRows} hàng × {theaterForm.defaultCols} ghế)
                                </div>
                            </div>

                            <div style={{
                                background: '#e8f5e9',
                                padding: '12px',
                                borderRadius: '8px',
                                marginTop: '12px',
                                fontSize: '0.9em',
                                color: '#2e7d32',
                                lineHeight: '1.6'
                            }}>
                                <strong>ℹ️ Lưu ý:</strong>
                                <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                                    <li>Hệ thống sẽ tự động tạo các phòng với tên: <strong>Phòng 01, Phòng 02,...</strong></li>
                                    {isEditMode && (
                                        <li>Tăng số phòng sẽ tạo thêm phòng mới. Giảm số phòng chỉ được nếu phòng chưa có suất chiếu.</li>
                                    )}
                                </ul>
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
                <div className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.mousedownOnOverlay = 'true';
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.mousedownOnOverlay === 'true') {
                            closeMovieModal();
                        }
                        delete e.currentTarget.dataset.mousedownOnOverlay;
                    }}>
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
                                <label>Trạng thái {!isEditModeMovie && <span style={{ fontSize: '0.85em', color: '#666' }}>(Tự động: Sắp chiếu)</span>}</label>
                                {isEditModeMovie ? (
                                    <>
                                        {movieForm.status === 'ENDED' ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    value="Đã rời rạp"
                                                    disabled
                                                    style={{
                                                        backgroundColor: '#f8f9fa',
                                                        cursor: 'not-allowed',
                                                        color: '#6c757d'
                                                    }}
                                                />
                                                <small style={{ display: 'block', marginTop: '4px', color: '#6c757d' }}>
                                                    ⚠️ Không thể thay đổi trạng thái phim đã rời rạp
                                                </small>
                                            </div>
                                        ) : (
                                            <div>
                                                <select
                                                    name="status"
                                                    value={movieForm.status}
                                                    onChange={handleMovieFormChange}
                                                >
                                                    <option value={movieForm.status}>
                                                        {movieForm.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'} (Hiện tại)
                                                    </option>
                                                    <option value="ENDED">Đánh dấu đã rời rạp</option>
                                                </select>
                                                <small style={{ display: 'block', marginTop: '4px', color: '#6c757d' }}>
                                                    ℹ️ 'Sắp chiếu' và 'Đang chiếu' tự động cập nhật theo suất chiếu. Bạn chỉ có thể đánh dấu 'Đã rời rạp'.
                                                </small>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        value="Sắp chiếu (Được cập nhật tự động)"
                                        disabled
                                        style={{
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'not-allowed',
                                            color: '#6c757d'
                                        }}
                                    />
                                )}
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

            {/* Room Modal */}
            {showRoomModal && (
                <div className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.mousedownOnOverlay = 'true';
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.mousedownOnOverlay === 'true') {
                            closeRoomModal();
                        }
                        delete e.currentTarget.dataset.mousedownOnOverlay;
                    }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditModeRoom ? '✏️ Chỉnh sửa phòng chiếu' : '➕ Thêm phòng chiếu mới'}</h2>
                            <button className="modal-close" onClick={closeRoomModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Rạp chiếu <span className="required">*</span></label>
                                <select
                                    name="theaterId"
                                    value={roomForm.theaterId}
                                    onChange={handleRoomFormChange}
                                    required
                                    disabled={isEditModeRoom}
                                >
                                    <option value="">-- Chọn rạp --</option>
                                    {theaters.map(theater => (
                                        <option key={theater.id} value={theater.id}>
                                            {theater.name} {theater.city ? `- ${theater.city}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {isEditModeRoom && (
                                    <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                        ℹ️ Không thể thay đổi rạp chiếu khi chỉnh sửa
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Tên phòng <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={roomForm.name}
                                    onChange={handleRoomFormChange}
                                    placeholder="VD: Phòng 01, Phòng VIP, IMAX"
                                    required
                                />
                            </div>

                            <div style={{
                                background: '#fff3e0',
                                border: '1px solid #ffb74d',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#f57c00', fontSize: '1em' }}>
                                    🎫 Cấu hình số ghế cho phòng này
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Số hàng ghế <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            name="totalRows"
                                            value={roomForm.totalRows}
                                            onChange={handleRoomFormChange}
                                            min={1}
                                            max={20}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Số ghế mỗi hàng <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            name="totalCols"
                                            value={roomForm.totalCols}
                                            onChange={handleRoomFormChange}
                                            min={1}
                                            max={20}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    background: '#fff',
                                    borderRadius: '6px',
                                    fontSize: '0.9em',
                                    color: '#333'
                                }}>
                                    <strong>📊 Tổng số ghế:</strong>{' '}
                                    <span style={{ color: '#f57c00', fontWeight: 'bold', fontSize: '1.2em' }}>
                                        {roomForm.totalRows * roomForm.totalCols} ghế
                                    </span>
                                    {' '}({roomForm.totalRows} hàng × {roomForm.totalCols} ghế)
                                </div>
                            </div>

                            {isEditModeRoom && (
                                <div style={{
                                    background: '#fff9c4',
                                    border: '1px solid #fbc02d',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '0.9em',
                                    color: '#f57f17'
                                }}>
                                    <strong>⚠️ Lưu ý:</strong> Thay đổi số ghế có thể ảnh hưởng đến các suất chiếu hiện tại.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeRoomModal}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={saveRoom}>
                                {isEditModeRoom ? '💾 Cập nhật' : '➕ Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Showtime Modal */}
            {showShowtimeModal && (
                <div className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.mousedownOnOverlay = 'true';
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.mousedownOnOverlay === 'true') {
                            closeShowtimeModal();
                        }
                        delete e.currentTarget.dataset.mousedownOnOverlay;
                    }}>
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

                            <div className="form-group">
                                <label>Phòng chiếu <span className="required">*</span></label>
                                <select
                                    name="roomId"
                                    value={showtimeForm.roomId}
                                    onChange={handleShowtimeFormChange}
                                    required
                                    disabled={!showtimeForm.theaterId}
                                >
                                    <option value="">-- Chọn phòng --</option>
                                    {cinemaRooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.name} ({room.totalSeats || (room.totalRows * room.totalCols)} ghế)
                                        </option>
                                    ))}
                                </select>
                                {!showtimeForm.theaterId && (
                                    <span className="hint" style={{ fontSize: '0.9em', color: '#999', marginTop: '4px', display: 'block' }}>
                                        Vui lòng chọn rạp trước
                                    </span>
                                )}
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
                                    type="text"
                                    name="price"
                                    value={showtimeForm.price}
                                    onChange={handleShowtimeFormChange}
                                    required
                                />
                                <span className="hint" style={{ fontSize: '0.9em', color: '#666', marginTop: '4px', display: 'block' }}>
                                    Số tiền tối thiểu: 10,000 VNĐ
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
                <div className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.mousedownOnOverlay = 'true';
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.mousedownOnOverlay === 'true') {
                            closeGenreModal();
                        }
                        delete e.currentTarget.dataset.mousedownOnOverlay;
                    }}>
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
                                                        <th style={{ width: '50px' }}>TT</th>
                                                        <th>Tên</th>
                                                        <th>Mô tả</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {genres.map((genre, index) => (
                                                        <tr key={genre.id}>
                                                            <td>{index + 1}</td>
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
