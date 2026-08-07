import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { FileText, Trash, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { UploadWidgetProps, UploadWidgetValue } from "@/types";

function UploadWidget({
  value = null,
  onChange,
  disabled = false,
}: UploadWidgetProps) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);
  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setPreview(value);
    if (!value) {
      setDeleteToken(null);
    }
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "uploads",
          maxFileSize: 10_000_000,
          // Removed clientAllowedFormats restriction to allow all document types
          // Allowed formats can be configured in your Cloudinary Preset settings
        },
        (error, result) => {
          if (!error && result.event === "success") {
            const payload: UploadWidgetValue = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };
            setPreview(payload);
            setDeleteToken(result.info.delete_token ?? null);
            onChangeRef.current?.(payload);
          }
        }
      );
      return true;
    };

    if (initializeWidget()) return;
    const intervalId = window.setInterval(() => {
      if (initializeWidget()) window.clearInterval(intervalId);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const openWidget = () => {
    if (!disabled) widgetRef.current?.open();
  };

  const removeFromCloudinary = async () => {
    if (!preview) return;
    setIsRemoving(true);
    try {
      if (deleteToken) {
        const params = new URLSearchParams();
        params.append("token", deleteToken);
        await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`,
          { method: "POST", body: params }
        );
      }
    } catch (error) {
      console.error("Failed to remove file from Cloudinary", error);
    } finally {
      setPreview(null);
      setDeleteToken(null);
      onChangeRef.current?.(null);
      setIsRemoving(false);
    }
  };

  // Check if the URL is an image to render standard <img> preview vs document preview
  const isImage = preview?.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || preview?.url?.includes("image/upload");

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="upload-preview flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 relative">
          {isImage ? (
            <img src={preview.url} alt="Uploaded file" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
              <FileText className="h-12 w-12 text-primary" />
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]" title={preview.url.split("/").pop()}>
                {preview.url.split("/").pop()}
              </p>
            </div>
          )}
          <Button type="button" size="icon" variant="destructive" onClick={removeFromCloudinary} disabled={isRemoving || disabled} className="absolute right-3 top-2 z-10 shadow-md">
            <Trash className="size-4" />
          </Button>
        </div>
      ) : (
        <div role="button" tabIndex={0} onClick={openWidget} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWidget(); } }} className="upload-dropzone min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-border bg-muted/20 mt-3 transition-colors hover:bg-muted/50 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-70">
          <div className="upload-prompt flex flex-col items-center justify-center gap-3 p-6 text-center">
            <UploadCloud className="icon size-10 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">Click to upload file</p>
              <p className="text-xs text-muted-foreground mt-1">Images, PDFs, Word, ZIP up to 10MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadWidget;