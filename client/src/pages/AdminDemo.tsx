import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Package, Image as ImageIcon, FileText, Edit } from "lucide-react";
import type { Collection, Design, TechPack, ResourceItem } from "@shared/schema";

export default function AdminDemo() {
  const { toast } = useToast();

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: designs = [] } = useQuery<Design[]>({
    queryKey: ["/api/designs"],
  });

  const { data: resources = [] } = useQuery<ResourceItem[]>({
    queryKey: ["/api/resources"],
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Demo Content Admin</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage demo content for demo-user account
        </p>
      </div>

      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections" data-testid="tab-collections">
            <Package className="mr-2 h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="designs" data-testid="tab-designs">
            <ImageIcon className="mr-2 h-4 w-4" />
            Designs
          </TabsTrigger>
          <TabsTrigger value="techpacks" data-testid="tab-techpacks">
            <FileText className="mr-2 h-4 w-4" />
            Tech Packs
          </TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">
            <Upload className="mr-2 h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections">
          <CollectionManager collections={collections} />
        </TabsContent>

        <TabsContent value="designs">
          <DesignManager collections={collections} designs={designs} />
        </TabsContent>

        <TabsContent value="techpacks">
          <TechPackManager designs={designs} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager resources={resources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CollectionManager({ collections }: { collections: Collection[] }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/collections", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({ title: "Collection created successfully" });
      setName("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create collection", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Collection</CardTitle>
          <CardDescription>Add a new collection for organizing designs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              placeholder="e.g., SS26 - Resort Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-collection-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              placeholder="Collection description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-collection-description"
            />
          </div>
          <Button
            onClick={() => createMutation.mutate({ name, description })}
            disabled={!name || createMutation.isPending}
            className="w-full"
            data-testid="button-create-collection"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Collections</CardTitle>
          <CardDescription>{collections.length} collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="p-3 rounded-md bg-muted flex items-start justify-between gap-2"
                data-testid={`collection-${collection.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{collection.name}</p>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                  )}
                </div>
                <EditCollectionDialog collection={collection} />
              </div>
            ))}
            {collections.length === 0 && (
              <p className="text-sm text-muted-foreground">No collections yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditCollectionDialog({ collection }: { collection: Collection }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("PATCH", `/api/collections/${collection.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({ title: "Collection updated successfully" });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update collection", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid={`button-edit-collection-${collection.id}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>Update collection details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-edit-collection-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-edit-collection-description"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate({ name, description })}
            disabled={!name || updateMutation.isPending}
            className="w-full"
            data-testid="button-save-collection"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DesignManager({ collections, designs }: { collections: Collection[]; designs: Design[] }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [originalSketchUrl, setOriginalSketchUrl] = useState("");
  const [designImageUrl, setDesignImageUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      season: string;
      collectionId: string;
      originalSketchUrl: string;
      designImageUrl: string;
    }) => {
      const response = await apiRequest("POST", "/api/designs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
      toast({ title: "Design created successfully" });
      setName("");
      setCategory("");
      setSeason("");
      setOriginalSketchUrl("");
      setDesignImageUrl("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create design", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Design</CardTitle>
          <CardDescription>Upload original sketch and flat sketch images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger data-testid="select-collection">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="design-name">Design Name</Label>
              <Input
                id="design-name"
                placeholder="e.g., Outerwear #1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-design-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="design-category">Category</Label>
              <Input
                id="design-category"
                placeholder="e.g., Outerwear"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-testid="input-design-category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="design-season">Season</Label>
              <Input
                id="design-season"
                placeholder="e.g., SS26"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                data-testid="input-design-season"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Original Sketch</Label>
              <ObjectUploader onUploadSuccess={setOriginalSketchUrl}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Original
              </ObjectUploader>
              {originalSketchUrl && (
                <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                  <img
                    src={originalSketchUrl}
                    alt="Original"
                    className="w-full rounded"
                    data-testid="img-original-preview"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Flat Sketch</Label>
              <ObjectUploader onUploadSuccess={setDesignImageUrl}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Flat Sketch
              </ObjectUploader>
              {designImageUrl && (
                <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                  <img
                    src={designImageUrl}
                    alt="Flat"
                    className="w-full rounded"
                    data-testid="img-flat-preview"
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() =>
              createMutation.mutate({
                name,
                category,
                season,
                collectionId,
                originalSketchUrl,
                designImageUrl,
              })
            }
            disabled={
              !name ||
              !category ||
              !season ||
              !collectionId ||
              !originalSketchUrl ||
              !designImageUrl ||
              createMutation.isPending
            }
            className="w-full"
            data-testid="button-create-design"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Design
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Designs</CardTitle>
          <CardDescription>{designs.length} designs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {designs.map((design) => {
              const collection = collections.find((c) => c.id === design.collectionId);
              return (
                <div
                  key={design.id}
                  className="p-3 rounded-md bg-muted space-y-2"
                  data-testid={`design-${design.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{design.name}</p>
                      {collection && (
                        <p className="text-xs text-muted-foreground">
                          Collection: {collection.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {design.category} • {design.season}
                      </p>
                      {design.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {design.description}
                        </p>
                      )}
                    </div>
                    <EditDesignDialog design={design} collections={collections} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {design.originalSketchUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Original</p>
                        <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                          <img
                            src={design.originalSketchUrl}
                            alt="Original"
                            className="w-full rounded"
                          />
                        </div>
                      </div>
                    )}
                    {design.designImageUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Flat Sketch</p>
                        <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                          <img
                            src={design.designImageUrl}
                            alt="Flat"
                            className="w-full rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {designs.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3">No designs yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditDesignDialog({ design, collections }: { design: Design; collections: Collection[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(design.name);
  const [category, setCategory] = useState(design.category || "");
  const [season, setSeason] = useState(design.season || "");
  const [collectionId, setCollectionId] = useState(design.collectionId || "");

  const updateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      season: string;
      collectionId: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/designs/${design.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
      toast({ title: "Design updated successfully" });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update design", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid={`button-edit-design-${design.id}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Design</DialogTitle>
          <DialogDescription>Update design details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Collection</Label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-edit-design-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="input-edit-design-category"
            />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Input
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              data-testid="input-edit-design-season"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate({ name, category, season, collectionId })}
            disabled={!name || !category || !season || updateMutation.isPending}
            className="w-full"
            data-testid="button-save-design"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TechPackManager({ designs }: { designs: Design[] }) {
  const { toast } = useToast();
  const [designId, setDesignId] = useState("");
  const [designDescription, setDesignDescription] = useState("");
  const [specificationSheet, setSpecificationSheet] = useState("");
  const [billOfMaterials, setBillOfMaterials] = useState("");
  const [constructionDetails, setConstructionDetails] = useState("");
  const [patternNotes, setPatternNotes] = useState("");
  const [costSheet, setCostSheet] = useState("");

  const { data: techPacks = [] } = useQuery<TechPack[]>({
    queryKey: ["/api/techpacks"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      designId: string;
      designDescription: string;
      specificationSheet: string;
      billOfMaterials: string;
      constructionDetails: string;
      patternNotes: string;
      costSheet: string;
    }) => {
      const response = await apiRequest("POST", "/api/techpacks", {
        designId: data.designId,
        designDescription: data.designDescription,
        specificationSheet: JSON.parse(data.specificationSheet),
        billOfMaterials: JSON.parse(data.billOfMaterials),
        constructionDetails: data.constructionDetails,
        patternNotes: data.patternNotes,
        costSheet: JSON.parse(data.costSheet),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/techpacks"] });
      toast({ title: "Tech pack created successfully" });
      setDesignId("");
      setDesignDescription("");
      setSpecificationSheet("");
      setBillOfMaterials("");
      setConstructionDetails("");
      setPatternNotes("");
      setCostSheet("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create tech pack", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Tech Pack</CardTitle>
          <CardDescription>Add complete technical specifications for a design</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Design</Label>
          <Select value={designId} onValueChange={setDesignId}>
            <SelectTrigger data-testid="select-design">
              <SelectValue placeholder="Select design" />
            </SelectTrigger>
            <SelectContent>
              {designs.map((design) => (
                <SelectItem key={design.id} value={design.id}>
                  {design.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="design-description">Design Description</Label>
          <Textarea
            id="design-description"
            placeholder="A relaxed-fit pullover with rugby-inspired silhouette..."
            value={designDescription}
            onChange={(e) => setDesignDescription(e.target.value)}
            data-testid="input-design-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specification-sheet">Specification Sheet (JSON)</Label>
          <Textarea
            id="specification-sheet"
            placeholder='{"chest": "44in", "length": "28in", "sleeve": "24in"}'
            value={specificationSheet}
            onChange={(e) => setSpecificationSheet(e.target.value)}
            data-testid="input-specification-sheet"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bill-of-materials">Bill of Materials (JSON)</Label>
          <Textarea
            id="bill-of-materials"
            placeholder='[{"item": "Main fabric", "detail": "Cotton jersey"}, {"item": "Ribbed knit collar", "detail": "Matching color"}]'
            value={billOfMaterials}
            onChange={(e) => setBillOfMaterials(e.target.value)}
            data-testid="input-bill-of-materials"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="construction-details">Construction Details</Label>
          <Textarea
            id="construction-details"
            placeholder="Cut-and-sew construction with wide panel stripes..."
            value={constructionDetails}
            onChange={(e) => setConstructionDetails(e.target.value)}
            data-testid="input-construction-details"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern-notes">Pattern Notes</Label>
          <Textarea
            id="pattern-notes"
            placeholder="The hem sits slightly cropped for a balanced, modern proportion..."
            value={patternNotes}
            onChange={(e) => setPatternNotes(e.target.value)}
            data-testid="input-pattern-notes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost-sheet">Cost Sheet (JSON)</Label>
          <Textarea
            id="cost-sheet"
            placeholder='{"materials": 12.50, "labor": 8.00, "total": 20.50}'
            value={costSheet}
            onChange={(e) => setCostSheet(e.target.value)}
            data-testid="input-cost-sheet"
          />
        </div>

        <Button
          onClick={() =>
            createMutation.mutate({
              designId,
              designDescription,
              specificationSheet,
              billOfMaterials,
              constructionDetails,
              patternNotes,
              costSheet,
            })
          }
          disabled={
            !designId ||
            !specificationSheet ||
            !billOfMaterials ||
            !costSheet ||
            createMutation.isPending
          }
          className="w-full"
          data-testid="button-create-techpack"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tech Pack
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Existing Tech Packs</CardTitle>
        <CardDescription>{techPacks.length} tech packs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {techPacks.map((techPack) => {
            const design = designs.find((d) => d.id === techPack.designId);
            return (
              <div
                key={techPack.id}
                className="p-3 rounded-md bg-muted"
                data-testid={`techpack-${techPack.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{design?.name || "Unknown Design"}</p>
                    {techPack.designDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {techPack.designDescription}
                      </p>
                    )}
                  </div>
                  <EditTechPackDialog techPack={techPack} designs={designs} />
                </div>
              </div>
            );
          })}
          {techPacks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tech packs yet</p>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

function EditTechPackDialog({ techPack, designs }: { techPack: TechPack; designs: Design[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [designDescription, setDesignDescription] = useState(techPack.designDescription || "");
  const [specificationSheet, setSpecificationSheet] = useState(
    JSON.stringify(techPack.specificationSheet, null, 2)
  );
  const [billOfMaterials, setBillOfMaterials] = useState(
    JSON.stringify(techPack.billOfMaterials, null, 2)
  );
  const [constructionDetails, setConstructionDetails] = useState(techPack.constructionDetails || "");
  const [patternNotes, setPatternNotes] = useState(techPack.patternNotes || "");
  const [costSheet, setCostSheet] = useState(JSON.stringify(techPack.costSheet, null, 2));

  const updateMutation = useMutation({
    mutationFn: async (data: {
      designDescription: string;
      specificationSheet: string;
      billOfMaterials: string;
      constructionDetails: string;
      patternNotes: string;
      costSheet: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/techpacks/${techPack.id}`, {
        designDescription: data.designDescription,
        specificationSheet: JSON.parse(data.specificationSheet),
        billOfMaterials: JSON.parse(data.billOfMaterials),
        constructionDetails: data.constructionDetails,
        patternNotes: data.patternNotes,
        costSheet: JSON.parse(data.costSheet),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/techpacks"] });
      toast({ title: "Tech pack updated successfully" });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update tech pack", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={`button-edit-techpack-${techPack.id}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tech Pack</DialogTitle>
          <DialogDescription>
            Modify technical specifications for {designs.find((d) => d.id === techPack.designId)?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Design Description</Label>
            <Textarea
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
              data-testid="input-edit-design-description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Specification Sheet (JSON)</Label>
            <Textarea
              value={specificationSheet}
              onChange={(e) => setSpecificationSheet(e.target.value)}
              data-testid="input-edit-specification-sheet"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Bill of Materials (JSON)</Label>
            <Textarea
              value={billOfMaterials}
              onChange={(e) => setBillOfMaterials(e.target.value)}
              data-testid="input-edit-bill-of-materials"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Construction Details</Label>
            <Textarea
              value={constructionDetails}
              onChange={(e) => setConstructionDetails(e.target.value)}
              data-testid="input-edit-construction-details"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Pattern Notes</Label>
            <Textarea
              value={patternNotes}
              onChange={(e) => setPatternNotes(e.target.value)}
              data-testid="input-edit-pattern-notes"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Cost Sheet (JSON)</Label>
            <Textarea
              value={costSheet}
              onChange={(e) => setCostSheet(e.target.value)}
              data-testid="input-edit-cost-sheet"
              rows={3}
            />
          </div>
          <Button
            onClick={() =>
              updateMutation.mutate({
                designDescription,
                specificationSheet,
                billOfMaterials,
                constructionDetails,
                patternNotes,
                costSheet,
              })
            }
            disabled={
              !specificationSheet || !billOfMaterials || !costSheet || updateMutation.isPending
            }
            className="w-full"
            data-testid="button-save-techpack"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResourceManager({ resources }: { resources: ResourceItem[] }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [designData, setDesignData] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      categoryId: string;
      imageUrl: string;
      designData: string;
    }) => {
      const response = await apiRequest("POST", "/api/resource-items", {
        name: data.name,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        designData: JSON.parse(data.designData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Resource created successfully" });
      setName("");
      setCategory("");
      setImageUrl("");
      setDesignData("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create resource", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resource</CardTitle>
          <CardDescription>Add fabric, button, or other design resources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-name">Name</Label>
            <Input
              id="resource-name"
              placeholder="e.g., Denim Fabric"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-resource-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-category">Category ID</Label>
            <Input
              id="resource-category"
              placeholder="Category UUID"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="input-resource-category"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <ObjectUploader onUploadSuccess={setImageUrl}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </ObjectUploader>
            {imageUrl && (
              <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                <img src={imageUrl} alt="Resource" className="w-full rounded" data-testid="img-resource-preview" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-data">Design Data (JSON)</Label>
            <Textarea
              id="design-data"
              placeholder='{"color": "blue", "pattern": "solid"}'
              value={designData}
              onChange={(e) => setDesignData(e.target.value)}
              data-testid="input-design-data"
            />
          </div>

          <Button
            onClick={() => createMutation.mutate({ name, categoryId: category, imageUrl, designData })}
            disabled={!name || !category || !imageUrl || !designData || createMutation.isPending}
            className="w-full"
            data-testid="button-create-resource"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Resource
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Resources</CardTitle>
          <CardDescription>{resources.length} resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="p-3 rounded-md bg-muted space-y-2"
                data-testid={`resource-${resource.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm flex-1 min-w-0">{resource.name}</p>
                  <EditResourceDialog resource={resource} />
                </div>
                {resource.imageUrl && (
                  <div className="bg-purple-600 dark:bg-purple-700 rounded p-2">
                    <img src={resource.imageUrl} alt={resource.name} className="w-full rounded" />
                  </div>
                )}
              </div>
            ))}
            {resources.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2">No resources yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditResourceDialog({ resource }: { resource: ResourceItem }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(resource.name);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiRequest("PATCH", `/api/resource-items/${resource.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Resource updated successfully" });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update resource", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid={`button-edit-resource-${resource.id}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>Update resource details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-edit-resource-name"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate({ name })}
            disabled={!name || updateMutation.isPending}
            className="w-full"
            data-testid="button-save-resource"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
