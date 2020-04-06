const express = require('express');

module.exports = function(database) {
  const app = express();

  app.get('/api/pins', (req, res) => {
    let options = {
      query: req.query.query,
      page: req.query.page ? parseInt(req.query.page) : 1,
      per_page: req.query.per_page ? parseInt(req.query.per_page) : 10,
      liked: req.query.liked ? req.query.liked === "true" : undefined
    };

    database.getAllPins(options, (err, pins) => {
      if (err)
        throw new Error('Database error: ' + err);

      res.send({
        total: pins.length,
        results: pins
      })
    })
  });

  app.get('/api/pins/:id', (req, res) => {
    database.getPin(parseInt(req.params.id), (err, pin) => {
      if (err)
        throw new Error('Database error: ' + err);

      if (!pin)
        res.status(404).send("Not found");
      else
        res.send({
          result: pin
        })
    })
  });

  app.get('/api/users/:author/pins', (req, res) => {
    let options = {
      author: req.params.author,
      page: req.query.page ? parseInt(req.query.page) : 1,
      per_page: req.query.per_page ? parseInt(req.query.per_page) : 10,
    };

    database.getAllUserPins(options, (err, pins) => {
      if (err)
        throw new Error('Database error: ' + err);

      res.send({
        total: pins.length,
        results: pins
      })
    })
  });

  return app
};
