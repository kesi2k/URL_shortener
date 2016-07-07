var config = {}


config.db = {}


/* the URL shortening host - shortened URLs will be this + base62 ID
 i.e.: http://localhost:3000/3Ys
 */
 
config.webhost = 'https://url-shortener-3-kesi2k.c9users.io';

// MongoDB host and database name

config.db.host = 'localhost'
config.db.name = 'url_shortener'

module.exports = config;