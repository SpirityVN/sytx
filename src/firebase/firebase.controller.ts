import { FirebaseService } from './firebase.service';
import { Controller, Get, Post, Req, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @ApiConsumes('multipart/form-data')
  @Post('/upload-abi')
  async uploadABIFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File): Promise<string | null> {
    console.log(file);
    // return await this.firebaseService.uploadABI(file);
    return;
  }
}
