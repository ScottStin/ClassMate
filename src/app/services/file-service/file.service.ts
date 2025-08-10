/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { SnackbarService } from '../snackbar-service/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  acceptedImageTypes = 'image/png, image/gif, image/tiff, image/jpeg';
  acceptedAudioTypes = 'audio/mpeg, audio/wav, audio/ogg';
  acceptedDocTypes =
    'image/png, image/jpeg, image/gif, image/tiff, application/pdf, application/msword';

  primaryImageAspectRation = 4 / 3;
  secondaryImageAspectRation = 6 / 2;
  resizeWidth: 128;
  resizeWidthLarge: 215;

  constructor(private readonly snackbarService: SnackbarService) {}

  validateFile(
    file: File,
    fileType: 'image' | 'audio' | 'doc',
    maxSize: number
  ): boolean {
    let acceptedTypes: string[] = [];

    if (fileType === 'image') {
      acceptedTypes = this.acceptedImageTypes
        .split(',')
        .map((type) => type.trim());
    }

    if (fileType === 'audio') {
      acceptedTypes = this.acceptedAudioTypes
        .split(',')
        .map((type) => type.trim());
    }

    if (fileType === 'doc') {
      acceptedTypes = this.acceptedDocTypes
        .split(',')
        .map((type) => type.trim());
    }

    if (!acceptedTypes.includes(file.type)) {
      this.snackbarService.queueBar(
        'error',
        `Picture must be ${acceptedTypes.join(', ')} type.`
      );
      return false;
    }

    if (file.size > maxSize) {
      this.snackbarService.queueBar(
        'error',
        `File must be 1-${maxSize} kb in size.`
      );
      return false;
    }

    return true;
  }

  async convertToBase64(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (): void => {
        resolve(reader.result as string);
      };

      reader.onerror = (): void => {
        reject(new Error('Failed to read file.'));
      };

      reader.readAsDataURL(file);
    });
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (): void => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  imageLoaded(): void {}

  cropperReady(): void {}

  loadImageFailed(): void {
    this.snackbarService.queueBar('error', 'image failed to load.');
  }

  // todo - move fileChangeEvent and imageCropped functions to this service.
}

export interface ImageCroppingType {
  imageChangedEvent: Event | string;
  imageCropper: ImageCropperComponent;
  photoLink?: string;
  photoName: string;
}

export class ImageType {
  url: string;
  filename: string;
}
