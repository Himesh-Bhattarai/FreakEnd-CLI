const httpStatus = require('http-status');
const { documentService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { documentUpload } = require('../middlewares/upload/documentUpload');

const uploadDocument = catchAsync(async (req, res) => {
  documentUpload.upload(req, res, async (err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
    
    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No document uploaded');
    }
    
    const document = await documentService.createDocument(req.file, req.user, req.body);
    res.status(httpStatus.CREATED).send(document);
  });
});

module.exports = {
  uploadDocument
};