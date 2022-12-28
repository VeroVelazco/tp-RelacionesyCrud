const db = require('../database/models');
const sequelize = db.sequelize;


const genresController = {
    'list': (req, res) => {
        db.Genre.findAll()
            .then(genres => {
                res.render('genresList.ejs', {genres})
            })
    },
    'detail': (req, res) => {
        db.Genre.findByPk(req.params.id, {
            include : [
                {
                    association : 'movies'
                }
            ]
        })
            .then(genres => {
                res.render('genresDetail.ejs', {genres});
            });
    }

}

module.exports = genresController;