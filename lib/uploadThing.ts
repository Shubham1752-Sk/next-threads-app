import { generateReactHelpers } from "@uploadthing/react/hooks"
import { OurFileRouter } from "@/app/api/uploadThing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();