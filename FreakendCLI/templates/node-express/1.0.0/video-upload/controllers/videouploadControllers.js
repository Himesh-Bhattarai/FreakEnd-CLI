const httpStatus = require('http-status');
const { videoService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const uploadVideo = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No video file uploaded');
  }
  
  const video = await videoService.processVideo(
    req.file,
    req.user.id,
    req.body
  );
  
  res.status(httpStatus.CREATED).send(video);
});

const getVideo = catchAsync(async (req, res) => {
  const video = await videoService.getVideoById(req.params.videoId);
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  res.send(video);
});

const streamVideo = catchAsync(async (req, res) => {
  const range = req.headers.range;
  if (!range) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Range header required');
  }
  
  const video = await videoService.getVideoById(req.params.videoId);
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  
  const videoPath = video.file.path;
  const videoSize = fs.statSync(videoPath).size;
  
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': video.file.mimetype
  };
  
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers);
  
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

module.exports = {
  uploadVideo,
  getVideo,
  streamVideo
};