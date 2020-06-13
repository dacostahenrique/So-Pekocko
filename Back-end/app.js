// APPLICATION : fait appel aux différentes fonctions implémentées dans l'APi :
// Accès aux images, aux route User, aux route Sauce

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet')
const session = require('cookie-session');
const nocache = require('nocache');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//Connection à la base de données
mongoose.connect('mongodb+srv://henrique:inna1973@cluster0-ryf80.mongodb.net/Pekocko?retryWrites=true&w=majority',
  { useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Création d'une application express
const app = express();

app.use((req, res, next) => {
  //on indique que les ressources peuvent être partagées depuis n'importe quelle origine
  res.setHeader('Access-Control-Allow-Origin', '*');
  //on indique les entêtes qui seront utilisées après la pré-vérification cross-origin (vérifie sur le protocole CORS est autorisé)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //on indique les méthodes autorisées pour les requêtes HTTP
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  //n'autorise que ce serveur à fournir des scripts pour la page visitée
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

//Options de sécurisation des cookies
const expiryDate = new Date( Date.now() + 3600000); // 1 heure (60 * 60 * 1000)
app.use(session({
  name: 'session',
  secret: "s3Cur3",
  cookie: { secure: true,
            httpOnly: true,
            domain: 'http://localhost:3000',
            expires: expiryDate
          }
  })
);

//Middleware qui permet de parser les requêtes envoyées par le client, on peut y accéder grâce à req.body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//Midleware qui permet de charger les fichiers qui sont dans le repertoire images
app.use('/images', express.static(path.join(__dirname, 'images')));
//Middleware qui va transmettre les requêtes vers ces url vers les routes correspondantes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
//Sécuriser Express en définissant divers en-têtes HTTP
app.use(helmet());
//Désactive la mise en cache du navigateur
app.use(nocache());

module.exports = app;
