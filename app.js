var express = require('express'),
    app = express(),
    analyse = require('body-parser'),
    noteur = require('morgan'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    passport = require('passport'),
    passportJWT = require('passport-jwt'),

    ExtractJwt = passportJWT.ExtractJwt,
    JwtStrategy = passportJWT.Strategy,
    
    routeur = express.Router(),
    users = [
        {
            id: 1,
            nom: 'bab',
            motDePasse: '%zak::'

        },
        {
            id: 2,
            nom: 'test',
            motDePasse: 'test'
        }
    ],
    jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'gentilBébéDePapaLovesChips&myPapaLovesSpicyChickenWings';
var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
        console.log('payload received', jwt_payload);
        // usually this would be a database call:
        var user = users[_.findIndex(users, {id: jwt_payload.id})];
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
passport.use(strategy);
        
app.use(passport.initialize());
app.use(analyse.urlencoded({ extended: true }));
app.use(analyse.json());
app.use(noteur('dev'));

app.set('json spaces', 4);

MongoClient.connect('mongodb://localhost:27017/pharma⁶', function(err, db) {
    assert.equal(null, err);
    console.log('\nConnection à la base effectuée');

    routeur.use(function(req, res, next) {
        // do logging
        console.log('Serveur en activité');
        next(); // make sure we go to the next routes and don't stop here
    });
    routeur.get('/', function(req, res) {
        res.json({message: 'Bienvenu sur pharma⁶!'});
    });

    routeur.post("/login", function(req, res) {
        if(req.body.nom && req.body.motDePasse){
          var   nom = req.body.nom,
                motDePasse = req.body.motDePasse;
        }
        // usually this would be a database call:
        var user = users[_.findIndex(users, {nom: nom})];
        if( ! user ){
          res.status(401).json({message:"no such user found"});
        }
      
        if(user.motDePasse === req.body.motDePasse) {
          // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
          var payload = {id: user.id};
          var token = jwt.sign(payload, jwtOptions.secretOrKey);
          res.json({message: "ok", token: token});
        } else {
          res.status(401).json({message:"motDePasses did not match"});
        }
    });

    
    
    routeur.post('/nouvellePharmacie', function(req, res, next) {
            //var agence = new Agence();
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
                }
            );
            res.json({message: 'Pharmacie ' + req.body.nom + ' de ' + req.body.localite + 'est enregistrée.'})

        });
        
    routeur.get("/pharmaciesPresDeChezMoi", passport.authenticate('jwt', {session: false }), function(req, res) {
        res.json({message: 'là seront listées les pharmacies proches de vous!'})
    });

    app.use('/api', routeur);

    // Handler for internal server errors
    function errorHandler(err, req, res, next) {
        console.error(err.message);
        console.error(err.stack);
        res.status(500).render('error_template', { error: err });
    }
    
    var server = app.listen(8000, function() {
        var port = server.address().port;
        console.log('et serveur actif sur le port %s.\n', port);
        console.log('API lancée et dispo.\n');
    });
    
});



/**/


