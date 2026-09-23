import React, { useRef } from "react";
import { Paperclip, Image as ImageIcon, FileText, Music, X } from "lucide-react";

export interface SelectedFile {
  file: File;
  previewUrl?: string;
  type: "image" | "pdf" | "audio" | "other";
}

interface FileUploadProps {
  onFileSelect: (file: SelectedFile | null) => void;
  selectedFile: SelectedFile | null;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: SelectedFile["type"] = "other";
    let previewUrl: string | undefined = undefined;

    if (file.type.startsWith("image/")) {
      type = "image";
      previewUrl = URL.createObjectURL(file);
    } else if (file.type === "application/pdf") {
      type = "pdf";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    }

    onFileSelect({ file, previewUrl, type });
  };

  const clearFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf,audio/wav,audio/mpeg,audio/mp4"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach Image, PDF, or Audio"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-200">
          {selectedFile.type === "image" && <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
          {selectedFile.type === "pdf" && <FileText className="w-3.5 h-3.5 text-red-400" />}
          {selectedFile.type === "audio" && <Music className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="truncate max-w-[120px]">{selectedFile.file.name}</span>
          <button
            type="button"
            onClick={clearFile}
            className="text-slate-400 hover:text-red-400 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
