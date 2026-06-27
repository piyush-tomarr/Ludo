class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const badRequest = (message) => new HttpError(400, message);
const notFound = (message) => new HttpError(404, message);
const unauthorized = (message) => new HttpError(401, message);

module.exports = {
  HttpError,
  badRequest,
  notFound,
  unauthorized
};
