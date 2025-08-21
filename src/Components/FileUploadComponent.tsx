import { FileImage, Loader2, Play, RotateCcw, Upload } from "lucide-react";
import React, { type ChangeEvent } from "react";

interface Props {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setEndpointMode: (a: any) => void;
  endpointMode: string;
  resetSelectionhandler: () => void;
  file: File | null;
  callProcess: () => void;
  loading: boolean;
}

const FileUploadComponent = ({
  onFileChange,
  setEndpointMode,
  endpointMode,
  resetSelectionhandler,
  file,
  loading,
  callProcess,
}: Props) => {
  return (
    <div className="flex  flex-col items-center gap-3 w-full">
      <div className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors p-8">
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <label htmlFor="file" className="cursor-pointer block text-center">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            {file ? (
              <FileImage className="w-full h-full" />
            ) : (
              <Upload className="w-full h-full" />
            )}
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-gray-900">
              {file ? file.name : "Choose an image file"}
            </div>
            <div className="text-sm text-gray-500">
              {file ? "Click to change file" : "PNG, JPG, JPEG up to 10MB"}
            </div>
          </div>
        </label>
      </div>


      {/* selection components */}
      <div className="bg-white rounded-xl p-6 w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Processing Options
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endpoint Mode
            </label>
            <select
              value={endpointMode}
              onChange={(e) => setEndpointMode(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="process"> Detect + Mask both </option>
              <option value="detect"> Detect Only</option>
              <option value="mask"> Mask Only</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={callProcess}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {loading ? "Processing..." : "Run Analysis"}
            </button>

            <button
              onClick={resetSelectionhandler}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
