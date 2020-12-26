module.exports = {
  getRawPhone: phone => phone.replace(/[((|))+-\s]/g, '')
};
