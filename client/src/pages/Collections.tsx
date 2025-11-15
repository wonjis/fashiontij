import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useLocation } from "wouter";

export default function Collections() {
  const [, setLocation] = useLocation();

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-[#0d001d] text-white">
      <div className="flex h-screen">
        <aside className="w-64 bg-[#1a0f2e] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#bf60ff] flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start bg-[#2a1f3e] hover:bg-[#2a1f3e]/80 text-white"
              onClick={() => setLocation("/resources")}
            >
              Resources
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/60 hover:text-white hover:bg-[#2a1f3e]/50"
            >
              Recent
            </Button>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-2">Folders</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-[#2a1f3e]/50 text-sm"
              >
                SS26 collection
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/60 hover:text-white hover:bg-[#2a1f3e]/50 text-sm"
              >
                AW25 men's
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/60 hover:bg-[#2a1f3e]/50 text-sm"
              >
                SS25 women's
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search"
                className="pl-10 bg-[#1a0f2e] border-none text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-black">
                + Create
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-semibold mb-8">SS26 collection</h1>

          <div className="grid grid-cols-4 gap-6">
            {collections.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-white/60">
                No collections yet. Click "+ Create" to get started.
              </div>
            ) : (
              collections.map((collection: any) => (
                <div
                  key={collection.id}
                  className="bg-[#1a0f2e] rounded-xl p-4 cursor-pointer hover:bg-[#2a1f3e] transition-colors"
                >
                  <div className="aspect-square bg-[#2a1f3e] rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src="/figmaAssets/jacket.png"
                      alt={collection.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <h3 className="font-medium">{collection.name}</h3>
                  <p className="text-sm text-white/60">
                    Edited {new Date(collection.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
