import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFileViewUrl } from "@/lib/courses.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

export function ProtectedFileViewer({
  fileId,
  fileName,
  mimeType,
  watermark,
}: {
  fileId: string;
  fileName: string;
  mimeType?: string | null;
  watermark: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const getUrl = useServerFn(getFileViewUrl);

  async function openViewer() {
    setLoading(true);
    setOpen(true);
    setUrl(null);
    setTextContent(null);
    try {
      const res = await getUrl({ data: { fileId } });
      setUrl(res.url);
      if (
        (mimeType && (mimeType.startsWith("text/") || mimeType === "application/json")) ||
        /\.(txt|md|csv|json)$/i.test(fileName)
      ) {
        const t = await fetch(res.url).then((r) => r.text());
        setTextContent(t);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Could not open file");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  // Prevent context menu (right-click) inside dialog
  useEffect(() => {
    if (!open) return;
    const prevent = (e: Event) => e.preventDefault();
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast("Printing and saving are disabled");
      }
    };
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName);
  const isImg = (mimeType && mimeType.startsWith("image/")) || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
  const isText = textContent !== null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={openViewer}>
        <Eye className="mr-1 h-3 w-3" /> View
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> {fileName}
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                In-app view only · Downloading, printing & saving are disabled
              </span>
            </DialogTitle>
          </DialogHeader>
          <div
            className="relative flex-1 overflow-hidden select-none"
            onCopy={(e) => e.preventDefault()}
            style={{ userSelect: "none" }}
          >
            {loading && (
              <div className="grid h-full place-items-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {!loading && url && (
              <>
                {isPdf && (
                  <iframe
                    title={fileName}
                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="h-full w-full border-0"
                  />
                )}
                {isImg && (
                  <div className="grid h-full place-items-center bg-black/80 p-4">
                    <img
                      src={url}
                      alt={fileName}
                      draggable={false}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                  </div>
                )}
                {isText && (
                  <pre className="h-full overflow-auto whitespace-pre-wrap p-4 text-sm">{textContent}</pre>
                )}
                {!isPdf && !isImg && !isText && (
                  <div className="grid h-full place-items-center p-6 text-center">
                    <div>
                      <p className="font-semibold">Preview not available for this file type</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Please ask the admin to re-upload this document as a PDF for in-app viewing.
                      </p>
                    </div>
                  </div>
                )}
                {/* Watermark overlay */}
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 grid grid-cols-3 gap-8 opacity-20 rotate-[-30deg] scale-125">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="text-center text-xs font-semibold text-black dark:text-white whitespace-nowrap"
                      >
                        {watermark} · ASVAB Pro
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
