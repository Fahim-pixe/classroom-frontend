import { Trash, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS, BACKEND_BASE_URL, STORAGE_CLIENT_CONFIG } from "@/constants";
import { uploadFileToSignedUrl } from "@/lib/storage-upload";
import type { UploadWidgetValue } from "@/types";
import { Button } from "./ui/button";

type ClassBannerUploaderProps = {
  value?: UploadWidgetValue | null;
  classId?: number;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
};

type UploadIntentResponse = {
  data?: {
    uploadIntentId: string;
    signedUploadUrl: string;
    requiredHeaders: Record<string, string>;
  };
  error?: string;
};

type ConfirmedAssetResponse = { data?: { id: string }; error?: string };

const bannerPolicy = STORAGE_CLIENT_CONFIG.classBannerUpload;

export function ClassBannerUploader({ value = null, classId, onChange, disabled = false }: ClassBannerUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => setPreview(value), [value]);
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const releasePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const uploadBanner = async (file: File | undefined) => {
    if (!file || disabled || isUploading) return;
    setErrorMessage("");
    if (!bannerPolicy.allowedMimeTypes.includes(file.type as never)) {
      setErrorMessage("Choose a JPEG, PNG, or WebP banner image.");
      return;
    }
    if (file.size > bannerPolicy.maximumBytes) {
      setErrorMessage("This banner image exceeds the configured size limit.");
      return;
    }

    setIsUploading(true);
    let uploadIntentId: string | null = null;
    try {
      const intentResponse = await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.UPLOAD_INTENTS}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assetKind: STORAGE_CLIENT_CONFIG.assetKinds.classBanner,
          classId,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        }),
      });
      const intentPayload = await intentResponse.json() as UploadIntentResponse;
      if (!intentResponse.ok || !intentPayload.data) throw new Error(intentPayload.error || "Banner upload could not be authorized");
      uploadIntentId = intentPayload.data.uploadIntentId;

      await uploadFileToSignedUrl({
        signedUploadUrl: intentPayload.data.signedUploadUrl,
        requiredHeaders: intentPayload.data.requiredHeaders,
        file,
        onProgress: setUploadProgress,
      });

      const confirmationResponse = await fetch(
        `${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CONFIRM_UPLOAD_INTENT(uploadIntentId)}`,
        { method: "POST", credentials: "include" },
      );
      const confirmationPayload = await confirmationResponse.json() as ConfirmedAssetResponse;
      if (!confirmationResponse.ok || !confirmationPayload.data?.id) {
        throw new Error(confirmationPayload.error || "Uploaded banner could not be verified");
      }

      releasePreview();
      const localPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = localPreviewUrl;
      const nextValue = { url: localPreviewUrl, assetId: confirmationPayload.data.id };
      setPreview(nextValue);
      onChange?.(nextValue);
    } catch (error) {
      if (uploadIntentId) {
        await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CANCEL_UPLOAD_INTENT(uploadIntentId)}`, {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
      }
      setErrorMessage(error instanceof Error ? error.message : "Banner upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeBanner = () => {
    if (disabled || isUploading) return;
    releasePreview();
    setPreview(null);
    setErrorMessage("");
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={bannerPolicy.allowedMimeTypes.join(",")} className="sr-only" tabIndex={-1} onChange={(event) => void uploadBanner(event.target.files?.[0])} />
      {preview ? (
        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
          <img src={preview.url} alt="Selected class banner" className="h-full w-full object-cover" />
          <Button type="button" size="icon" variant="destructive" onClick={removeBanner} disabled={disabled || isUploading} className="absolute right-3 top-2 z-10 shadow-md" aria-label="Remove class banner">
            <Trash className="size-4" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()} className="min-h-40 w-full border-2 border-dashed bg-muted/20 hover:bg-muted/50">
          <span className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <UploadCloud className="size-10 text-primary" />
            <span>
              <span className="block text-sm font-bold text-foreground">{isUploading ? `Uploading securely (${uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent}%)` : "Choose a class banner"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">JPEG, PNG, or WebP within the configured size limit</span>
            </span>
          </span>
        </Button>
      )}
      {isUploading && <progress className="w-full" value={uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent} max={STORAGE_CLIENT_CONFIG.delivery.uploadProgressMaximumPercent} aria-label="Class banner upload progress" />}
      {errorMessage && <p className="text-sm text-destructive" role="alert">{errorMessage}</p>}
    </div>
  );
}
