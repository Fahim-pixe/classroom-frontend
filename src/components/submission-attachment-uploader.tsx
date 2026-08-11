import { useRef, useState } from "react";
import { FileUp, LoaderCircle, Trash2 } from "lucide-react";

import { API_ENDPOINTS, BACKEND_BASE_URL, STORAGE_CLIENT_CONFIG } from "@/constants";
import type { StorageUploadValue } from "@/types";
import { Button } from "./ui/button";

type SubmissionAttachmentUploaderProps = {
  assignmentId: string | number;
  classId: number;
  value?: StorageUploadValue | null;
  onChange?: (value: StorageUploadValue | null) => void;
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

type ConfirmedAssetResponse = {
  data?: { id: string };
  error?: string;
};

const attachmentPolicy = STORAGE_CLIENT_CONFIG.submissionAttachmentUpload;

export function SubmissionAttachmentUploader({
  assignmentId,
  classId,
  value = null,
  onChange,
  disabled = false,
}: SubmissionAttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadAttachment = async (file: File | undefined) => {
    if (!file || disabled || isUploading) return;
    setErrorMessage("");

    if (!attachmentPolicy.allowedMimeTypes.includes(file.type as never)) {
      setErrorMessage("Choose a supported document or image file.");
      return;
    }
    if (file.size > attachmentPolicy.maximumBytes) {
      setErrorMessage("This attachment exceeds the configured size limit.");
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
          assetKind: STORAGE_CLIENT_CONFIG.assetKinds.submissionAttachment,
          classId,
          entityId: String(assignmentId),
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        }),
      });
      const intentPayload = await intentResponse.json() as UploadIntentResponse;
      if (!intentResponse.ok || !intentPayload.data) {
        throw new Error(intentPayload.error || "Attachment upload could not be authorized");
      }
      uploadIntentId = intentPayload.data.uploadIntentId;

      const objectResponse = await fetch(intentPayload.data.signedUploadUrl, {
        method: "PUT",
        headers: intentPayload.data.requiredHeaders,
        body: file,
      });
      if (!objectResponse.ok) throw new Error("Attachment upload failed");

      const confirmationResponse = await fetch(
        `${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CONFIRM_UPLOAD_INTENT(uploadIntentId)}`,
        { method: "POST", credentials: "include" },
      );
      const confirmationPayload = await confirmationResponse.json() as ConfirmedAssetResponse;
      if (!confirmationResponse.ok || !confirmationPayload.data?.id) {
        throw new Error(confirmationPayload.error || "Uploaded attachment could not be verified");
      }

      onChange?.({
        assetId: confirmationPayload.data.id,
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
      });
    } catch (error) {
      if (uploadIntentId) {
        await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CANCEL_UPLOAD_INTENT(uploadIntentId)}`, {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
      }
      setErrorMessage(error instanceof Error ? error.message : "Attachment upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={attachmentPolicy.allowedMimeTypes.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void uploadAttachment(event.target.files?.[0])}
      />
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
          <span className="min-w-0 truncate text-sm text-foreground">{value.fileName}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={disabled || isUploading}
            onClick={() => onChange?.(null)}
            aria-label="Remove submission attachment"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          {isUploading ? "Uploading securely..." : "Choose an attachment"}
        </Button>
      )}
      {errorMessage && <p className="text-sm text-destructive" role="alert">{errorMessage}</p>}
    </div>
  );
}
