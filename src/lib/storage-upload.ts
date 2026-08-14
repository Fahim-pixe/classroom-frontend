import { STORAGE_CLIENT_CONFIG } from "@/constants";

type SignedUploadRequest = {
  signedUploadUrl: string;
  requiredHeaders: Record<string, string>;
  file: File;
  onProgress?: (percent: number) => void;
};

const { uploadProgressMinimumPercent, uploadProgressMaximumPercent } = STORAGE_CLIENT_CONFIG.delivery;

const normalizeUploadProgress = (loaded: number, total: number) => {
  if (!total) return uploadProgressMinimumPercent;
  const calculatedPercent = Math.round((loaded / total) * uploadProgressMaximumPercent);
  return Math.min(uploadProgressMaximumPercent, Math.max(uploadProgressMinimumPercent, calculatedPercent));
};

export const uploadFileToSignedUrl = ({
  signedUploadUrl,
  requiredHeaders,
  file,
  onProgress,
}: SignedUploadRequest) => new Promise<void>((resolve, reject) => {
  const request = new XMLHttpRequest();

  request.open("PUT", signedUploadUrl);
  Object.entries(requiredHeaders).forEach(([headerName, headerValue]) => {
    request.setRequestHeader(headerName, headerValue);
  });

  request.upload.onprogress = (event) => {
    if (event.lengthComputable) onProgress?.(normalizeUploadProgress(event.loaded, event.total));
  };
  request.onerror = () => reject(new Error("The secure file transfer could not be completed"));
  request.onabort = () => reject(new Error("The secure file transfer was cancelled"));
  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      onProgress?.(uploadProgressMaximumPercent);
      resolve();
      return;
    }
    reject(new Error("The secure file transfer was rejected"));
  };

  onProgress?.(uploadProgressMinimumPercent);
  request.send(file);
});
