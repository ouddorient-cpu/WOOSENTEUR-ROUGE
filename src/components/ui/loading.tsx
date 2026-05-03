
"use client";
import React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type loadingProps = {
  screenHFull?: boolean;
};

export function Loading({ screenHFull = true }: loadingProps) {
  const [state, setState] = React.useState("_");
  const [loadText, setLoadText] = React.useState("Fetching");

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (state === "_") {
        setState("__");
        setLoadText("Fetching");
      } else if (state === "__") {
        setState(".");
        setLoadText("Loading");
      } else if (state === "..") {
        setState("…");
        setLoadText("Updating");
      } else {
        setState("_");
        setLoadText("Fetching");
      }
    }, 400);

    return () => clearInterval(interval);
  }, [state]);

  const getBorderColor = (text: string) => {
    switch (text) {
      case "Fetching":
        return "border-primary text-primary";
      case "Loading":
        return "border-secondary text-secondary";
      case "Updating":
        return "border-yellow-400 text-yellow-400";
      default:
        return "border-primary text-primary";
    }
  };

  const colorClass = getBorderColor(loadText);

  return (
    <div className={cn(screenHFull ? "min-h-screen" : "", "relative flex flex-col items-center justify-center")}>
      <div className={cn("p-1 border border-dashed rounded-full animate-spin", colorClass)}>
        <div className={cn("w-16 h-16 border-4 border-dashed rounded-full flex justify-center items-center animate-spin", colorClass)}>
          <PlusIcon />
        </div>
      </div>

      <p className="text-sm font-bold uppercase tracking-widest text-center mt-2">
        {loadText}
        <span className={cn("ml-1", colorClass)}>{state}</span>
      </p>
    </div>
  );
}
