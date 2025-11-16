import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateDesignDialogProps {
  onSuccess?: () => void;
}

export function CreateDesignDialog({ onSuccess }: CreateDesignDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [designName, setDesignName] = useState("");
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<string>("");
  const [isGeneratingFlat, setIsGeneratingFlat] = useState(false);
  const [generatedTechnicalFlatUrl, setGeneratedTechnicalFlatUrl] = useState<string>("");
  const [generatedTechSpec, setGeneratedTechSpec] = useState<any>(null);
  const { toast } = useToast();

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
  });

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    setIsGeneratingFlat(true);
    setCreationStep("Generating technical flat and tech specs with AI...");

    try {
      const response = await fetch("/api/designs/generate-flat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalSketchUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || "Failed to generate design");
      }

      const result = await response.json();
      setGeneratedTechnicalFlatUrl(result.technicalFlatUrl);
      setGeneratedTechSpec(result.techSpec);
      
      toast({
        title: "AI generation complete!",
        description: "Technical flat and tech specs are ready. Fill in the details and click Create.",
      });
    } catch (error) {
      console.error("Generate error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate design",
        variant: "destructive",
      });
      setUploadedImageUrl("");
    } finally {
      setIsGeneratingFlat(false);
      setCreationStep("");
    }
  };

  const handleCreate = async () => {
    if (!uploadedImageUrl || !selectedCollection || !designName || !category || !season) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    if (!generatedTechnicalFlatUrl || !generatedTechSpec) {
      toast({
        title: "Please wait",
        description: "AI generation is still in progress",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    setCreationStep("Saving design...");

    try {
      const response = await fetch("/api/designs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId: selectedCollection,
          name: designName,
          category,
          season,
          originalSketchUrl: uploadedImageUrl,
          technicalFlatUrl: generatedTechnicalFlatUrl,
          techSpec: generatedTechSpec,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.message || "Failed to create design";
        const isRetryable = errorData.retryable || false;
        
        throw new Error(
          isRetryable 
            ? `AI validation error: ${errorMessage}. Please try again.`
            : errorMessage
        );
      }

      const result = await response.json();

      toast({
        title: "Design created!",
        description: `${result.design.name} has been created with AI-generated tech specs`,
      });

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Create design error:", error);
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setCreationStep("");
    }
  };

  const resetForm = () => {
    setUploadedImageUrl("");
    setSelectedCollection("");
    setDesignName("");
    setCategory("");
    setSeason("");
    setGeneratedTechnicalFlatUrl("");
    setGeneratedTechSpec(null);
    setIsGeneratingFlat(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-black" data-testid="button-create-design">
          + Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Design</DialogTitle>
          <DialogDescription>
            Upload a sketch and fill in the details. AI will generate a technical flat and tech pack.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="upload">Upload Sketch</Label>
            <ObjectUploader onUploadSuccess={handleImageUpload}>
              {uploadedImageUrl ? "Change Image" : "Browse Files"}
            </ObjectUploader>
            {isGeneratingFlat && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {creationStep}
              </div>
            )}
            {uploadedImageUrl && !isGeneratingFlat && generatedTechnicalFlatUrl && generatedTechSpec && (
              <p className="text-sm text-green-600 dark:text-green-400">✓ AI generation complete</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="collection">Collection</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger id="collection" data-testid="select-collection">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection: any) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Design Name</Label>
            <Input
              id="name"
              placeholder="e.g., Outerwear #1"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              data-testid="input-design-name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Outerwear"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="input-category"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="season">Season</Label>
            <Input
              id="season"
              placeholder="e.g., SS26"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              data-testid="input-season"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || isGeneratingFlat || !generatedTechnicalFlatUrl || !generatedTechSpec}
            data-testid="button-create"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {creationStep || "Creating with AI..."}
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
