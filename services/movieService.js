const axios = require('axios');
const apiConfig = require('../config/api');

class MovieService {
    constructor() {
        this.baseURL = apiConfig.omdb.baseUrl;
        this.apiKey = apiConfig.omdb.apiKey;
    }

    async searchMovies(query, page = 1) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    s: query,
                    page: page,
                    type: 'movie'
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error);
            }

            return response.data.Search.map(movie => ({
                id: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                posterPath: movie.Poster !== 'N/A' ? movie.Poster : null,
                type: movie.Type
            }));
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    }

    async getMovieDetails(movieId) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    i: movieId,
                    plot: 'full'
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error);
            }

            const movie = response.data;
            return {
                id: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                rated: movie.Rated,
                released: movie.Released,
                runtime: movie.Runtime,
                genre: movie.Genre.split(', '),
                director: movie.Director,
                writer: movie.Writer,
                actors: movie.Actors.split(', '),
                plot: movie.Plot,
                language: movie.Language,
                country: movie.Country,
                awards: movie.Awards,
                posterPath: movie.Poster !== 'N/A' ? movie.Poster : null,
                ratings: movie.Ratings,
                imdbRating: movie.imdbRating,
                imdbVotes: movie.imdbVotes,
                boxOffice: movie.BoxOffice,
                production: movie.Production
            };
        } catch (error) {
            console.error('Error getting movie details:', error);
            throw error;
        }
    }

    async getPopularMovies() {
        // OMDB doesn't have a direct popular movies endpoint
        // We'll search for some popular keywords or recent years
        try {
            const currentYear = new Date().getFullYear();
            const popularQueries = [
                { s: 'marvel', y: currentYear.toString() },
                { s: 'star wars', y: currentYear.toString() },
                { s: 'action', y: currentYear.toString() }
            ];

            const results = await Promise.all(
                popularQueries.map(query =>
                    axios.get(this.baseURL, {
                        params: {
                            apikey: this.apiKey,
                            ...query,
                            type: 'movie'
                        }
                    })
                )
            );

            const movies = results
                .filter(response => response.data.Response === 'True')
                .flatMap(response => response.data.Search || [])
                .map(movie => ({
                    id: movie.imdbID,
                    title: movie.Title,
                    year: movie.Year,
                    posterPath: movie.Poster !== 'N/A' ? movie.Poster : null,
                    type: movie.Type
                }));

            // Remove duplicates and return random selection
            const uniqueMovies = [...new Map(movies.map(movie => [movie.id, movie])).values()];
            return uniqueMovies.sort(() => Math.random() - 0.5).slice(0, 10);
        } catch (error) {
            console.error('Error getting popular movies:', error);
            throw error;
        }
    }

    async getSimilarMovies(movieId) {
        try {
            // First get the movie details to use its genre and title keywords
            const movie = await this.getMovieDetails(movieId);
            const searchTerm = movie.genre[0]; // Use first genre as search term

            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    s: searchTerm,
                    type: 'movie'
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error);
            }

            // Filter out the original movie and map the results
            return response.data.Search
                .filter(m => m.imdbID !== movieId)
                .map(movie => ({
                    id: movie.imdbID,
                    title: movie.Title,
                    year: movie.Year,
                    posterPath: movie.Poster !== 'N/A' ? movie.Poster : null,
                    type: movie.Type
                }))
                .slice(0, 5); // Limit to 5 similar movies
        } catch (error) {
            console.error('Error getting similar movies:', error);
            throw error;
        }
    }
}

module.exports = new MovieService(); 