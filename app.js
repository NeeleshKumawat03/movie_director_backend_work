const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null
const instantiateDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server is started at port 3000')
    })
  } catch (e) {
    console.log(e)
  }
}

instantiateDbAndServer()

// get Movies
app.get('/movies', async (req, res) => {
  const getAllMoviesQuery = `
        SELECT * FROM movie;
    `

  const allMovies = await db.all(getAllMoviesQuery)
  // res.send(allMovies)
  res.send(
    allMovies.map(name => {
      return {
        movieName: name.movie_name,
      }
    }),
  )
})

// Post movies
app.post('/movies', async (req, res) => {
  const {directorId, movieName, leadActor} = req.body

  const createMovieQuery = `
        INSERT INTO movie(director_id, movie_name, lead_actor)
        VALUES(${directorId}, '${movieName}', '${leadActor}');
    `

  const addedMovie = await db.run(createMovieQuery)
  res.send('Movie Successfully Added')
})

// get movie by ID
app.get('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params

  const movieByIdQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};
  `

  const movieById = await db.get(movieByIdQuery)
  console.log(movieById)
  res.send({
    movieId: movieById.movie_id,
    directorId: movieById.director_id,
    movieName: movieById.movie_name,
    leadActor: movieById.lead_actor,
  })
})

// update movie
app.put('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const {directorId, movieName, leadActor} = req.body

  const updateQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
  `

  await db.run(updateQuery)
  res.send('Movie Details Updated')
})

// delete API
app.delete('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params

  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
  `

  await db.run(deleteQuery)
  res.send('Movie Removed')
})

app.get('/directors', async (req, res) => {
  const getDirectorsQuery = `
    SELECT * FROM director;
  `

  const directors = await db.all(getDirectorsQuery)
  res.send(
    directors.map(director => {
      return {
        directorId: director.director_id,
        directorName: director.director_name,
      }
    }),
  )
})

// get specific director Movie API
app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params

  const getSpecificDirectorMovieQuery = `
    SELECT * FROM movie
    WHERE director_id = ${directorId};
  `

  const movies = await db.all(getSpecificDirectorMovieQuery)
  res.send(
    movies.map(movie => {
      return {
        movieName: movie.movie_name,
      }
    }),
  )
})

module.exports = app
