/**
 * models/User.js – Practical 7: User Schema & Model with hashed password
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
    },
    name: {
      type: String,
      default: 'Deep Patel',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password; // Never expose hashed password in JSON responses
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
