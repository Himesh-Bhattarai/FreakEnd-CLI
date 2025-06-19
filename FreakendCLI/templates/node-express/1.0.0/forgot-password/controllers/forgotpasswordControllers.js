const forgotPassword = catchAsync(async (req, res) => {
    await tokenService.generatePasswordResetToken(req.body.email);
    res.status(httpStatus.NO_CONTENT).send();
  });
  
  const resetPassword = catchAsync(async (req, res) => {
    await tokenService.resetPassword(req.body.token, req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
  });
  
  module.exports = {
    // ... existing exports
    forgotPassword,
    resetPassword
  };