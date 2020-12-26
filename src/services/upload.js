const multer = require('multer');
const uuid = require('uuid');

const { images } = require('../constants');

module.exports = (request, response, folder, fields) => {
  let imageFields;

  if (fields instanceof Array) imageFields = fields.map(field => ({ name: field, maxCount: 1 }));
  else imageFields = [{ name: fields, maxCount: 1 }];
  const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, folder);
    },
    filename(req, file, callback) {
      let extension = file.originalname.split('.');
      extension = extension[extension.length - 1];
      const filename = `${uuid()}.${extension}`;
      req.body[file.fieldname] = filename;
      callback(null, filename);
    }
  });

  const upload = multer({
    fileFilter(req, file, cb) {
      let extension = file.originalname.split('.');
      extension = extension[extension.length - 1];
      if (images.allowedExtensions.indexOf(extension) == -1) {
        return cb(new Error('The extension of the file does not allowed'));
      }
      cb(null, true);
    },

    storage: Storage
  }).fields(imageFields);

  return new Promise((resolve, reject) => {
    upload(request, response, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
