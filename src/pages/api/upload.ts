import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import prisma from '../../lib/prisma';

// Configure formidable to parse files
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Parse the form data
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const type = fields.type?.[0] || '';
    const propertyId = fields.propertyId?.[0];
    const projectId = fields.projectId?.[0];
    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

    // Process each uploaded file
    const savedFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        if (!file) return null;

        const fileName = file.originalFilename || 'unnamed-file';
        const fileUrl = `/uploads/${path.basename(file.filepath)}`;

        // Save file metadata to database based on type
        if (type === 'photo' && propertyId) {
          return await prisma.photo.create({
            data: {
              url: fileUrl,
              property: { connect: { id: propertyId } },
              uploadedAt: new Date(),
              uploadedBy: 'system', // Replace with actual user when auth is implemented
            },
          });
        } else if (type === 'document') {
          const data = {
            name: fileName,
            url: fileUrl,
            type: path.extname(fileName).slice(1),
            uploadedAt: new Date(),
            uploadedBy: 'system', // Replace with actual user when auth is implemented
          };

          if (propertyId) {
            return await prisma.document.create({
              data: {
                ...data,
                property: { connect: { id: propertyId } },
              },
            });
          } else if (projectId) {
            return await prisma.document.create({
              data: {
                ...data,
                project: { connect: { id: projectId } },
              },
            });
          }
        }

        return null;
      })
    );

    // Filter out null values and return the results
    const results = savedFiles.filter(Boolean);
    res.status(200).json({ success: true, files: results });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
} 