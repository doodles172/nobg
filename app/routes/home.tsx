import { removeBackground } from "@imgly/background-removal-node";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NoBG" },
    { name: "description", content: "Remove image backgrounds easily!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { error: "Choose an image first" };
  }
  if (image.size > 20 * 1024 * 1024) { // 20mb limit
    return { error: "Image is too large (max 20MB)" };
  }

  try {
    const result = await removeBackground(image);
    const buffer = Buffer.from(await result.arrayBuffer());
    const originalName = image.name.replace(/\.[^/.]+$/, "");
    return {
      image: `data:image/png;base64,${buffer.toString("base64")}`,
      filename: `${originalName}-nobg.png`,
    };
  } catch {
    return { error: "Couldn't process that image, try a different one" };
  }
}

export default function Home() {
  const fetcher = useFetcher<typeof action>();
  const isProcessing = fetcher.state !== "idle";
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (fetcher.data && "image" in fetcher.data) {
      dialogRef.current?.showModal();
    }
  }, [fetcher.data]);

  function closeDialog() {
    setIsClosing(true);
    setTimeout(() => {
      dialogRef.current?.close();
      setIsClosing(false);
    }, 200);
  }

  function submitFile(file: File | undefined) {
    if (!file) return;
    const data = new FormData();
    data.set("image", file);
    fetcher.submit(data, { method: "post", encType: "multipart/form-data" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="-translate-y-4 text-center text-6xl tracking-wide text-brown">
        NoBG
      </h1>

      <fetcher.Form
        method="post"
        encType="multipart/form-data"
        className="flex flex-col items-center"
      >
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingOver(false);
            if (isProcessing) return;
            submitFile(event.dataTransfer.files[0]);
          }}
          className={`flex h-96 w-[32rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors ${
            isDraggingOver
              ? "border-brown bg-sand-dark"
              : "border-tan bg-sand-light"
          }`}
        >
          <span className="text-brown">
            {isProcessing
              ? "Removing background :D"
              : "Drop an image here, or click to choose one"}
          </span>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            disabled={isProcessing}
            className="hidden"
            onChange={(event) => submitFile(event.target.files?.[0])}
          />
        </label>
      </fetcher.Form>

      {fetcher.data && "error" in fetcher.data && (
        <p className="text-red-500">{fetcher.data.error}</p>
      )}

      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        className={`m-auto rounded-2xl bg-sand p-6 backdrop:bg-black/40 ${isClosing ? "closing" : ""}`}
      >
        {fetcher.data && "image" in fetcher.data && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-3xl text-brown">Removed!</h2>
            <img
              src={fetcher.data.image}
              alt="Background removed"
              className="max-h-[60vh] max-w-sm"
            />
            <div className="flex gap-3">
              <a
                href={fetcher.data.image}
                download={fetcher.data.filename}
                className="rounded-full bg-brown px-5 py-2 text-sand outline-none"
              >
                Download
              </a>
              <button
                type="button"
                onClick={closeDialog}
                className="cursor-pointer rounded-full border border-brown px-5 py-2 text-brown outline-none"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>

      <p className="fixed bottom-4 left-4 text-sm text-brown-muted">
        {__COMMIT_HASH__} - {import.meta.env.MODE}
      </p>

      <footer className="pointer-events-none fixed bottom-4 flex w-full flex-col items-center gap-2 text-center text-sm text-brown-muted">
        <a
          href="https://github.com/doodles172/nobg"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          className="pointer-events-auto transition-colors hover:text-brown"
        >
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
        <p className="pointer-events-auto">
          Made with love by{" "}
          <a
            href="https://github.com/sponsors/doodles172"
            target="_blank"
            rel="noreferrer"
            className="underline transition-colors hover:text-brown"
          >
            Eamon
          </a>{" "}
          ❤️
        </p>
      </footer>
    </main>
  );
}
