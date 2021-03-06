/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const debug = require('debug')(require('../../package.json').name);
const { User } = require('../models');

if (!process.env.APP_TOKEN_SECRET) {
  throw new Error('APP_TOKEN_SECRET must be set to start the application');
}

const secret = process.env.APP_TOKEN_SECRET;
// @link checkout https://github.com/auth0/node-jsonwebtoken#usage for ttl syntax
const ttl = Number(process.env.APP_TOKEN_TTL) ? Number(process.env.APP_TOKEN_TTL) : '1d';

async function login(did) {
  const user = await User.findOne({ did });
  if (!user) {
    throw new Error(`User for did ${did} not found`);
  }

  const token = jwt.sign({ uid: user._id.toString(), did }, secret, { expiresIn: ttl });
  debug('jwt.login', { did, token });
  return token;
}

function decode(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return reject(err);
      }

      const { did, uid } = decoded;
      debug('jwt.decode', { did, uid });
      if (!did || !uid) {
        return reject(new Error('Invalid jwt token: invalid did or uid'));
      }

      const user = await User.findById(uid);
      if (!user) {
        debug('jwt.decode.error.notExist', { did, uid });
        return reject(new Error('Invalid jwt token: invalid uid'));
      }
      if (user.did !== did) {
        debug('jwt.decode.error.notMatch', { did, uid });
        return reject(new Error('Invalid jwt token: invalid did and uid pair'));
      }

      debug('jwt.decode.success', { did, uid });
      return resolve(user.toJSON());
    });
  });
}

module.exports = {
  login,
  decode,
};
