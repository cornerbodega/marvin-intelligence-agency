import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import Jimp from "jimp";

const storage = new Storage({
  keyFilename:
    "./api/reports/save-report/upload-image-to-gcs/missions-server-f90599a2c379.json",
});
const bucketName = "intelligence-images";
const bucket = storage.bucket(bucketName);

export default async function handler(req, res) {
  console.log("upload-image-to-gcs.js");
  console.log("req.body:", req.body);
  const {
    imageUrl,
    draftTitle,
    folderImageResponse,
    agentName,
    imageDescriptionResponseContent,
  } = req.body;
  let baseFileName = slugify({
    text: draftTitle || folderImageResponse || agentName,
  });

  if (imageDescriptionResponseContent && draftTitle) {
    baseFileName = slugify({
      text: `${draftTitle}-${imageDescriptionResponseContent}`,
    });
  }
  if (agentName) {
    baseFileName = slugify({
      text: `${agentName}-${Math.floor(Math.random() * 100)}`,
    });
  }

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const image = await Jimp.read(buffer);
  const originalFileName = `${baseFileName}-original.png`;
  const smallFileName = `${baseFileName}-small.png`;
  const mediumFileName = `${baseFileName}-medium.png`;

  // Save original image
  await saveImageToGCS({ baseFileName, fileName: originalFileName, buffer });

  // Resize and save smaller versions
  await saveResizedImageToGCS({
    baseFileName,
    fileName: smallFileName,
    image,
    height: 342,
  });
  await saveResizedImageToGCS({
    baseFileName,
    fileName: mediumFileName,
    image,
    height: 547,
  });

  const picUrls = {
    originalPicUrl: constructGCSUrl({
      fileName: originalFileName,
      baseFileName,
    }),
    smallPicUrl: constructGCSUrl({ fileName: smallFileName, baseFileName }),
    mediumPicUrl: constructGCSUrl({ fileName: mediumFileName, baseFileName }),
  };

  const taskResponse = {};
  if (draftTitle) {
    taskResponse.reportPicUrl = picUrls.mediumPicUrl;
  }
  if (folderImageResponse) {
    taskResponse.folderPicUrl = picUrls.mediumPicUrl;
  }
  if (agentName) {
    taskResponse.profilePicUrl = picUrls.mediumPicUrl;
  }

  return taskResponse;
}

function slugify({ text }) {
  let slug = text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  if (slug.length > 300) {
    // Truncate and ensure the file name is within the 1024 character limit
    slug = slug.substring(0, 300);
  }
  return slug;
}

function constructGCSUrl({ fileName, baseFileName }) {
  return `https://storage.googleapis.com/${bucketName}/${baseFileName}/${fileName}`;
}
async function saveImageToGCS({ baseFileName, fileName, buffer }) {
  try {
    if (!buffer) {
      throw new Error("Buffer is undefined.");
    }

    const file = bucket.file(`${baseFileName}/${fileName}`);
    await file.save(buffer);
  } catch (error) {
    console.error("Error in saveImageToGCS:", error);
    throw error;
  }
}

async function saveResizedImageToGCS({
  baseFileName,
  fileName,
  image,
  height,
}) {
  try {
    const resizedBuffer = await image
      .clone()
      .resize(Jimp.AUTO, height)
      .getBufferAsync(Jimp.MIME_PNG);

    if (!resizedBuffer) {
      throw new Error("Failed to resize image and generate buffer.");
    }

    await saveImageToGCS({ baseFileName, fileName, buffer: resizedBuffer });
  } catch (error) {
    console.error("Error in saveResizedImageToGCS:", error);
    throw error;
  }
}
