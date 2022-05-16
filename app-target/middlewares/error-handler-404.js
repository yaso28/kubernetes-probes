const handler = (req, res) => {
  const error = {
    message: 'Not Found',
    path: req.path
  };
  res.status(404).json(error);
};

module.exports = handler;
