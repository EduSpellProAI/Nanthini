import { getFirebaseStorage } from '@eduspell/firebase';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export interface UploadResult {
  path: string;
  downloadUrl: string;
}

export class StorageService {
  private getStorageClient() {
    return getFirebaseStorage();
  }

  async upload(path: string, file: Blob | Uint8Array | ArrayBuffer): Promise<UploadResult> {
    const storageRef = ref(this.getStorageClient(), path);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    return {
      path,
      downloadUrl,
    };
  }

  async getFileUrl(path: string): Promise<string> {
    return getDownloadURL(ref(this.getStorageClient(), path));
  }

  async remove(path: string): Promise<void> {
    await deleteObject(ref(this.getStorageClient(), path));
  }
}

export const storageService = new StorageService();
