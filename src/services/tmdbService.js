import axios from 'axios';
import { TMDB_CONFIG } from '../utils/tmdbConfig';

const tmdbApi = axios.create({
  baseURL: TMDB_CONFIG.API_URL,
  params: {
    api_key: TMDB_CONFIG.API_KEY,
  },
});

export const searchMovies = async (query) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        include_adult: false,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,similar',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getPopularMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
}; 