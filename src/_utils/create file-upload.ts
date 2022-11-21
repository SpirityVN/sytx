import { Request } from 'express';

export const jsonFileFilter = (req: Request, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(/\.(json)$/)) {
    return callback(new Error('Only json file are allowed!'), false);
  }
  callback(null, true);
};
