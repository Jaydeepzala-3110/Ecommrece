/**
 * The code you have selected is a function
 * that takes another function as an argument
 * and returns a new function.
 *  This new function takes three arguments: req, res, and next.
 *  The code then creates a Promise that resolves to
 *  the result of calling the original function (theFunc) with
 *  the req, res, and next arguments. If the original function
 *  throws an error, the catch block handles it by calling next
 *  with the error.
 */
module.exports = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch((error) => {
    next(error);
  });
};
