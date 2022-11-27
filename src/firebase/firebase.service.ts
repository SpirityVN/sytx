import { UploadABIResponse } from './firebase.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { ServiceAccount, storage } from 'firebase-admin';
import firebaseKey from '../_key/firebase.json';
@Injectable()
export class FirebaseService {
  private firebaseApp: firebase.app.App;
  private storage: storage.Storage;
  constructor() {
    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseKey as ServiceAccount),
    });
    this.storage = this.firebaseApp.storage();
  }

  async uploadABI(file: Express.Multer.File): Promise<UploadABIResponse> {
    try {
      let bucket = this.storage.bucket('gs://sytx-ce64a.appspot.com/');

      let random = (Math.random() + 1).toString(36).substring(7);

      let filename = `${file.originalname.split('.')[0]}_${random}.json`;
      let fileCloud = await bucket.file(filename);

      await fileCloud.save(file.buffer, {
        contentType: file.mimetype,
        public: true,
      });
      return {
        filename: filename,
        url: fileCloud.publicUrl(),
      };
    } catch (error) {
      throw new BadRequestException('Upload ABI failed.');
    }
  }
}
