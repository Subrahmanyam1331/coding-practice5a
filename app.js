const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())
let db = null

const dbPath = path.join(__dirname, 'moviesData.db')

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3004/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

const convertDbobjectToResponseobject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//API-1

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie;`

  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbobjectToResponseobject(eachMovie)),
  )
})

//API-2

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES (${directorId}, '${movieName}', '${leadActor}');`

  const movie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//API-3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId}`

  const addedMovie = await db.get(getMovieQuery)
  response.send(convertDbobjectToResponseobject(addedMovie))
})

//API-4

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId}`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API-5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM movie WHERE movie_id = ${movieId}`

  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API-6

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT * FROM director`

  const directorArray = await db.all(getDirectorQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertDbobjectToResponseobject(eachDirector),
    ),
  )
})

//API-7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
  SELECT * FROM movie WHERE director_id = ${directorId}`

  const DirectorMoviesArray = await db.all(getDirectorMoviesQuery)
  response.send(DirectorMoviesArray)
})

module.exports = app
