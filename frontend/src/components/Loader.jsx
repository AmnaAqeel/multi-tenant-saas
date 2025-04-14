import { LoaderCircle } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderCircle className="size-10 animate-spin" />
    </div>
  );
};

export const ButtonLoader = () => {
  return <LoaderCircle className="flex justify-center items-center size-5 animate-spin" />;
};

