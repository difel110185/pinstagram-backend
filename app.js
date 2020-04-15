const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = function(database) {
  const app = express();

  app.use(express.urlencoded({extended: false}))
  app.use(express.json())

  const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.sendStatus(401)
      return
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403)
        return
      }
      req.user = user
      next()
    })
  }

  app.get('/api/pins', authenticateJWT, (req, res) => {
    let options = {
      query: req.query.query,
      page: req.query.page ? parseInt(req.query.page) : 1,
      per_page: req.query.per_page ? parseInt(req.query.per_page) : 10,
      liked: req.query.liked ? req.query.liked === "true" : undefined,
      email: req.query.email
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

  app.get('/api/pins/:id', authenticateJWT, (req, res) => {
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

  app.post('/api/like-pin', (req, res) => {
    database.likePin(req.body.email, req.body.pin_id, req.body.liked, (err, user) => {
      if (err) {
        res.sendStatus(500)
        return
      }

      res.sendStatus(200)
    })
  })

  app.get('/api/users/:author/pins', authenticateJWT, (req, res) => {
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

  app.post('/api/users', (req, res) => {
    database.createUser(req.body.email, req.body.password, (err, user) => {
      if (err) {
        res.sendStatus(500)
        return
      }

      // user created successfully, now we should log the user in
      res.send({
        "accessToken": jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"})
      });
    })
  })

  app.post('/api/users/login', (req, res) => {
    database.getUser(req.body.email, req.body.password, (err, user) => {
      if (err) {
        res.sendStatus(500)
        return
      }

      // User credentials are correct, now we should log the user in
      res.send({
        "accessToken": jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"})
      });
    });
  });

  return app
};
