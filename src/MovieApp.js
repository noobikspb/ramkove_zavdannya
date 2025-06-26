import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const GENRES = [
  { id: 28, name: "Бойовик" },  
  { id: 35, name: "Комедія" },
  { id: 18, name: "Драма" },
  { id: 878, name: "Фантастика" },
  { id: 27, name: "Жахи" }
];

const styles = {
  appContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    color: 'white',
    padding: '2rem 0',
    marginBottom: '2rem',
    borderRadius: '0 0 20px 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  movieCard: {
    transition: 'transform 0.3s, box-shadow 0.3s',
    borderRadius: '15px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
    }
  },
  moviePoster: {
    height: '400px',
    objectFit: 'cover',
    borderBottom: '1px solid #eee'
  },
  authForm: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    backgroundColor: 'white'
  },
  detailCard: {
    borderRadius: '15px',
    border: 'none',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 40px)',
    overflowY: 'auto'
  },
  genreBadge: {
    backgroundColor: '#6a11cb',
    color: 'white'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '50px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    margin: '2rem 0'
  }
};

const MovieApp = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [filterGenre, setFilterGenre] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchMovies = async () => {
    try {
      const url = filterGenre
        ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${filterGenre}&page=${page}&language=uk-UA`
        : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=uk-UA`;
      
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (e) {
      console.error("Помилка завантаження фільмів:", e);
      setError("Не вдалося завантажити фільми");
    }
  };

  const fetchMovieDetails = async (id) => {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=uk-UA`
      );
      const data = await res.json();
      setSelectedMovie(data);
    } catch (e) {
      console.error("Помилка завантаження деталей:", e);
    }
  };

  const handleFilterGenreChange = (genreId) => {
    setFilterGenre(genreId);
    setPage(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !email) {
      setError("Усі поля обов'язкові");
      return;
    }

    if (password.length < 6) {
      setError("Пароль повинен містити щонайменше 6 символів");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        alert("Реєстрація успішна! Тепер увійдіть.");
        setIsRegistering(false);
        setUsername("");
        setPassword("");
        setEmail("");
      } else {
        setError(data.message || "Помилка при реєстрації");
      }
    } catch (err) {
      setError("Помилка при з'єднанні з сервером");
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Усі поля обов'язкові");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setLoggedIn(true);
        setCurrentUser(data.user);
        setError("");
        setUsername("");
        setPassword("");
      } else {
        setError(data.message || "Невірне ім'я користувача або пароль");
      }
    } catch (err) {
      setError("Помилка при з'єднанні з сервером");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem("currentUser");
      setLoggedIn(false);
      setCurrentUser(null);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Помилка при виході:", err);
    }
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setLoggedIn(true);
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchMovies();
  }, [page, filterGenre]);

  return (
    <div style={styles.appContainer}>
      <div style={styles.header} className="container-fluid">
        <div className="container">
          <h1 className="display-4 mb-4">🎬 MovieTime</h1>
          <p className="lead">Відкрийте для себе світ кіно</p>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className={`col-md-${selectedMovie ? "8" : "12"}`}>
            {!loggedIn ? (
              <div style={styles.authForm} className="mb-5">
                <h2 className="h4 mb-4 text-center">{isRegistering ? "Реєстрація" : "Вхід"}</h2>
                <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                  {isRegistering && (
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Ім'я користувача</label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      placeholder="Ваше ім'я"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Пароль</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="Ваш пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {isRegistering && (
                      <small className="text-muted">Мінімум 6 символів</small>
                    )}
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    {isRegistering ? "Зареєструватися" : "Увійти"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-link w-100"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError("");
                    }}
                  >
                    {isRegistering ? "Вже є акаунт? Увійти" : "Немає акаунта? Зареєструватися"}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 mb-0">Список фільмів</h2>
                  <div className="d-flex align-items-center">
                    <select
                      value={filterGenre}
                      onChange={(e) => handleFilterGenreChange(e.target.value)}
                      className="form-select me-3"
                      style={{ width: "200px" }}
                    >
                      <option value="">Всі жанри</option>
                      {GENRES.map(genre => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-outline-light"
                      style={{ backgroundColor: '#6a11cb', color: 'white' }}
                    >
                      Вийти ({currentUser?.username})
                    </button>
                  </div>
                </div>

                <div className="row">
                  {movies.map((movie) => (
                    <div key={movie.id} className="col-md-4 mb-4">
                      <div 
                        className="card h-100"
                        style={styles.movieCard}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                      >
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                            className="card-img-top"
                            alt={movie.title}
                            style={styles.moviePoster}
                          />
                        )}
                        <div className="card-body">
                          <h5 className="card-title">{movie.title}</h5>
                          <p className="card-text">
                            <small className="text-muted">
                              Рейтинг: {movie.vote_average}/10
                            </small>
                          </p>
                          <button
                            onClick={() => fetchMovieDetails(movie.id)}
                            className="btn btn-primary w-100"
                          >
                            Детальніше
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.pagination} className="mt-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn btn-outline-primary me-2"
                  >
                    ← Попередня
                  </button>
                  <span className="mx-3">Сторінка {page} з {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn btn-outline-primary ms-2"
                  >
                    Наступна →
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedMovie && (
            <div className="col-md-4">
              <div className="sticky-top pt-4" style={{ top: "20px" }}>
                <div className="card" style={styles.detailCard}>
                  <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
                    <h5 className="mb-0">Деталі фільму</h5>
                    <button 
                      onClick={closeMovieDetails}
                      className="btn btn-sm btn-light"
                    >
                      ×
                    </button>
                  </div>
                  <div className="card-body">
                    {selectedMovie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`}
                        className="img-fluid mb-3 rounded"
                        alt={selectedMovie.title}
                      />
                    )}
                    <h4>{selectedMovie.title}</h4>
                    <p className="text-muted">
                      {selectedMovie.release_date && new Date(selectedMovie.release_date).getFullYear()}
                      {selectedMovie.runtime && ` • ${selectedMovie.runtime} хв`}
                    </p>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary text-white px-3 py-1 rounded-pill">
                        <strong>Рейтинг:</strong> {selectedMovie.vote_average}/10
                      </div>
                    </div>
                    <p><strong>Опис:</strong></p>
                    <p className="mb-4">{selectedMovie.overview || "Опис відсутній"}</p>
                    {selectedMovie.genres && (
                      <div className="mb-3">
                        <strong>Жанри:</strong>
                        <div className="d-flex flex-wrap mt-2">
                          {selectedMovie.genres.map((g) => (
                            <span 
                              key={g.id} 
                              className="badge bg-secondary me-2 mb-2"
                              style={styles.genreBadge}
                            >
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieApp;