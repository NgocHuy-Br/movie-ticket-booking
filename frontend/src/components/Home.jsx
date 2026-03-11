import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import MovieCarousel from './MovieCarousel';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [hotMovies, setHotMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('releaseDate');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableGenres, setAvailableGenres] = useState([]);

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
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchFilteredMovies();
  }, [searchTerm, selectedGenre, selectedStatus, selectedSort, currentPage]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch hot movies (top 15 for carousel) - Filter out C-rated movies
      const hotResponse = await axios.get('http://localhost:8080/api/movies/hot?limit=15');
      const hotMoviesFiltered = (hotResponse.data.data || []).filter(movie => movie.ageRating !== 'C');
      setHotMovies(hotMoviesFiltered);

      // Fetch new movies (top 15 for carousel) - Filter out C-rated movies
      const newResponse = await axios.get('http://localhost:8080/api/movies/new?limit=15');
      const newMoviesFiltered = (newResponse.data.data || []).filter(movie => movie.ageRating !== 'C');
      setNewMovies(newMoviesFiltered);

      // Fetch all movies for genre list
      const allResponse = await axios.get('http://localhost:8080/api/movies');
      const movies = allResponse.data.data || [];

      // Extract unique genres
      const genresSet = new Set();
      movies.forEach(movie => {
        if (movie.genre) {
          movie.genre.split(',').forEach(g => genresSet.add(g.trim()));
        }
      });
      setAvailableGenres(Array.from(genresSet).sort());

      // Fetch filtered movies for section 3
      await fetchFilteredMovies();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredMovies = async () => {
    try {
      const params = {
        page: currentPage,
        size: 10,
        sortBy: selectedSort
      };

      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (selectedGenre && selectedGenre !== 'ALL') {
        params.genre = selectedGenre;
      }
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      const response = await axios.get('http://localhost:8080/api/movies/filtered', { params });
      const data = response.data.data;

      // Filter out C-rated movies from all movies section
      const filteredMovies = (data.movies || []).filter(movie => movie.ageRating !== 'C');
      setAllMovies(filteredMovies);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching filtered movies:', error);
    }
  };

  const handleBookTicket = (movieId) => {
    const userInfo = localStorage.getItem('userInfo');

    if (!userInfo) {
      navigate('/login');
    } else {
      navigate(`/booking/${movieId}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.querySelector('.all-movies-section').offsetTop - 100, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="home-container">
          <div className="loading">Đang tải...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="home-container">
        {/* Section 1: Phim Hot */}
        {hotMovies.length > 0 && (
          <MovieCarousel movies={hotMovies} title="🔥 Phim Hot" />
        )}

        {/* Section 2: Phim Mới */}
        {newMovies.length > 0 && (
          <MovieCarousel movies={newMovies} title="✨ Phim Mới" />
        )}

        {/* Section 3: Tất Cả Phim */}
        <div className="all-movies-section">
          <h2 className="section-title">
            <span className="title-emoji">🎬</span>
            <span className="title-text">Tất Cả Phim</span>
          </h2>

          {/* Filters */}
          <div className="filters-container">
            <div className="filter-group search-group">
              <label>Tìm kiếm:</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Nhập tên phim..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                      setCurrentPage(0);
                    }
                  }}
                  className="filter-input search-input"
                  style={{ paddingRight: '35px' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setCurrentPage(0); }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#999',
                      padding: '0',
                      margin: '0',
                      lineHeight: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '20px',
                      width: '20px'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>Thể loại:</label>
              <select
                value={selectedGenre}
                onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(0); }}
                className="filter-select"
              >
                <option value="ALL">Tất cả</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Trạng thái:</label>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(0); }}
                className="filter-select"
              >
                <option value="ALL">Tất cả</option>
                <option value="COMING_SOON">Sắp chiếu</option>
                <option value="NOW_SHOWING">Đang chiếu</option>
                <option value="ENDED">Đã rời rạp</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sắp xếp:</label>
              <select
                value={selectedSort}
                onChange={(e) => { setSelectedSort(e.target.value); setCurrentPage(0); }}
                className="filter-select"
              >
                <option value="releaseDate">Thời gian chiếu</option>
                <option value="bookingCount">Lượt mua vé</option>
              </select>
            </div>
          </div>

          {/* Movies Grid */}
          {allMovies.length === 0 ? (
            <div className="empty-state">Không tìm thấy phim</div>
          ) : (
            <>
              <div className="movies-grid">
                {allMovies.map((movie) => (
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

                      {/* Thumbnail Preview Overlay */}
                      <div className="movie-preview-overlay">
                        <div className="preview-content">
                          <h4 className="preview-title">{movie.title}</h4>

                          <div className="preview-info-row">
                            <span className="preview-label">🎬 Độ tuổi:</span>
                            <span className="preview-value">{movie.ageRating || 'N/A'}</span>
                          </div>

                          <div className="preview-info-row">
                            <span className="preview-label">⏱️ Thời lượng:</span>
                            <span className="preview-value">{movie.duration ? `${movie.duration} phút` : 'N/A'}</span>
                          </div>

                          {movie.genre && (
                            <div className="preview-info-row">
                              <span className="preview-label">🎭 Thể loại:</span>
                              <span className="preview-value">{movie.genre}</span>
                            </div>
                          )}

                          {movie.releaseDate && (
                            <div className="preview-info-row">
                              <span className="preview-label">📅 Khởi chiếu:</span>
                              <span className="preview-value">
                                {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          )}

                          {movie.description && (
                            <div className="preview-description">
                              <p className="preview-label">📖 Nội dung:</p>
                              <p className="preview-desc-text">
                                {movie.description.length > 150
                                  ? `${movie.description.substring(0, 150)}...`
                                  : movie.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.title}</h3>
                      {movie.releaseDate && (
                        <div className="release-date">
                          Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#f8f9fa'
                  }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: currentPage === 0 ? 'transparent' : '#fff',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                        color: currentPage === 0 ? '#ccc' : '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: currentPage === 0 ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      title="Trang trước"
                    >
                      ‹
                    </button>

                    {(() => {
                      const pageNumbers = [];
                      const maxVisible = 7;

                      if (totalPages <= maxVisible) {
                        for (let i = 0; i < totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        if (currentPage < 4) {
                          for (let i = 0; i < 5; i++) pageNumbers.push(i);
                          pageNumbers.push('ellipsis-end');
                          pageNumbers.push(totalPages - 1);
                        } else if (currentPage > totalPages - 5) {
                          pageNumbers.push(0);
                          pageNumbers.push('ellipsis-start');
                          for (let i = totalPages - 5; i < totalPages; i++) pageNumbers.push(i);
                        } else {
                          pageNumbers.push(0);
                          pageNumbers.push('ellipsis-start');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                          pageNumbers.push('ellipsis-end');
                          pageNumbers.push(totalPages - 1);
                        }
                      }

                      return pageNumbers.map((page, index) => {
                        if (typeof page === 'string') {
                          return (
                            <span key={page} style={{
                              padding: '0 4px',
                              color: '#6c757d',
                              fontSize: '14px'
                            }}>...</span>
                          );
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: currentPage === page ? '#007bff' : '#fff',
                              color: currentPage === page ? '#fff' : '#495057',
                              cursor: 'pointer',
                              fontWeight: currentPage === page ? '600' : '500',
                              minWidth: '36px',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                              boxShadow: currentPage === page ? '0 2px 4px rgba(0,123,255,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== page) {
                                e.target.style.background = '#e9ecef';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== page) {
                                e.target.style.background = '#fff';
                              }
                            }}
                          >
                            {page + 1}
                          </button>
                        );
                      });
                    })()}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: currentPage === totalPages - 1 ? 'transparent' : '#fff',
                        cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                        color: currentPage === totalPages - 1 ? '#ccc' : '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: currentPage === totalPages - 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      title="Trang sau"
                    >
                      ›
                    </button>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    color: '#6c757d',
                    fontSize: '13px'
                  }}>
                    Hiển thị trang {currentPage + 1} / {totalPages} · Tổng {totalItems} phim
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;