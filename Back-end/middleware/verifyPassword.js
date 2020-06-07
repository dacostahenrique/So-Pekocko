const passwordSchema = require('../models/password');


//vérifie que le mot de passe valide le schema décrit
module.exports = (req, res, next) =>
{
    if(!passwordSchema.validate(req.body.password))
    {
        //res.writeHead(400, {"Content-Type": "text/html"});
        //res.end('<p>Le mot de passe doit contenir au moins 8 caracteres</p>');
        //res.render('passe.ejs');
        return res.status(400).json({error: 'Mot de passe pas assez fort ! ' + passwordSchema.validate(req.body.password, {list:true})});
    }
    else
    {
        next();
    }
};
