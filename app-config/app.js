const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({
        start: process.env.START_EXCLUDE,
        live: process.env.LIVE_EXCLUDE,
        read: process.env.READ_EXCLUDE,
    })
});

app.use(require('./middlewares/error-handler-404.js'));
app.use(require('./middlewares/error-handler-500.js'));

module.exports = app;
