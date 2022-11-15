const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

module.exports = class UserService {
  static async create({ firstName, lastName, email, password }) {
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    console.log('hello, i am in the user Service');
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

  static async signIn({ email, password = '' }) {
    try {
      const user = await User.getByEmail(email);

      if (!user) throw new Error('Invalid email');
      // use built in compareSync method
      if (!bcrypt.compareSync(password, user.passwordHash))
        throw new Error('Invalid password');

      // creates our JWT using built in function
      const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '1 day',
      });

      console.log(token);

      return token;
    } catch (error) {
      error.status = 401;
      throw error;
    }
  }
};
