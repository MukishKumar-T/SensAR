require('dotenv').config();

module.exports = {
    omdb: {
        baseUrl: 'http://www.omdbapi.com',
        apiKey: process.env.OMDB_API_KEY || 'your-omdb-api-key', // Get from http://www.omdbapi.com/apikey.aspx
    }
}; 