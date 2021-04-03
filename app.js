if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync');
const session = require('express-session')
const MongoDBStore = require('connect-mongo')(session);
//const { campgroundSchema, reviewSchema } = require('./schemas')
//const Review = require('./models/review')
const flash = require('connect-flash')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"))
db.once("open", () => {
    console.log("Database Connected")
})

const app = express();
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true }))
app.use(flash())
app.use(mongoSanitize())

app.use(helmet({contentSecurityPolicy : false}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoDBStore({
    url : dbUrl,
    secret,
    touchAfter : 24*60*60
});

store.on('error', e => console.log("Session Store Error!",e))

const sessionConfig = {
    store,
    name : 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        //secure : true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    console.log(req.query)
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/',(req, res) => {
    res.render('home')
})

app.use('/',userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.all('*', (req, res, next) => {
    console.log("USED . . . . . . . . . . . . .. . . . . . .  . . .")
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    console.log(err)
    if (!err.message) { err.message = "Something Went Wrong : (" }
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Listening on port 3000...')
})