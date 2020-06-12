const mongoose = require('mongoose');
require('mongoose-type-email');
const uniqueValidator = require('mongoose-unique-validator');

// la valeur unique , avec l'élément mongoose-unique-validator passé comme plug-in,
// s'assurera que deux utilisateurs ne peuvent partager la même adresse e-mail.
// Utilisation d'une expression régulière pour valider le format d'email.
// Le mot de passe fera l'objet d'une validation particulière grâce au middleware verifPasword et au model password
const userSchema = mongoose.Schema({
 email:{ type:String, unique:true, required:[true,"Veuillez entrer votre adresse email"], match:[/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Veuillez entrer une adresse email correcte"] },
  password: { type: String, required:[true,"Veuillez choisir un mot de passe"] }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);


