class ApiError extends Error {
  constructor(
    statusCode,
    message = "Somethng Went Wrong",
    errors = [],
    statck = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (statck) {
      this.stack = statck;
    } else {
      Error.captureStackTrace(this, this.cconstructor);
    }
  }
}

export {ApiError}