const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  });

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports = User;