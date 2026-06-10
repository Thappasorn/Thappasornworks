import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Upload a base64 data URI or remote URL to Cloudinary (server-side). */
export async function uploadMedia(
  dataUri: string,
  folder = "thappasorn-works",
  resourceType: "image" | "video" | "auto" = "auto"
) {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return res.secure_url;
}

export { cloudinary };
