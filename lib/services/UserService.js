const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

module.exports = class UserService {
  static async create({ firstName, lastName, email, password }) {
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    console.log("hello, i'm in the user Service");
    console.log('passwordHash: ', passwordHash);
    const user = await User.insert({
      firstName,
      lastName,
      email,
      passwordHash,
    });
    console.log(user.passwordHash);
    return user;
  }
};
