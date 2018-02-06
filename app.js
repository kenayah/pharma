var express = require('express'),
    app = express(),
    analyse = require('body-parser'),
    noteur = require('morgan'),
    MongoClient = require('mongodb').MongoClient,
    mongoose = require('mongoose'),
    assert = require('assert'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    passport = require('passport'),
    passportJWT = require('passport-jwt'),

    Utilisateur = require('./models/utilisateur'),
    config = require('./config/main'),
    
    
    routeur = express.Router();
    
//passport.use(strategy);
        
app.use(passport.initialize());
app.use(analyse.urlencoded({ extended: false }));
app.use(analyse.json());
app.use(noteur('dev'));

app.set('json spaces', 4);

/*MongoClient.connect('mongodb://localhost:27017/pharma⁶', function(err, db) {
    assert.equal(null, err);
    console.log('\nConnection à la base effectuée');

    routeur.use(function(req, res, next) {
        // do logging
        console.log('Serveur en activité');
        next(); // make sure we go to the next routes and don't stop here
    });
    routeur.get('/', (req, res) => res.json({message: 'Bienvenu sur pharma⁶!'}));

    routeur.post("/login", (req, res) => {
        if(req.body.nom && req.body.motDePasse){
            var nom = req.body.nom,
                motDePasse = req.body.motDePasse;
        }
        // usually this would be a database call:
        var user = users[_.findIndex(users, {nom: nom})];
        if( ! user ){
          res.status(401).json({message:"no such user found"});
        }
      
        if(user.motDePasse === req.body.motDePasse) {
          // from now on we'll identify the user by the id and the id is the only personalized value that goes into our jeton
          var payload = {id: user.id};
          var jeton = jwt.sign(payload, jwtOptions.secretOrKey);
          res.json({message: "ok", jeton: jeton});
        } else {
          res.status(401).json({message:"motDePasses did not match"});
        }
    });

    
    
    routeur.post('/nouvellePharmacie', (req, res) => {
            var agence = "XX";
            db.collection('agences').insertOne(
                {
                nom : req.body.nom,
                rue : req.body.rue,
                avenue : req.body.avenue,
                boulevard : req.body.boulevard,
                quartier : req.body.quartier,
                localite : req.body.localite,
                BP : req.body.bp,
                ouvert_h24 : req.body.ouvert_h24,
                ouvert_7Sur7 : req.body.ouvert_7Sur7,
                ouverture : req.body.ouverture,
                fermeture : req.body.fermeture,
                ouvertureWeekend : req.body.ouvertureWeekend,
                fermetureWeekend : req.body.fermetureWeekend,
                telephone : req.body.telephone,
                siteWeb : req.body.url,
                email : req.body.email,
                pharmacien : req.body.pharmacien,
                crééLe : new Date()
                }//, (req, res) => {
                    //console.log('. . . test worked!')
                //}
            );
            db.collection('agences').find(
                {nom : req.body.nom, localite : req.body.localite},{_id: 1}, (req, res) => {
                    var profilID = res._id;
                    console.log(profilID)
                }
            ).sort({"_id": -1});
            db.collection('utilisateurs').insertOne(
                {
                    login : req.body.email,
                    motDePasse : req.body.motDePasse
                }
            );
            res.json({message: 'Pharmacie ' + req.body.nom + ' de ' + req.body.localite + 'est enregistrée.'})

        }
    );
        
    routeur.get("/pharmaciesPresDeChezMoi", 
        passport.authenticate('jwt', 
            {session: false }), 
            (req, res) => {
                res.json({message: 'Ici seront listées les pharmacies proches de chez vous!'})
            }
        );

    app.use('/api', routeur);

    // Handler for internal server errors
    function errorHandler(err, req, res, next) {
        console.error(err.message);
        console.error(err.stack);
        res.status(500).render('error_template', { error: err });
    }
    
    var server = app.listen(8000, () => {
            var port = server.address().port;
            console.log('et serveur actif sur le port %s.\n', port);
            console.log('API lancée et dispo.\n');
        }
    );
    
});*/

mongoose.connect(config.db, () => {
    console.log('\nConnection à la base effectuée');
    require('./config/passport')(passport);

    routeur.get('/', (req, res) => res.send('B i e n v e n u&nbsp; s u r&nbsp; p h a r m a ⁶ !'));

    routeur.post('/senregistrer', (req, res) => {
        if(!req.body.email || !req.body.motDePasse) {
            res.json({succes: false, message: 'Il vous faut fournir une adresse email et un mot de passe pour s\'enregistrer'})
        } else {
            var nouvelUtilisateur = new Utilisateur({
                email: req.body.email,
                motDePasse: req.body.motDePasse
            });
            nouvelUtilisateur.save(function(err){
                if (err) {
                    return res.json({succes: false, message: req.body.email + ' est déjà utilisée.'})
                }
                res.json({succes: true, message: 'Utilisateur, ' + req.body.email + ' inscrit.'})
            })
        }
    });

    
    routeur.post('/authenticate', function(req, res) {
        Utilisateur.findOne({
            email: req.body.email
        }, function(err, utilisateur) {
            if (err) throw err;
            if (!utilisateur) {
                res.send({succes: false, message: 'Authentification echouée. Mot de passe ou login erroné.'})
            } else {
                utilisateur.compareLesMotsDePasses(req.body.motDePasse, function(err, isMatch) {
                    if (isMatch && !err) {
                        console.log(utilisateur);
                        var jeton = jwt.sign({uneCle: utilisateur._id}, config.secret, {
                            expiresIn: 10080
                        });
                        res.json({succes: true, jeton: 'JWT ' + jeton})
                    } else {
                        res.json({succes: false, message: 'Authentification echouée. Mot de passe ou login erroné.'})
                    }
                })
            }
        })
    });

    routeur.get('/dashboard', passport.authenticate('jwt', {session: false}), function(req, res){
        res.send('De la balle!!! Ici seront affichées les données de ce compte')
    });

    app.use('/api', routeur);
    app.listen(config.port, (req, res, err) => {
        console.log('et serveur actif sur le port %s.\n', config.port);
        console.log('REST API prêt et disponible.\n')
    });
});




