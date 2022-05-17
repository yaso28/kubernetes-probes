const express = require('express');
const router = express.Router();
const osu = require('node-os-utils');

router.get('/usage', async (req, res, next) => {
  try {
    const [cpuUsage, memoryInfo] = await Promise.all([
      osu.cpu.usage(),
      osu.mem.info()
    ]);
    const memoryUsage = 100 - memoryInfo.freeMemPercentage;

    res.json({
      podname: process.env.HOSTNAME,
      cpuUsagePercent: cpuUsage,
      memoryUsagePercent: memoryUsage
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
