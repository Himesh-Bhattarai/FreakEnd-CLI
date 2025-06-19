const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { videoValidation } = require('../../validations');
const { videoController } = require('../../controllers');
const { videoUpload } = require('../../middlewares/videoUpload');

const router = express.Router();

router.post(
  '/',
  auth(),
  videoUpload.streamUpload,
  validate(videoValidation.uploadVideo),
  videoController.uploadVideo
);

router.get(
  '/:videoId',
  auth(),
  validate(videoValidation.getVideo),
  videoController.getVideo
);

router.get(
  '/stream/:videoId',
  auth(),
  validate(videoValidation.getVideo),
  videoController.streamVideo
);

module.exports = router;