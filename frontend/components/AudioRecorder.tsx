import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
  onAudioRecorded?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          if (onAudioRecorded) {
            onAudioRecorded(audioBlob);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.warn("Microphone access not available or denied:", err);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      title={isRecording ? "Stop Recording" : "Record Audio Voice Query"}
      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
        isRecording
          ? "bg-red-600/20 text-red-400 animate-pulse border border-red-500/50"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
      }`}
    >
      {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};

export default AudioRecorder;
