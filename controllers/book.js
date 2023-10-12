const Book = require('../models/book');
const fs = require('fs');

// Création d'un livre
 exports.createBook = (req, res, next) => {
    console.log(req.file.filename);
    // Chaine JSON -> Objet JS
     const bookObject = JSON.parse(req.body.book);
    // Delete ID générer
     delete bookObject._id;
     delete bookObject._userId;
     // Création du livre
     const book = new Book({
         ...bookObject,
         // Utilisation du token et création du path de l'image
         userId: req.auth.userId,
         imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
     });
    // Sauvegarde
     book.save()
     .then(() => {
        res.status(201).json({ message: 'Livre enregistré !'});
     })
     .catch(error => res.status(400).json({ error }));
};

// Récuperer les livres
exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch (
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

// Récupère l'ID d'un livre
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (!book) {
            res.status(404).json({ message: 'Le livre est introuvable' })
        } else {
            res.status(200).json(book);
        }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Calcul de la note moyenne
exports.averageRating = (req, res, next) => {
    // Récupération du livre associé à l'ID
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        //Mise à jour de la note du livre
        book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
        book.averageRating =

        // Accumulation des notes et note sur 5
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;
        
        return book
        .save()
        .then((book) => res.status(201).json(book))
          .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(404).json({ error: 'Le livre est introuvable' }));
    };

// Les meilleurs livres
exports.bestratingBook = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
     };


// Modifier un livre
exports.modifyBook = (req, res, next) => {
  // Récupération de l'image si on la change
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}.webp`
  }
  // Sinon récupere dans le corps de la requête
   : { ...req.body };
   // Suppression de l'ID
  delete bookObject._userId;
  // Récupération du livre associé à l'ID
  Book.findOne({_id: req.params.id})
    .then((book) => {
      // Vérification si le livre appartient bien à l'utilisateeur connecté
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Pas d autorisation' });
      } else if (req.file) {
        // Récupération de l'image
        const filename = book.imageUrl.split('/images')[1];
        // Suppression de l'image
        fs.unlink(`images/${filename}`, () => { });     
      }
      // Sauvegarde
      Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Livre modifié' }))
        .catch(error => res.status(401).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};

// Suppression d'un livre
exports.deleteBook = (req, res, next) => {
  // Récupération de l'ID du livre
    Book.findOne({ _id: req.params.id })
      .then((book) => {
      // Vérification si le livre appartient bien à l'utilisateeur connecté
        if (!book) {
          res.status(404).json({ message: 'Livre introuvable' });
        } else if (book.userId !== req.auth.userId) {
          res.status(401).json({ message: 'Pas autorisé' });
        } else {
          // Récupération de l'image
          const filename = book.imageUrl.split('/images')[1];
          // Suppression de l'image
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({ _id: req.params.id })
              .then(() => {
                res.status(204).send();
              })
              .catch((error) => res.status(401).json({ error }));
          });
        }
      })
      .catch((error) => res.status(500).json({ error }));
  };