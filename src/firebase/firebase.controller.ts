import { UploadABIResponse } from './firebase.dto';
import { FirebaseService } from './firebase.service';
import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FastifyFileInterceptor } from 'src/interceptors/fastify-file-interceptor';
import { jsonFileFilter } from 'src/_utils/create file-upload';
@ApiTags('Firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @Post('/upload-abi')
  @UseInterceptors(FastifyFileInterceptor('abiFile', { fileFilter: jsonFileFilter }))
  async uploadABIFile(@UploadedFile() file: Express.Multer.File): Promise<UploadABIResponse> {
    return await this.firebaseService.uploadABI(file);
  }
}
