import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
      <div className="relative w-16 h-16 animate-pulse">
        <Image 
          src="/icon.png" 
          alt="Carregando..." 
          fill 
          className="object-contain"
          priority
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Carregando...
      </p>
    </div>
  );
}
