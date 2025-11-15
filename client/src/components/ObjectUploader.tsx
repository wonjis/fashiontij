import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UppyFile, UploadResult } from "@uppy/core";
import DashboardModal from "@uppy/react/dashboard-modal";
import AwsS3 from "@uppy/aws-s3";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: UppyFile<Record<string, unknown>, Record<string, unknown>>) => Promise<{
    method: "PUT";
    url: string;
    headers?: Record<string, string>;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
      onBeforeFileAdded: (currentFile) => {
        console.log("File added to Uppy:", currentFile.name);
        return currentFile;
      },
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          console.log("Uppy calling getUploadParameters for:", file.name);
          try {
            const result = await onGetUploadParameters(file);
            console.log("getUploadParameters result:", result);
            return result;
          } catch (error) {
            console.error("Error in getUploadParameters:", error);
            throw error;
          }
        },
      })
      .on("upload", () => {
        console.log("Upload started");
      })
      .on("upload-success", (file, response) => {
        console.log("Upload success:", file?.name, response);
      })
      .on("upload-error", (file, error) => {
        console.error("Upload error for", file?.name, ":", error);
      })
      .on("error", (error) => {
        console.error("Uppy error:", error);
      })
      .on("complete", (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
        console.log("Upload complete:", result);
        onComplete?.(result);
      });
    
    return uppyInstance;
  });

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-image">
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
