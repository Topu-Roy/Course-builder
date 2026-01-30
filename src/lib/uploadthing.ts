import type { UploadthingRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton<UploadthingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadthingRouter>();
