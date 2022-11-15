const { Router } = require('express');
const UserService = require('../services/UserService');

module.exports = Router().post('/', async (req, res) => {
  try {
    console.log("hello! I'm in the router, here is my body");
    console.log(req.body);
    const user = await UserService.create(req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
});
