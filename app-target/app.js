const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/probe', require('./routes/probe.js'));

app.use(require('./middlewares/error-handler-404.js'));
app.use(require('./middlewares/error-handler-500.js'));

module.exports = app;
