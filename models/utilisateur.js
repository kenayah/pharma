var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    
    SchemaUtilisateur = new mongoose.Schema({
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        motDePasse: {
            type: String,
            require: true
        },
        role: {
            type: String,
            enum: ['Client', 'Manager', 'Admin'],
            default: 'Client'
        }
    });

SchemaUtilisateur.pre('save', function(next) {
    var utilisateur = this;
    if (this.isModified('motDePasse') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(utilisateur.motDePasse, salt, function(err, hash) {
                if (err) return next(err);
                utilisateur.motDePasse = hash;
                next()
            })
        })
    } else {
        return next()
    }
});

SchemaUtilisateur.methods.compareLesMotsDePasses = function(pw, cb) {
    bcrypt.compare(pw, this.motDePasse, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch)
    })
};

module.exports = mongoose.model('Utilisateur', SchemaUtilisateur);