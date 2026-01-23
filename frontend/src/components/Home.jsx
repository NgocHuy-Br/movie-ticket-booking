import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  
  // Danh sách 8 phim random với độ tuổi
  const ageRatings = ['13+', '16+', '18+', 'P', 'C13'];
  const movies = [
    { id: 1, title: 'Avengers: Endgame', image: 'https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=Avengers', ageRating: '13+' },
    { id: 2, title: 'Spider-Man: No Way Home', image: 'https://via.placeholder.com/300x450/4ECDC4/FFFFFF?text=Spider-Man', ageRating: '13+' },
    { id: 3, title: 'The Matrix Resurrections', image: 'https://via.placeholder.com/300x450/45B7D1/FFFFFF?text=Matrix', ageRating: '16+' },
    { id: 4, title: 'Dune', image: 'https://via.placeholder.com/300x450/FFA07A/FFFFFF?text=Dune', ageRating: '13+' },
    { id: 5, title: 'No Time to Die', image: 'https://via.placeholder.com/300x450/98D8C8/FFFFFF?text=007', ageRating: '16+' },
    { id: 6, title: 'Black Widow', image: 'https://via.placeholder.com/300x450/F7DC6F/FFFFFF?text=Black+Widow', ageRating: '13+' },
    { id: 7, title: 'Fast & Furious 9', image: 'https://via.placeholder.com/300x450/BB8FCE/FFFFFF?text=Fast+9', ageRating: '16+' },
    { id: 8, title: 'Shang-Chi', image: 'https://via.placeholder.com/300x450/85C1E2/FFFFFF?text=Shang-Chi', ageRating: '13+' },
  ];

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

  return (
    <>
      <Header />
      <div className="home-container">
        <h1>Danh Sách Phim</h1>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <div className="movie-image-container">
              <img src={movie.image} alt={movie.title} className="movie-image" />
              <span className="age-rating">{movie.ageRating}</span>
            </div>
            <h3 className="movie-title">{movie.title}</h3>
            <button 
              className="book-ticket-btn" 
              onClick={() => handleBookTicket(movie.id)}
            >
              Đặt vé
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Home;