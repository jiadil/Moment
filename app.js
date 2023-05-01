
// loads environment variables from a . env file into the process
require("dotenv").config();
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.CLOUDINARY_KEY);
// console.log(process.env.CLOUDINARY_SECRET);
// console.log(process.env.MAPBOX_TOKEN);

///////////////////////////////////////////////////////////
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");


const AppError = require('./Error/AppError');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

/////////////////////////////////////////////////
// mongoose database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/moment';
const MongoStore = require("connect-mongo");
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

////////////////////////////////////////////////
// app Application level middlewares
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

////////////////////////////////////////////////
// keep user store express and connect
const secret = process.env.SECRET || "ascrect";
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});
store.on("error", function (e) {
    console.log("session store error", e);
});
const sessionConfig = {
    store,
    name:"session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 2,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

////////////////////////////////////////
// helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/doctjjd/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/doctjjd/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/doctjjd/"
];
const fontSrcUrls = ["https://res.cloudinary.com/doctjjd/"];
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/doctjjd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
                mediaSrc: ["https://res.cloudinary.com/doctjjd/"],
                childSrc: ["blob:"]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);


//////////////////////////////////////////////
// passport login
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    console.log(req.session)
    if (!['/login', '/register', '/', '/logout'].includes(req.originalUrl) && req.originalUrl.split('/').pop() !== 'reviews') {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//////////////////////////////////////////////
app.use('/', userRoutes);
app.use('/moment', campgroundRoutes)
app.use('/moment/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})

// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = 'Oh No, Something Went Wrong!'
//     res.status(statusCode).render('error', { err })
// })

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})


