import { Trash, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS, BACKEND_BASE_URL, STORAGE_CLIENT_CONFIG } from "@/constants";
import { uploadFileToSignedUrl } from "@/lib/storage-upload";
import type { UploadWidgetValue } from "@/types";
import { Button } from "./ui/button";

type ProfileImageUploaderProps = {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
};

type UploadIntentPayload = {
  data?: {
    uploadIntentId: string;
    signedUploadUrl: string;
    requiredHeaders: Record<string, string>;
  };
  error?: string;
};

type ConfirmedAssetPayload = {
  data?: { id: string };
  error?: string;
};

const avatarPolicy = STORAGE_CLIENT_CONFIG.avatarUpload;

export function ProfileImageUploader({ value = null, onChange, disabled = false }: ProfileImageUploaderProps) {
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

  const releaseLocalPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file || disabled || isUploading) return;
    setErrorMessage("");
    if (!avatarPolicy.allowedMimeTypes.includes(file.type as never)) {
      setErrorMessage("Choose a JPEG, PNG, or WebP profile picture.");
      return;
    }
    if (file.size > avatarPolicy.maximumBytes) {
      setErrorMessage("This profile picture exceeds the configured size limit.");
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
          assetKind: STORAGE_CLIENT_CONFIG.assetKinds.avatar,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        }),
      });
      const intentPayload = await intentResponse.json() as UploadIntentPayload;
      if (!intentResponse.ok || !intentPayload.data) throw new Error(intentPayload.error || "Profile-picture upload could not be authorized");
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
      const confirmationPayload = await confirmationResponse.json() as ConfirmedAssetPayload;
      if (!confirmationResponse.ok || !confirmationPayload.data?.id) {
        throw new Error(confirmationPayload.error || "Uploaded profile picture could not be verified");
      }

      releaseLocalPreview();
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
      setErrorMessage(error instanceof Error ? error.message : "Profile-picture upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = () => {
    if (disabled || isUploading) return;
    releaseLocalPreview();
    setPreview(null);
    setErrorMessage("");
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={avatarPolicy.allowedMimeTypes.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void uploadImage(event.target.files?.[0])}
      />
      {preview ? (
        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
          <img src={preview.url} alt="Selected profile picture" className="h-full w-full object-cover" />
          <Button type="button" size="icon" variant="destructive" onClick={removeImage} disabled={disabled || isUploading} className="absolute right-3 top-2 z-10 shadow-md" aria-label="Remove profile picture">
            <Trash className="size-4" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()} className="min-h-40 w-full border-2 border-dashed bg-muted/20 hover:bg-muted/50">
          <span className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <UploadCloud className="size-10 text-primary" />
            <span>
              <span className="block text-sm font-bold text-foreground">{isUploading ? `Uploading securely (${uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent}%)` : "Choose a profile picture"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">JPEG, PNG, or WebP within the configured size limit</span>
            </span>
          </span>
        </Button>
      )}
      {isUploading && <progress className="w-full" value={uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent} max={STORAGE_CLIENT_CONFIG.delivery.uploadProgressMaximumPercent} aria-label="Profile picture upload progress" />}
      {errorMessage && <p className="text-sm text-destructive" role="alert">{errorMessage}</p>}
    </div>
  );
}
