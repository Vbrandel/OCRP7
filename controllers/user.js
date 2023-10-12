const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Création utilisateur
exports.signup = (req, res, next) => {
  // Récupération du mail et hachage du mdp via bcrypt
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        // Sauvegarde de l'utilisateur
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const { email, password } = req.body; // Ajouter cette ligne pour extraire email et password
  
    User.findOne({ email: email })
      .then(user => {
        // Si le mail et le mot de passe sont strictement nul alors erreur
        if (user === null) {
          res.status(401).json({ message: 'Pair identifiant invalide' });
        } else {
          bcrypt.compare(password, user.password)
            .then(valid => {
              // Si le hash est différent de la reequete alors erreur
              if (!valid) {
                res.status(401).json({ message: 'Pair identifiant invalide' });
              } else {
                // Si valide -> connexion pendant 24h
                res.status(200).json({
                  userId: user._id,
                  token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET',{ expiresIn: '24h' })
                });
  
              }
            })
            .catch(error => res.status(500).json({ error: "erreur" }));
        }
      })
      .catch(error => res.status(500).json({ error: "erreur fatale" }));
  };