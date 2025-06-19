const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { photoValidation } = require('../../validations');
const { photoController } = require('../../controllers');

const router = express.Router();

router.post(
  '/',
  auth(),
  photoController.uploadPhoto,
  validate(photoValidation.uploadPhoto)
);

module.exports = router;