const handler = (err, req, res, next) => {  
  const response = {
    message: err.message
  };
  res.status(500).json(response);
};

module.exports = handler;
