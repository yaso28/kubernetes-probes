const axios = require('axios');

const get = async (url) => {
  await axios.get(url, {
    baseURL: process.env.CONFIG_BASEURL || 'http://app-config:3000',
    params: {
      podname: process.env.HOSTNAME
    }
  });
};

const caller = {
  getProbeStart: () => get('/probe/start'), 
  getProbeLive: () => get('/probe/live'), 
  getProbeRead: () => get('/probe/read'), 
};

module.exports = caller;
