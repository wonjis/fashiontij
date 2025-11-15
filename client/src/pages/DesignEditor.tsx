import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Share, Download, User, Plus, Sparkles, X } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function DesignEditor() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const designId = params.id || "";
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const { data: design } = useQuery({
    queryKey: ["designs", designId],
    queryFn: async () => {
      const res = await fetch(`/api/designs/${designId}`);
      if (!res.ok) throw new Error("Failed to fetch design");
      return res.json();
    },
  });

  const { data: techPack } = useQuery({
    queryKey: ["techpack", designId],
    queryFn: async () => {
      const res = await fetch(`/api/designs/${designId}/techpack`);
      if (!res.ok) throw new Error("Failed to fetch tech pack");
      return res.json();
    },
  });

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          requestType: "design",
          designId,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      return res.json();
    },
  });

  const quickPrompts = [
    "Generate construction details based on the design",
    "Design a casual hoodie with kangaroo pocket",
    "Create a midi skirt with pleats",
    "Generate a bomber jacket with ribbed cuffs",
  ];

  return (
    <div className="min-h-screen bg-[#0d001d] text-white">
      <div className="flex flex-col h-screen">
        <header className="bg-[#1a0f2e] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/collections")}
              className="text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-[#bf60ff] flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-medium">{design?.name || "Design"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <User className="w-5 h-5" />
            </Button>
            <Button className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-[#1a0f2e] p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-white/60 mb-4">File</h3>
              <div className="bg-[#2a1f3e] rounded-lg p-3">
                <div className="text-sm text-white/80 mb-2">Original Sketch</div>
                <div className="aspect-square bg-[#0d001d] rounded flex items-center justify-center">
                  {design?.originalSketchUrl ? (
                    <img src={design.originalSketchUrl} alt="Original" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-white/40 text-xs">No sketch</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/60">Layers</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="bg-[#2a1f3e] rounded px-3 py-2 text-sm">Layer 1</div>
                <div className="bg-[#2a1f3e] rounded px-3 py-2 text-sm">Layer 2</div>
                <div className="bg-[#2a1f3e] rounded px-3 py-2 text-sm">Layer 3</div>
              </div>
            </div>
          </aside>

          <main className="flex-1 bg-[#0d001d] flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              {design?.designImageUrl ? (
                <img
                  src={design.designImageUrl}
                  alt={design.name}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="aspect-square bg-[#1a0f2e] rounded-lg flex items-center justify-center">
                  <span className="text-white/40">No design image</span>
                </div>
              )}
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-[#1a0f2e] rounded-full px-2 py-1">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-[#bf60ff] hover:bg-[#bf60ff]/90"
                  onClick={() => setShowAiModal(true)}
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </main>

          <aside className="w-80 bg-[#1a0f2e] overflow-y-auto">
            <Tabs defaultValue="design" className="h-full">
              <TabsList className="w-full bg-[#0d001d] p-1">
                <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                <TabsTrigger value="techpack" className="flex-1">Tech Pack</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Alignment</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {["Left", "Center", "Right"].map((align) => (
                      <Button key={align} variant="outline" size="sm" className="bg-[#2a1f3e] border-none">
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Position</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-white/60">X</label>
                      <Input className="bg-[#2a1f3e] border-none" defaultValue="120" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60">Y</label>
                      <Input className="bg-[#2a1f3e] border-none" defaultValue="84" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Size</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-white/60">W</label>
                      <Input className="bg-[#2a1f3e] border-none" defaultValue="320" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60">H</label>
                      <Input className="bg-[#2a1f3e] border-none" defaultValue="400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Fill</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <Input className="flex-1 bg-[#2a1f3e] border-none" defaultValue="#8EA4CB" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="techpack" className="p-6 space-y-4">
                <div className="bg-[#2a1f3e] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded bg-[#bf60ff] flex items-center justify-center">
                      <span className="text-xs">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Technical Package</h3>
                      <p className="text-xs text-white/60">Auto-generated documentation for manufacturing handoffs</p>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="description" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Design description</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      {techPack?.designDescription || "A relaxed-fit, long-sleeve pullover with a rugby-inspired silhouette and wide horizontal stripes alternating in powder blue and white. Features a deep V-placket with a ribbed knit collar and neckline trim for casual contrast."}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="specs" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Specification sheet</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      <div className="space-y-2">
                        <div><strong>Chest:</strong> 44"</div>
                        <div><strong>Length:</strong> 28"</div>
                        <div><strong>Sleeve:</strong> 24"</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bom" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Bill of materials (BOM)</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      <div className="space-y-1">
                        <div>• Main fabric: Cotton jersey</div>
                        <div>• Ribbed knit collar</div>
                        <div>• Thread: Matching colors</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="construction" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Construction details</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      {techPack?.constructionDetails || "Cut-and-sew construction with wide panel stripes; front and back panels aligned for stripe continuity."}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pattern" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Pattern & fit notes</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      The hem sits slightly cropped for a balanced, modern proportion.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cost" className="bg-[#2a1f3e] rounded-lg px-4 border-none">
                    <AccordionTrigger>Cost sheet</AccordionTrigger>
                    <AccordionContent className="text-sm text-white/80">
                      <div className="space-y-2">
                        <div><strong>Materials:</strong> $12.50</div>
                        <div><strong>Labor:</strong> $8.00</div>
                        <div><strong>Total:</strong> $20.50</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button className="w-full bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Export Full Tech Pack
                </Button>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>

      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="bg-gradient-to-b from-[#4a2859] to-[#6b1b47] border-none text-white max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl [font-family:'Cormorant_Upright',serif]">
                  FashionFlat AI
                </DialogTitle>
                <p className="text-sm text-white/80">AI-Powered Flat Sketch Generator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAiModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-[#2a1f3e]/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#bf60ff] mt-1" />
                <div>
                  <div className="font-semibold">AI Assistant</div>
                  <div className="text-sm text-white/80">Hello! How can I help you?</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Quick prompts:</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="bg-[#2a1f3e]/50 border-none text-left h-auto py-3 px-4 hover:bg-[#2a1f3e]"
                    onClick={() => setAiPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Describe the flat sketch you want to create..."
                className="bg-[#2a1f3e]/50 border-none text-white placeholder:text-white/40 min-h-[100px]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <p className="text-xs text-white/60">
                Describe your garment design and our AI will generate a flat sketch for you
              </p>
            </div>

            <Button
              className="w-full bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-black"
              onClick={() => {
                if (aiPrompt) {
                  aiMutation.mutate(aiPrompt);
                  setShowAiModal(false);
                }
              }}
              disabled={!aiPrompt || aiMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
