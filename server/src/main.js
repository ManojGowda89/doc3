import { Router } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const router = Router();

// Configure S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.AWS_BUCKET_NAME;

// Allowed mimetypes for each category
const allowedTypes = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
  ],
  videos: [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/quicktime',
  ],
  audio: [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/mp4',
    'audio/webm',
    'audio/aac',
  ],
documents: [
  // Office / documents
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'application/rtf',
  'text/csv',

  // Archives / compressed
  'application/zip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-tar',
  'application/x-bzip2',
  'application/x-xz',

  // Executables / installers
  'application/x-msdownload', // .exe
  'application/x-msi', // .msi
  'application/vnd.android.package-archive', // .apk
  'application/x-sh', // shell scripts
  'application/javascript',
  'application/x-dosexec', // generic DOS/Windows binaries

  // Images (if allowed as docs)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',

  // Audio / video (if allowed as docs)
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/mp4',
  'audio/webm',
  'audio/aac',
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm',
  'video/quicktime',

  // Programming / script files
  'application/json',
  'application/xml',
  'application/javascript',
  'application/x-python-code', // .pyc / .py
  'application/x-ruby', // .rb
  'application/x-perl', // .pl
  'text/html',
  'text/css',
  'text/javascript',

  // Generic binary
  'application/octet-stream',
  'application/x-binary',

  // Other common formats
  'application/epub+zip', // epub ebooks
  'application/x-font-ttf', // fonts
  'application/font-woff',
  'application/vnd.oasis.opendocument.text', // odt
  'application/vnd.oasis.opendocument.spreadsheet', // ods
  'application/vnd.oasis.opendocument.presentation', // odp
  'application/x-ms-shortcut', // .lnk
]

};

// Helper to sanitize filenames
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9._-]/gi, '_');
}

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Media API using S3' });
});

// Upload (Create)
router.post('/upload', async (req, res) => {
  try {
    let { type, name, base64, mimetype } = req.body;

    if (!type || !name || !base64 || !mimetype) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    type = type.toLowerCase();
    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    if (!allowedTypes[type].includes(mimetype)) {
      return res.status(400).json({ message: `Invalid mimetype for type ${type}` });
    }

    const finalName = sanitizeFilename(name);
    const key = `${type}/${finalName}`;
    const fileBuffer = Buffer.from(base64, 'base64');

    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    }));

    res.json({
      message: 'File uploaded successfully',
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all files by type/category
router.get('/all/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const command = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `${type}/` });
    const data = await s3.send(command);
    const files = (data.Contents || []).map(file => ({
      name: file.Key.split('/').pop(),
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
    }));

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch single file by type and filename
router.get('/:type/:filename', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const filename = req.params.filename;

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const key = `${type}/${filename}`;
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1-hour signed URL

    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete single file by type and filename
router.delete('/:type/:filename', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const filename = req.params.filename;

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const key = `${type}/${filename}`;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all files by type/category
router.delete('/all/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `${type}/` });
    const data = await s3.send(listCommand);

    if (!data.Contents || data.Contents.length === 0) {
      return res.json({ message: 'No files found for this type' });
    }

    await Promise.all(
      data.Contents.map(file => s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: file.Key })))
    );

    res.json({ message: `Deleted ${data.Contents.length} files` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
