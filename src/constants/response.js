const constants = {
  OK: 0,
  DATA_ERROR: 1,
  TOKEN_INVALID: 2,
  INTERNAL_ERROR: -1,
  NOT_FOUND: 3,
  CONFLICT: 4
};

module.exports = {
  OK: () => ({ status: constants.OK, message: 'OK' }),
  DATA_ERROR: () => ({ status: constants.DATA_ERROR, message: 'Input data is invalid' }),
  TOKEN_INVALID: () => ({
    status: constants.TOKEN_INVALID,
    message: 'Token is invalid. Need authorization'
  }),
  INTERNAL_ERROR: () => ({
    status: constants.INTERNAL_ERROR,
    message: 'Internal error'
  }),
  NOT_FOUND: () => ({
    status: constants.NOT_FOUND,
    message: 'Not found'
  }),
  CONFLICT: () => ({
    status: constants.CONFLICT,
    message: 'Conflict'
  })
};
