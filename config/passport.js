var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    
    Utilisateur = require('../models/utilisateur'),
    config = require('../config/main');

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Utilisateur.findOne({id: jwt_payload.id}, function(err, utilisateur) {
            if (err) return done(err, false);
            if (utilisateur) {
                return done(null, utilisateur)
            } else {
                return done(null, false)
            }           
        });
    }));
};
    