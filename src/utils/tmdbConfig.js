export const TMDB_CONFIG = {
  API_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/',
  POSTER_SIZE: 'w500',
  BACKDROP_SIZE: 'original',
  API_KEY: '475813c660733b6000b09abc1b3081ad' // Replace with your actual API key
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}${size}${path}`;
}; 