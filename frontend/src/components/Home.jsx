import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status) => {
    const statusMap = {
      'NOW_SHOWING': 'Đang chiếu',
      'COMING_SOON': 'Sắp chiếu',
      'ENDED': 'Đã rời rạp'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'NOW_SHOWING': 'status-now-showing',
      'COMING_SOON': 'status-coming-soon',
      'ENDED': 'status-ended'
    };
    return classMap[status] || 'status-default';
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/movies');
      console.log('Full API Response:', response.data);
      console.log('Movies data:', response.data.data);
      console.log('Number of movies:', response.data.data?.length || 0);
      setMovies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = (movieId) => {
    // Kiểm tra trạng thái đăng nhập
    const userInfo = localStorage.getItem('userInfo');

    if (!userInfo) {
      // Chưa đăng nhập - lưu movieId và redirect đến trang đăng nhập
      localStorage.setItem('redirectAfterLogin', `/booking/${movieId}`);
      navigate('/login');
    } else {
      // Đã đăng nhập - đi thẳng đến trang đặt vé
      navigate(`/booking/${movieId}`);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="home-container">
          <div className="loading">Đang tải danh sách phim...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="home-container">
        <h1>Danh Sách Phim</h1>
        {movies.length === 0 ? (
          <div className="empty-state">Chưa có phim nào</div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-image-container">
                  <img
                    src={movie.imageUrl || 'https://via.placeholder.com/300x450/ccc/666?text=No+Image'}
                    alt={movie.title}
                    className="movie-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x450/ccc/666?text=No+Image';
                    }}
                  />
                  {movie.status && (
                    <span className={`movie-status ${getStatusClass(movie.status)}`}>
                      {getStatusLabel(movie.status)}
                    </span>
                  )}
                  <span className="age-rating">{movie.ageRating || '13+'}</span>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  {movie.genre && (
                    <div className="movie-genres">
                      {movie.genre.split(',').map((genre, index) => (
                        <span key={index} className="genre-badge">
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="book-ticket-btn"
                  onClick={() => handleBookTicket(movie.id)}
                >
                  Đặt vé
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;