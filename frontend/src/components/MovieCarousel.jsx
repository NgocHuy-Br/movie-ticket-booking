import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCarousel.css';

const MovieCarousel = ({ movies, title }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const trackRef = useRef(null);

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

    const handleBookTicket = (movieId, event) => {
        event.stopPropagation();
        const userInfo = localStorage.getItem('userInfo');

        if (!userInfo) {
            navigate('/login');
        } else {
            navigate(`/booking/${movieId}`);
        }
    };

    // Create infinite loop by cloning movies
    const extendedMovies = movies.length > 5 ? [...movies, ...movies, ...movies] : movies;
    const needsCarousel = movies.length > 5;

    // Auto-scroll every 3 seconds (only if more than 5 movies)
    useEffect(() => {
        if (!needsCarousel) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [needsCarousel]);

    // Handle infinite loop reset
    useEffect(() => {
        if (!needsCarousel) return;

        // When we reach the end of second clone set, reset to middle
        if (currentIndex >= movies.length * 2) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(movies.length);
                setTimeout(() => {
                    setIsTransitioning(true);
                }, 50);
            }, 500);
            return () => clearTimeout(timeout);
        }

        // When we go before the middle set, jump to end of second set
        if (currentIndex < movies.length) {
            setIsTransitioning(false);
            setCurrentIndex(movies.length * 2 - 1);
            setTimeout(() => {
                setIsTransitioning(true);
            }, 50);
        }
    }, [currentIndex, movies.length, needsCarousel]);

    // Initialize at middle clone set when movies load
    useEffect(() => {
        if (needsCarousel && movies.length > 0 && currentIndex === 0) {
            setIsTransitioning(false);
            setCurrentIndex(movies.length);
            setTimeout(() => setIsTransitioning(true), 100);
        }
    }, [needsCarousel, movies.length, currentIndex]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => prevIndex - 1);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleDotClick = (index) => {
        setCurrentIndex(movies.length + index);
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="movie-carousel-section">
            <h2 className="carousel-title">
                <span className="title-emoji">{title.split(' ')[0]}</span>
                <span className="title-text">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <div className="carousel-container">
                {needsCarousel && (
                    <button className="carousel-btn carousel-btn-prev" onClick={handlePrevious}>
                        ‹
                    </button>
                )}

                <div className="carousel-content">
                    <div
                        ref={trackRef}
                        className="carousel-track"
                        style={{
                            transform: `translateX(-${currentIndex * 20}%)`,
                            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                        }}
                    >
                        {extendedMovies.map((movie, index) => (
                            <div
                                key={`${movie.id}-${index}`}
                                className="carousel-movie-card"
                            >
                                <div className="carousel-movie-image-container">
                                    <img
                                        src={movie.imageUrl || 'https://via.placeholder.com/300x450/ccc/666?text=No+Image'}
                                        alt={movie.title}
                                        className="carousel-movie-image"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450/ccc/666?text=No+Image';
                                        }}
                                    />
                                    {movie.status && (
                                        <span className={`carousel-status ${getStatusClass(movie.status)}`}>
                                            {getStatusLabel(movie.status)}
                                        </span>
                                    )}
                                    <span className="carousel-age-rating">{movie.ageRating || '13+'}</span>

                                    {/* Thumbnail Preview Overlay */}
                                    <div className="carousel-preview-overlay">
                                        <div className="carousel-preview-content">
                                            <h4 className="carousel-preview-title">{movie.title}</h4>

                                            <div className="carousel-preview-info-row">
                                                <span className="carousel-preview-label">🎬 Độ tuổi:</span>
                                                <span className="carousel-preview-value">{movie.ageRating || 'N/A'}</span>
                                            </div>

                                            <div className="carousel-preview-info-row">
                                                <span className="carousel-preview-label">⏱️ Thời lượng:</span>
                                                <span className="carousel-preview-value">{movie.duration ? `${movie.duration} phút` : 'N/A'}</span>
                                            </div>

                                            {movie.genre && (
                                                <div className="carousel-preview-info-row">
                                                    <span className="carousel-preview-label">🎭 Thể loại:</span>
                                                    <span className="carousel-preview-value">{movie.genre}</span>
                                                </div>
                                            )}

                                            {movie.releaseDate && (
                                                <div className="carousel-preview-info-row">
                                                    <span className="carousel-preview-label">📅 Khởi chiếu:</span>
                                                    <span className="carousel-preview-value">
                                                        {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}

                                            {movie.description && (
                                                <div className="carousel-preview-description">
                                                    <p className="carousel-preview-label">📖 Nội dung:</p>
                                                    <p className="carousel-preview-desc-text">
                                                        {movie.description.length > 120
                                                            ? `${movie.description.substring(0, 120)}...`
                                                            : movie.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="carousel-movie-info">
                                    <h3 className="carousel-movie-title">{movie.title}</h3>
                                    {movie.releaseDate && (
                                        <div className="carousel-release-date">
                                            Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    )}
                                    {movie.genre && (
                                        <div className="carousel-movie-genres">
                                            {movie.genre.split(',').map((genre, index) => (
                                                <span key={index} className="carousel-genre-badge">
                                                    {genre.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="carousel-book-btn"
                                    onClick={(e) => handleBookTicket(movie.id, e)}
                                >
                                    Đặt vé
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {needsCarousel && (
                    <button className="carousel-btn carousel-btn-next" onClick={handleNext}>
                        ›
                    </button>
                )}
            </div>

            {/* Dots indicator - only show if carousel is needed */}
            {needsCarousel && (
                <div className="carousel-dots">
                    {movies.map((_, index) => {
                        const actualIndex = currentIndex % movies.length;
                        return (
                            <button
                                key={index}
                                className={`carousel-dot ${index === actualIndex ? 'active' : ''}`}
                                onClick={() => handleDotClick(index)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MovieCarousel;
