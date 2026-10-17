/**
 * models/Task.js – Practical 5: MongoDB Mongoose Schema & Model
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Requirements Implemented:
 *  - 4 Core Fields: title (String, required), description (String), completed (Boolean, default false), createdAt (Date, default Date.now)
 *  - Supplementary 1: priority restricted to enum ['low', 'medium', 'high'] with default 'medium'
 *  - Supplementary 2: pre-save hook that automatically trims whitespace from the title field
 *  - Virtuals / JSON Transform: maps _id to id and exposes status for UI & API consistency
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Validation failed: 'title' is required and cannot be empty."],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: "Validation failed: '{VALUE}' is not a valid priority. Must be 'low', 'medium', or 'high'.",
      },
      default: 'medium',
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  }
);

// Supplementary Problem 2: Pre-save hook that automatically trims whitespace from the title field
taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  if (typeof next === 'function') {
    next();
  }
});

// Virtual field for status ('Completed' / 'Pending') for seamless compatibility with UI
taskSchema.virtual('status').get(function () {
  return this.completed ? 'Completed' : 'Pending';
});

// Configure JSON and Object serialization to include virtuals and string 'id'
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

taskSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
