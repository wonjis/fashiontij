import { DownloadIcon, XIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Ai = (): JSX.Element => {
  return (
    <main className="[background:radial-gradient(50%_50%_at_97%_97%,rgba(255,81,197,0.09)_0%,rgba(255,81,197,0)_100%),radial-gradient(50%_50%_at_1%_72%,rgba(255,81,197,0.05)_0%,rgba(255,81,197,0)_100%),radial-gradient(50%_50%_at_50%_-1%,rgba(255,81,197,0.08)_2%,rgba(255,81,197,0)_100%),linear-gradient(0deg,rgba(13,0,29,1)_0%,rgba(13,0,29,1)_100%),linear-gradient(0deg,rgba(184,184,184,1)_0%,rgba(184,184,184,1)_100%)] w-full min-w-[1304px] min-h-[982px] flex flex-col items-center relative">
      <header className="w-full flex justify-between items-start px-9 pt-9">
        <h1 className="flex-1 text-center [text-shadow:0px_4px_4px_#00000040] [font-family:'Cormorant_Upright',Helvetica] font-medium text-white text-[131px] tracking-[0] leading-[normal]">
          iFASHIONA
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-auto p-0 hover:bg-transparent"
        >
          <XIcon className="w-[23px] h-[23px] text-white" />
        </Button>
      </header>

      <section className="flex-1 w-full max-w-[862px] mx-auto flex flex-col items-center justify-center gap-8 px-4">
        <div className="w-full flex flex-col items-end gap-4">
          <div className="bg-[#ffffff33] rounded-[15px_0px_15px_15px] px-8 py-6 max-w-[449px]">
            <p className="[font-family:'Inter',Helvetica] font-normal text-white text-2xl tracking-[0] leading-[normal]">
              Can you generate a standard fit blazer with a thick belt and two
              pockets?
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col items-start gap-4">
          <div className="bg-[#ffffff33] rounded-[0px_15px_15px_15px] px-8 py-4">
            <p className="[font-family:'Inter',Helvetica] font-normal text-white text-2xl tracking-[0] leading-[normal]">
              Sure! Check this out.
            </p>
          </div>

          <div className="relative flex items-center justify-center gap-6 ml-8">
            <img
              className="w-[241px] h-[300px]"
              alt="Jacket"
              src="/figmaAssets/jacket.png"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-auto p-0 hover:bg-transparent"
            >
              <DownloadIcon className="w-[30px] h-[30px] text-white" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-[862px] mx-auto flex items-center gap-6 px-4 pb-16">
        <div className="flex-1 bg-[#ffffff33] rounded-[15px] px-8 py-6">
          <Input
            placeholder="Enter a message..."
            className="border-0 bg-transparent [font-family:'Inter',Helvetica] font-normal text-white text-2xl tracking-[0] leading-[normal] placeholder:text-white p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button className="bg-[#bf60ff] hover:bg-[#bf60ff]/90 rounded-[15px] px-12 py-6 h-auto">
          <span className="[font-family:'Inter',Helvetica] font-semibold text-black text-3xl tracking-[0] leading-[normal]">
            Submit
          </span>
        </Button>
      </footer>
    </main>
  );
};
