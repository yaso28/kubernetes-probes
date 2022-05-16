const express = require('express');
const router = express.Router();

const isExcluded = (targetPodName, envExclude) => {
  const excludedList = (envExclude || '').split(',');
  return excludedList.includes(targetPodName);
}

const handle = (req, res, envExclude) => {
  if (isExcluded(req.query.podname, envExclude)) {
    throw new Error('EXCLUDED');
  }
  res.status(204).end();
};

router.get('/start', (req, res) => handle(req, res, process.env.START_EXCLUDE));
router.get('/live', (req, res) => handle(req, res, process.env.LIVE_EXCLUDE));
router.get('/read', (req, res) => handle(req, res, process.env.READ_EXCLUDE));

module.exports = router;
