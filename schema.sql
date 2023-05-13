DROP TABLE IF EXISTS movie;

CREATE TABLE IF NOT EXISTS movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(250),
    release_date VARCHAR(250),
    poster_path VARCHAR(250),
    overview VARCHAR(500)
);