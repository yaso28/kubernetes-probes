const express = require('express');
const router = express.Router();
const configCaller = require('../services/config-caller.js');

const handle = async (req, res, next, callerMethod) => {
  try {
    await callerMethod();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

router.get('/start', (req, res, next) => handle(req, res, next, configCaller.getProbeStart));
router.get('/live', (req, res, next) => handle(req, res, next, configCaller.getProbeLive));
router.get('/read', (req, res, next) => handle(req, res, next, configCaller.getProbeRead));

module.exports = router;
