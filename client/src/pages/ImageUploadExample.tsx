import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function ImageUploadExample() {
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleUploadSuccess = (objectPath: string) => {
    setImageUrl(objectPath);
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
            maxFileSize={10485760}
            onUploadSuccess={handleUploadSuccess}
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
