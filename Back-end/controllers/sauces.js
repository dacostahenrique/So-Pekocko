const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  // Pour la route PUT = modification d'une sauce
  let sauceObject = {};

  req.file ? (
    // Si la modification contient une image => Utilisation de l'opérateur ternaire comme structure conditionnelle.
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      // On supprime l'ancienne image du serveur
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlinkSync(`images/${filename}`)
    }),
    sauceObject = {
      // On modifie les données et on ajoute la nouvelle image
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
    }
 ) : ( //Opérateur ternaire équivalent à if() {} else {} => condition ? Instruction si vrai : Instruction si faux
    // Si la modification ne contient pas de nouvelle image
    sauceObject = { ...req.body }
  )

  Sauce.updateOne(
    // On applique les paramètre de sauceObject
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch((error) => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.likeDislike = (req, res, next) => {
  // Pour la route READ = Ajout/suppression d'un like / dislike à une sauce
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  console.log ("like :" + like,"userId :" + userId,"sauceId :"  + sauceId)
  console.log ("type of like :" + typeof(like));

  if (like === 1) { // Si il s'agit d'un like
    Sauce.updateOne(
      { _id: sauceId },
      {
        $push: { usersLiked: userId },
        $inc: { likes: +1 },
      }
    )
      .then(() => res.status(200).json({ message: 'Like ajouté !' }))
      .catch((error) => res.status(400).json({ error }))
  }
  if (like === -1) {
    Sauce.updateOne( // Si il s'agit d'un dislike
      { _id: sauceId },
      {
        $push: { usersDisliked: userId },
        $inc: { dislikes: +1 },
      }
    )
      .then(() => {
        res.status(200).json({ message: 'Dislike ajouté !' })
      })
      .catch((error) => res.status(400).json({ error }))
  }
  if (like === 0) { // Si il s'agit d'annuler un like ou un dislike
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) { // Si il s'agit d'annuler un like
          Sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersLiked: userId },
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Like retiré !' }))
            .catch((error) => res.status(400).json({ error }))
        }
        if (sauce.usersDisliked.includes(userId)) { // Si il s'agit d'annuler un dislike
          Sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersDisliked: userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
            .catch((error) => res.status(400).json({ error }))
        }
      })
      .catch((error) => res.status(404).json({ error }))
  }
}
