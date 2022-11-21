import { Injectable } from '@nestjs/common';
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

  async uploadABI(files: Express.Multer.File): Promise<string> {
    const url = URL.createObjectURL(files[0]);
    let bucket = this.storage.bucket('gs://sytx-ce64a.appspot.com/');
    let response = await bucket.upload(url);
    return response[0].baseUrl;
  }
}
