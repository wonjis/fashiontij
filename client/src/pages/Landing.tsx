import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen [background:radial-gradient(50%_50%_at_97%_97%,rgba(255,81,197,0.09)_0%,rgba(255,81,197,0)_100%),radial-gradient(50%_50%_at_1%_72%,rgba(255,81,197,0.05)_0%,rgba(255,81,197,0)_100%),radial-gradient(50%_50%_at_50%_-1%,rgba(255,81,197,0.08)_2%,rgba(255,81,197,0)_100%),linear-gradient(0deg,rgba(13,0,29,1)_0%,rgba(13,0,29,1)_100%)] flex flex-col items-center justify-center p-8">
      <div className="absolute top-8 right-8">
        <Button
          onClick={() => setLocation("/collections")}
          className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-white"
        >
          Log in
        </Button>
      </div>

      <div className="absolute top-8 left-8">
        <div className="w-12 h-12 rounded-lg border-2 border-[#bf60ff] flex items-center justify-center">
          <span className="text-[#bf60ff] text-2xl font-bold">F</span>
        </div>
      </div>

      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="[font-family:'Cormorant_Upright',serif] font-medium text-white text-7xl tracking-wide">
            FashionFlat AI
          </h1>
          <p className="text-white/80 text-xl italic">
            Turn your rough sketch into a flat sketch in seconds.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <img
              src="/figmaAssets/before-after-pants.png"
              alt="Before and After showcase"
              className="w-auto h-auto max-w-3xl object-contain"
            />
          </div>
        </div>

        <Button
          onClick={() => setLocation("/collections")}
          className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 text-black text-xl px-12 py-7 rounded-2xl font-semibold h-auto"
        >
          Scan Rough Sketch
        </Button>
      </div>
    </div>
  );
}
