/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bucket, File, Storage } from '@google-cloud/storage';
import { Buffer } from 'buffer';

import { vaultUtils } from './vault.js';

import 'dotenv/config';

const IS_DEV: boolean = process.env.IS_DEV === 'true';

const BUCKET_NAME: string = IS_DEV ? 'df-landing-zone-dev' : 'df-landing-zone';

class StorageUtil {
  private bucketName: string;
  private gcsClient: null | Storage;

  constructor() {
    this.bucketName = BUCKET_NAME;
    this.gcsClient = null;
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} filepath - Path to the file in the bucket
   * @returns {Promise<boolean>} - True if deletion was successful, false otherwise
   */
  async deleteData(filepath: string): Promise<boolean> {
    try {
      const gcsClient: Storage = await this._initGcsClient();
      const bucket: Bucket = gcsClient.bucket(this.bucketName);
      const file: File = bucket.file(filepath);

      const [exists] = await file.exists();
      if (!exists) {
        console.warn(`File not found: ${filepath}`);
        return false;
      }

      await file.delete();
      console.info(`Successfully deleted: ${filepath}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting file ${filepath}: ${error.message}`);
      return false;
    }
  }

  /**
   * List blobs in the bucket with optional prefix
   * @param {string} prefix - Optional prefix to filter blobs
   * @returns {Promise<Array>} - List of blob info objects
   */
  async listBlobs(prefix: string = ''): Promise<any[]> {
    const gcsClient: Storage = await this._initGcsClient();
    const bucket: Bucket = gcsClient.bucket(this.bucketName);

    const [files] = await bucket.getFiles({ prefix });

    return files.map((file: File) => ({
      contentType: file.metadata.contentType,
      name: file.name,
      size: `${(((file.metadata.size as number) || 0) / 1024).toFixed(2)} KB`,
      updated: file.metadata.updated,
    }));
  }

  /**
   * Read data from Google Cloud Storage
   * @param {string} filepath - Path in bucket where the file is stored
   * @returns {Promise<Buffer>} - Raw Buffer content
   */
  async readData(filepath: string): Promise<Buffer> {
    const gcsClient: Storage = await this._initGcsClient();
    const bucket: Bucket = gcsClient.bucket(this.bucketName);
    const file: File = bucket.file(filepath);

    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${filepath}`);
    }

    const [contents] = await file.download();
    return contents; // Always return raw Buffer
  }

  /**
   * Store data in Google Cloud Storage
   * @param {Object|Array|Buffer|string} data - Data to store (object, array, Buffer, or string)
   * @param {string} filepath - Path in bucket where to store the file
   * @param {string} contentType - Content type of the file (default: application/json)
   * @returns {string} - GCS URI of the stored file
   */
  async storeData(
    data: any[] | Buffer | object | string,
    filepath: string,
    contentType: string = 'application/parquet',
  ): Promise<string> {
    const gcsClient: Storage = await this._initGcsClient();
    const bucket: Bucket = gcsClient.bucket(this.bucketName);
    const file: File = bucket.file(filepath);

    let uploadData: Buffer | string;
    const options = { contentType };

    if (Buffer.isBuffer(data)) {
      uploadData = data;
    } else if (typeof data === 'string') {
      uploadData = data;
    } else if (Array.isArray(data) || typeof data === 'object') {
      uploadData = JSON.stringify(data);
    } else {
      throw new Error('Unsupported data type for storage');
    }

    await file.save(uploadData, options);

    return `gs://${this.bucketName}/${filepath}`;
  }

  private async _initGcsClient(): Promise<Storage> {
    if (this.gcsClient) {
      return this.gcsClient;
    }

    const gcpCredsBase64 = await vaultUtils.getSecretValue(
      'GCP_SERVICE_ACCOUNT',
    );

    let credsJson: object;
    try {
      const decoded = Buffer.from(gcpCredsBase64, 'base64').toString('utf-8');
      credsJson = JSON.parse(decoded);
    } catch (error) {
      // If not base64, try parse directly
      credsJson = JSON.parse(gcpCredsBase64);
      throw error;
    }
    this.gcsClient = new Storage({ credentials: credsJson });
    return this.gcsClient;
  }
}

export default StorageUtil;
