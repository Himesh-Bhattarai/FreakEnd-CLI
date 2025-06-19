const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const documentSchema = mongoose.Schema(
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
    file: {
      path: String,
      size: Number,
      mimetype: String,
      originalName: String
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    },
    metadata: {
      pageCount: Number,
      excerpt: String,
      keywords: [String]
    }
  },
  {
    timestamps: true
  }
);

documentSchema.plugin(toJSON);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;