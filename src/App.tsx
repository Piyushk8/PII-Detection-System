import React, { useState, useRef } from "react";
import PIISidebar from "./Components/DetectionSideBar";
import FileUploadComponent from "./Components/FileUploadComponent";

export type DetectedPII = {
  type: string;
  value: string;
  confidence: number;
  coordinates: { x: number; y: number; width: number; height: number };
  masked_value: string;
};

const API_BASE =
  (import.meta.env as any).VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [maskedB64, setMaskedB64] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedPII[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpointMode, setEndpointMode] = useState<
    "process" | "detect" | "mask"
  >("process");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resetOptionsHandler = () => {
    setFile(null);
    setOriginalUrl(null);
    setDetected([]);
    setMaskedB64(null);
    setError(null);
  };

  
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDetected([]);
    setMaskedB64(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setOriginalUrl(URL.createObjectURL(f));
  }

  async function callProcess() {
    if (!file) return setError("Please choose an image file first");
    setLoading(true);
    setError(null);
    setDetected([]);
    setMaskedB64(null);

    const form = new FormData();
    form.append("file", file);

    try {
      if (endpointMode === "process") {
        const res = await fetch(`${API_BASE}/process-image`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const payload = await res.json();
        if (payload.masked_image) setMaskedB64(payload.masked_image);
        if (payload.detected_pii) setDetected(payload.detected_pii);
      } else if (endpointMode === "detect") {
        const res = await fetch(`${API_BASE}/detect-pii`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const payload = await res.json();
        setDetected(payload.detected_pii || []);
      } else if (endpointMode === "mask") {
        const res = await fetch(`${API_BASE}/mask-pii`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setMaskedB64(url);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadMasked() {
    if (!maskedB64) return;
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = maskedB64;
    link.download = "masked.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function drawBoxesPreview() {
    if (!originalUrl || !detected.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.lineWidth = Math.max(2, Math.round(img.width / 300));
      detected.forEach((d) => {
        const { x, y, width, height } = d.coordinates || {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };
        if (width && height) {
          ctx.strokeStyle = "rgba(255,0,0,0.9)";
          ctx.fillStyle = "rgba(255,0,0,0.12)";
          ctx.strokeRect(x, y, width, height);
          ctx.fillRect(x, y, width, height);
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          const label = `${d.type} (${Math.round(d.confidence * 100)}%)`;
          ctx.fillText(label, x + 6, y + 16);
        }
      });
    };
    img.src = originalUrl;
  }

  React.useEffect(() => {
    if (detected.length && originalUrl) drawBoxesPreview();
  }, [detected, originalUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center bg-gray-50 py-3 mb-6 text-gray-800">
        PII Detection & Masking System
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          <FileUploadComponent
            onFileChange={onFileChange}
            file={file}
            loading={loading}
            endpointMode={endpointMode}
            resetSelectionhandler={resetOptionsHandler}
            callProcess={callProcess}
            setEndpointMode={setEndpointMode}
          />
          {error && <div className="mt-2 text-red-600">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Original</h3>
              {originalUrl ? (
                <img
                  src={originalUrl}
                  alt="original"
                  className="w-full rounded-lg shadow"
                />
              ) : (
                <div className="text-sm text-gray-500">No image chosen</div>
              )}
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <h3 className="text-sm font-semibold mb-3">Masked / Preview</h3>
              {maskedB64 ? (
                <div className="flex flex-col gap-3">
                  <img
                    src={maskedB64}
                    alt="masked"
                    className="w-full rounded-lg shadow"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={downloadMasked}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-sm"
                    >
                      Download
                    </button>
                    <a
                      href={maskedB64}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-gray-200 rounded-lg shadow-sm"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Masked image will appear here after processing
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm ">
            <h3 className="text-sm font-semibold mb-3">
              Preview with detection boxes will appear here
            </h3>
            {canvasRef && file && (
              <div className="w-full overflow-auto rounded-lg">
                <canvas ref={canvasRef} className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm sticky top-6 h-fit">
          <PIISidebar drawBoxesPreview={drawBoxesPreview} canvasRef={canvasRef} detected={detected} />
        </aside>
      </div>
    </div>
  );
}
