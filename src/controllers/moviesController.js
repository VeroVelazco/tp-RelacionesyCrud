const path = require('path');
const moment = require('moment');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op, Association } = require("sequelize");


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', { movies })
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', { movies });
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', { movies });
            });
    },

    //Aqui dispongo las rutas para trabajar con el CRUD

    add: function (req, res) {
        Genres.findAll({  //traigo todos los generos
            order: ['name']  //ordeno los generos por nombres, dependiendo el abcdario. Si quiero que sea descendiente, debo abrir corchetes y poner ['name',DESC]
        })
            .then(allGenres => {
                return res.render('moviesAdd', {allGenres})  //envio los generes cuando uso el segundo parametro {genres} como objeto.
            })
              
            .catch(err => console.log(err))
    },

    create: function (req, res) {
        //  return res.send(req.body)  //  aca pido que me devuelva lo que hay en el formulario, como array. 
        const { title, release_date, awards, length, rating, genre } = req.body;
        // el metodo create recibe un objeto,deonde recibe los datos para crear una pelicula
        Movies.create({
            title: req.body.title,
            release_date: req.body.release_date,
            awards: req.body.awards,
            length: req.body.length,
            rating: req.body.rating,
            genre_id: req.body.genre,
        }).then(movie => {
            console.log(movie)
            return res.redirect('/movies')
        }).catch(err => console.log(err))
    },

    edit: function (req, res) {
        let Movie = Movies.findByPk(req.params.id, {  //en esta varianle guardo la pelicula

            include : [ {
                association : 'genre'

            }]
        })

        let allGenres = Genres.findAll({       //en esta variable guardo todas los generos de la base de datos.
            order : ['name']
        });
              
          Promise.all([Movie, allGenres]) //coloco las promesas pendientes que tengo. Cuando todas las promesas se cumplan, puede actuar en consecuencia.
            .then(([Movie, allGenres])=>{    //then tiene que tener un callback.El callback recibe parametros y ejecuta 'algo'. En este caso recibe como parametro el array de Promise.
             
            //  console.log(Movie)
            //  console.log(allGenres)
               console.log(moment(Movie.release_date).format('YYYY-MM-DD'))
               return res.render('moviesEdit',{  
                Movie, 
                allGenres,
                date: moment(Movie.release_date).format('YYYY-MM-DD') //a la vista del form, se pasa un objeto con las dos cosas y hay que tener en cuenta el ORDEN
              })
            }) 
             .catch(err =>console.log(err))
    },
    update: function (req, res) {
        // return res.send(req.body)
        const { title, release_date, awards, length, rating, genre } = req.body;
        db.Movie.update({ //el etodo update recibe dos objetos el 1 lleva la data que quiero actualizar y el 2 es el que le indica cual es el criterio para que identifique al registro que quiero actualizar.
            title: req.body.title,
            release_date: req.body.release_date,
            awards: req.body.awards,
            length: req.body.length,
            rating: req.body.rating,
            genre_id: req.body.genre,
        }, {
            where: {  //es el segundo objeto.
                id: req.params.id  //siempre utilizo el where para especificarque que quiero modificar, sino modifaca todo. Aca requiero el parametro por id. El id lo saco de aca - <form action="/movies/update/<%= Movie.id %>" method="POST"> -
                
            }
        })
            .then(movie => {
                console.log(movie);
                return res.redirect('/movies/detail/' + req.params.id)  //se redirecciona a detalle para que se vea el formulario y de ahi modificar la peli.
            })
            .catch(err => console.log(err))
    },
    delete: function (req, res) {
        const Movie = req.query  // utilizo query en lugar del params para no hacer una peticion a la database innecesaria
        res.render('moviesDelete', {Movie})
    },
    
    destroy: function (req, res) {
       const {id} = req.params  //tambien se puede hacer por query en este caso porque solo manda el id, si hubiese otro dato lo mejor es por params para poder diferenciar que estoy eliminando
       Movies.destroy({where:{id}})
        
          .then(()=>{   //recibe un valor si el where devuelve un valor, pero como no devuelve ningun valor, directamente dejo el callback vacio. Lo que esta aca adentro es lo que se va a ejecutar despues de la eliminacion de esa movie
           return res.redirect('/movies')
          })
          .catch(err=>{
            console.log(err)
        })

   
} }


module.exports = moviesController;