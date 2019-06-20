const app_name     = require('./package.json').name;
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const path         = require('path');
const debug        = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);
const express      = require('express');
const favicon      = require('serve-favicon');
const flash      = require("connect-flash");
const hbs          = require('hbs');
const logger       = require('morgan');
const mongoose     = require('mongoose');
const session      = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport     = require("passport");

const app = express();

// Load environment variables from the ".env" files
// (put this before the setupr files since this defines env variables)
// require("dotenv").config({path: __dirname + './.env'});
require("dotenv").config();
// run the code that sets up the Mongoose database connection
require("./config/mongoose-setup");
// run the code that sets up Passport
require("./passport")(app);



// mongoose
//   .connect('mongodb://localhost/movierate-server', {useNewUrlParser: true})
//   .then(x => {
//     console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
//   })
//   .catch(err => {
//     console.error('Error connecting to mongo', err);
//   });


// =============== Middleware Setup ===================

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// ====================================================


// ============ Express View engine setup =============

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

// ====================================================


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'movieRate.ico')));


// ===================== Helpers ======================

hbs.registerHelper('ifUndefined', (value, options) => {
  if (arguments.length < 2)
      throw new Error("Handlebars Helper ifUndefined needs 1 parameter");
  if (typeof value !== undefined ) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
});


hbs.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

// ====================================================


// default value for title local
app.locals.title = 'MovieRate';

// default value for class set to divs for general body (below nav)
app.locals.generalBodyCLass = "generalBody";

// Enable authentication using session + passport
app.use(session({
  secret: 'irongenerator',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore( { mongooseConnection: mongoose.connection })
}));

app.use(flash());
require('./passport')(app);


app.use((req, res, next) => {
  // console.log("this is the user info after log in ------ ", req.user);

  // Passport defines "req.user" if the user is logged in
  // ("req.user" is the result of deserialize)
  res.locals.currentUser = req.user;

  res.locals.domainName = process.env.DOMAIN_NAME;

  // call "next()" to tell Express that we've finished
  // (otherwise your browser will hang)
  next();
});


// ====================== ROUTES =======================

const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const movieRoutes = require('./routes/movies');
app.use('/movies', movieRoutes);

const actorRoutes = require('./routes/actors');
app.use('/actors', actorRoutes);

const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

const playlistRoutes = require('./routes/playlists');
app.use('/playlists', playlistRoutes);

// ====================================================

module.exports = app;
