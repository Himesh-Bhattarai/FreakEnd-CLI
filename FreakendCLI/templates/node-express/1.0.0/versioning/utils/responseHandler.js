const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      version: res.get('X-API-Version') || 'unknown'
    };
  
    res.status(statusCode).json(response);
  };
  
  const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
      version: res.get('X-API-Version') || 'unknown'
    };
  
    res.status(statusCode).json(response);
  };
  
  const sendPaginated = (res, data, pagination, message = 'Success') => {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
      version: res.get('X-API-Version') || 'unknown'
    };
  
    res.status(200).json(response);
  };
  
  module.exports = {
    sendSuccess,
    sendError,
    sendPaginated
  };