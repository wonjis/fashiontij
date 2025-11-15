import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ObjectUploaderProps {
  maxFileSize?: number;
  accept?: string;
  onUploadSuccess?: (uploadURL: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  accept = "image/*",
  onUploadSuccess,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log("Getting upload URL for:", file.name);
      const urlResponse = await fetch("/api/objects/upload", {
        method: "POST",
      });

      if (!urlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${urlResponse.status}`);
      }

      const { uploadURL } = await urlResponse.json();
      console.log("Upload URL received:", uploadURL);

      console.log("Uploading file...");
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      console.log("File uploaded successfully");

      console.log("Setting ACL...");
      const aclResponse = await fetch("/api/design-images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageURL: uploadURL }),
      });

      if (!aclResponse.ok) {
        throw new Error(`Failed to set ACL: ${aclResponse.status}`);
      }

      const { objectPath } = await aclResponse.json();
      console.log("ACL set, object path:", objectPath);

      toast({
        title: "Upload successful!",
        description: `${file.name} has been uploaded`,
      });

      onUploadSuccess?.(objectPath);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file"
      />
      <Button
        onClick={handleButtonClick}
        className={buttonClassName}
        disabled={isUploading}
        data-testid="button-upload-image"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
