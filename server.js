'use strict';
let error404 = {
    "status": 404,
    "responseText": "Sorry, page not found "
};
let PORT = 3000
const express = require('express');
const cors = require('cors');
const movieData = require('./Movie Data/data.json');
const axios = require('axios');
require('dotenv').config();
const APIKEY = process.env.APIKEY;
const pg = require('pg');
const server = express();
server.use(cors());
server.use(express.json())

const client = new pg.Client('postgresql://localhost:5432/movies')

server.get('/', handelHome);
server.get('/favorite', handelFavorite);
server.get('/trending', handeltrending);
server.get('/search', handelsearch);
server.get('/getmovies', getMovieHandler);
server.post('/addmovie', addMovieHandler);
server.put('/update/:id', updateMoviesHandler);
server.delete('/delete/:id', deleteMovieHandler);
server.get('/getmovie/:id', getMoviebyId);
server.get('/classic', handelOldMovies);
server.get('/actor', handleByActor);
server.get('*', handelNotFound);
server.use(errorHandler);

let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`;

function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;

}

function handelsearch(req, res) {
    let userSearch = "interstellar";
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=${userSearch}`;

    axios.get(url)
        .then(results => {
            let movies = results.data.results.map(val => {
                return new Movie(val.id, val.title, val.release_date, val.poster_path, val.overview);
            });
            res.status(200).send(movies);
        }).catch(err => {
            errorHandler(err, req, res);
        })
}

function handelOldMovies(req, res) {
    axios.get(`http://api.themoviedb.org/3/discover/movie?api_key=${process.env.APIKEY}&year=1994`)
        .then(result => {
            let mapResult = result.data.results.map(val => {
                let movie = new Movie(val.id, val.title, val.release_date, val.poster_path, val.overview);
                return movie;
            })
            res.send(mapResult)

        }).catch((err) => {
            errorHandler(err, req, res);

        })

}

function handleByActor(req, res) {
    axios.get(`http://api.themoviedb.org/3/discover/movie?api_key=${process.env.APIKEY}&with_cast=380`)
        .then(result => {
            let mapResult = result.data.results.map(val => {
                let movie = new Movie(val.id, val.title, val.release_date, val.poster_path, val.overview);
                return movie;
            })
            res.send(mapResult)

        }).catch((err) => {
            errorHandler(err, req, res);

        })


}


function handeltrending(req, res) {
    axios.get(url)
        .then(result => {
            let mapResult = result.data.results.map(val => {
                let movie = new Movie(val.id, val.title, val.release_date, val.poster_path, val.overview);
                return movie;
            })
            res.send(mapResult)

        }).catch((err) => {
            errorHandler(err, req, res);

        })
}

function getMovieHandler(req, res) {
    const sql = `SELECT * FROM movie`;
    client.query(sql)
        .then((data) => {
            res.status(200).send(data.rows);
        })
        .catch((error) => {
            errorHandler(error, req, res);
        })

}

function addMovieHandler(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO movie(title,release_date,poster_path,overview) VALUES ($1,$2,$3,$4);`
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview];
    client.query(sql, values)
        .then(data => {
            res.status(200).send("The data has been added successfully");
        }).catch((error) => {
            errorHandler(error, req, res)
        });
}

function updateMoviesHandler(req, res){
    const {id} = req.params;
    console.log(req.body);
    const sql = `UPDATE movie SET title=$1, release_date=$2, poster_path=$3, overview=$4
    WHERE id=${id};`
    const {title, release_date,poster_path,overview} = req.body;
    const values=[title, release_date, poster_path, overview];
    client.query(sql,values)
    .then((data)=>{
        res.status(200).send(data)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })

}

function deleteMovieHandler(req, res){
    const {id} = req.params;
    const sql = `DELETE FROM movie WHERE id=${id};`
    client.query(sql)
    .then((data)=>{
        res.status(202).send(data)
    
    })
    .catch((error) => {
        errorHandler(error, req, res)
    });
}

function getMoviebyId(req, res){
    const {id} = req.params;
    const sql = `SELECT * FROM movie WHERE id=${id};`
    client.query(sql)
    .then((data)=>{
        res.status(200).send(data.rows)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}

function handelHome(req, res) {
    let obj;
    obj = new Movie(movieData.title, movieData.poster_path, movieData.overview);

    return res.status(200).json(obj);

}
function handelNotFound(req, res) {
    res.status(404).json(error404)
}
function handelFavorite(req, res) {
    return res.status(200).send("Welcome to Favorite Page");
}


function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error

    }
    res.status(500).send(err);
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log("listinig to port 3000");
        })


    })