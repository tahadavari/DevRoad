/**
 * آپلود فایل: با تنظیم AWS_* از S3 استفاده می‌کند، وگرنه در public/uploads ذخیره می‌شود.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type UploadSubdir = "chat" | "voice" | "image" | "video";

function getSubdir(type: "image" | "voice" | "video"): UploadSubdir {
  return type === "image" ? "image" : type === "voice" ? "voice" : "video";
}

/** آپلود به S3 (اگر env تنظیم شده باشد) */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string | null> {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
    return null;
  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({ region });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    const base = process.env.AWS_S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
    return `${base}/${key}`;
  } catch {
    return null;
  }
}

/** ذخیرهٔ محلی در public/uploads */
async function saveLocal(file: Buffer, key: string, subdir: UploadSubdir): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(UPLOAD_DIR, key);
  await writeFile(fullPath, file);
  return `${BASE_URL}/uploads/${key}`;
}

export async function saveUpload(
  file: File,
  type: "image" | "voice" | "video"
): Promise<{ url: string; key: string }> {
  const ext = path.extname(file.name) || (type === "voice" ? ".webm" : type === "image" ? ".jpg" : ".mp4");
  const subdir = getSubdir(type);
  const key = `${subdir}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  const s3Url = await uploadToS3(buffer, key, contentType);
  if (s3Url) return { url: s3Url, key };

  const url = await saveLocal(buffer, key, subdir);
  return { url, key };
}
