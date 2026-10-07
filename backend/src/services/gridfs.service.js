const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

class GridFSService {
  constructor() {
    this.bucket = null;
  }

  getBucket() {
    if (!this.bucket) {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established for GridFS');
      }
      this.bucket = new GridFSBucket(db, { bucketName: 'resumes' });
    }
    return this.bucket;
  }

  async uploadFile(filename, buffer, mimetype) {
    const bucket = this.getBucket();
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimetype,
      });

      uploadStream.on('error', (err) => reject(err));
      uploadStream.on('finish', () => resolve(uploadStream.id));

      uploadStream.write(buffer);
      uploadStream.end();
    });
  }

  async downloadFile(fileId) {
    const bucket = this.getBucket();
    return new Promise((resolve, reject) => {
      const chunks = [];
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', (err) => reject(err));
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async deleteFile(fileId) {
    const bucket = this.getBucket();
    try {
      await bucket.delete(new mongoose.Types.ObjectId(fileId));
    } catch (e) {
      console.warn('GridFS delete error:', e.message);
    }
  }
}

module.exports = new GridFSService();
