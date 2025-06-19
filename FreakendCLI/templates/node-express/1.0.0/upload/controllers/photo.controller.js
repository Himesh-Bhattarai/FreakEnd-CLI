const httpStatus = require('http-status');
const { photoService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { photoUpload } = require('../middlewares/upload/photoUpload');

const uploadPhoto = catchAsync(async (req, res) => {
  photoUpload.upload(req, res, async (err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
    
    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No photo uploaded');
    }
    
    const photo = await photoService.createPhoto(req.file, req.user, req.body);
    res.status(httpStatus.CREATED).send(photo);
  });
});

module.exports = {
  uploadPhoto
};