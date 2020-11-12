import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const directoryPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: directoryPath,
  storage: multer.diskStorage({
    destination: directoryPath,
    filename(request, file, callback) {
      const filaHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${filaHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
