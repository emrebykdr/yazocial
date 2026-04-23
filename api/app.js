var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// Database
const Database = require('./db/database');

// Logger
const Logger = require('./lib/Logger');

// Routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const questionsRouter = require('./routes/questions');
const answersRouter = require('./routes/answers');
const commentsRouter = require('./routes/comments');
const votesRouter = require('./routes/votes');
const tagsRouter = require('./routes/tags');
const articlesRouter = require('./routes/articles');
const projectsRouter = require('./routes/projects');
const badgesRouter = require('./routes/badges');
const notificationsRouter = require('./routes/notifications');
const followsRouter = require('./routes/follows');

var app = express();
app.use(cors());

// Database connection
const db = new Database();
db.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

// HTTP request duration logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => Logger.logRequest(req, res, Date.now() - start));
    next();
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/votes', votesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/follows', followsRouter);

// API Health Check
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Yazocial API is running',
        version: '1.0.0',
        endpoints: [
            '/api/users',
            '/api/questions',
            '/api/answers',
            '/api/comments',
            '/api/votes',
            '/api/tags',
            '/api/articles',
            '/api/projects',
            '/api/badges',
            '/api/notifications',
            '/api/follows'
        ]
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        success: false,
        error: err.message,
        status: err.status || 500
    });
});

module.exports = app;
