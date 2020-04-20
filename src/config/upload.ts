import crypto from 'crypto';
import multer from 'multer';
import path from 'path';

export const uploadDirectory = path.resolve(__dirname, '..', '..', 'tmp');
export default {
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename(req, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};
