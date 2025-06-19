const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const photoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    files: {
      original: {
        path: String,
        size: Number,
        mimetype: String,
        width: Number,
        height: Number
      },
      medium: {
        path: String,
        size: Number,
        width: Number,
        height: Number
      },
      thumbnail: {
        path: String,
        size: Number,
        width: Number,
        height: Number
      }
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    },
    metadata: {
      camera: String,
      location: String,
      tags: [String]
    }
  },
  {
    timestamps: true
  }
);

photoSchema.plugin(toJSON);

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;