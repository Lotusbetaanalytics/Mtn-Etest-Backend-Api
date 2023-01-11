class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ErrorResponseJSON {
  constructor(res, message, statusCode = 404) {
    return res.status(statusCode).json({
      success: false,
      message: message
    })
  }
}

class SuccessResponseJSON {
  constructor(res, data = {}, statusCode = 200, message) {
    const payload = {
      success: true,
      count: data.length,
      data: data,
    };
    if (!Array.isArray(data)) payload.count = undefined
    if (message) payload.message = message;
    return res.status(statusCode).json(payload);
  }
}

module.exports = {ErrorResponse, ErrorResponseJSON, SuccessResponseJSON};
