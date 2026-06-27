// Keeps controllers focused on request logic while Express receives async errors.
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
