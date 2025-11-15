import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult, UppyFile } from "@uppy/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function ImageUploadExample() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { toast } = useToast();

  const handleGetUploadParameters = async (file: UppyFile<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      console.log("Requesting upload URL for file:", file.name);
      const response = await apiRequest("/api/objects/upload", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Upload URL received:", data.uploadURL);
      
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload URL:", error);
      toast({
        title: "Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;

      try {
        const response = await apiRequest("/api/design-images", {
          method: "PUT",
          body: JSON.stringify({ imageURL: uploadURL }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setImageUrl(data.objectPath);

        toast({
          title: "Upload successful!",
          description: `Image uploaded successfully. URL: ${data.objectPath}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process uploaded image",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Example</CardTitle>
          <CardDescription>
            Upload images to object storage and get URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={10485760}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleComplete}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </ObjectUploader>

          {imageUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Image URL:</p>
              <code className="block p-2 bg-muted rounded text-sm" data-testid="text-image-url">
                {imageUrl}
              </code>
              <img
                src={imageUrl}
                alt="Uploaded"
                className="max-w-md rounded border"
                data-testid="img-uploaded"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
