const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { documentValidation } = require('../../validations');
const { documentController } = require('../../controllers');

const router = express.Router();

router.post(
  '/',
  auth(),
  documentController.uploadDocument,
  validate(documentValidation.uploadDocument)
);

module.exports = router;