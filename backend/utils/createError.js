export function createError(message, httpStatus, code) {
  const error = new Error(message);
  error.isCustom = true;
  error.httpStatus = httpStatus;
  error.code = code;
  return error;
}
