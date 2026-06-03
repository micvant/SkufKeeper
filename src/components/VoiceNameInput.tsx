"use client";

import { useCallback, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceNameInputProps {
  onResult: (text: string) => void;
  className?: string;
}

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceNameInput({ onResult, className }: VoiceNameInputProps) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => Boolean(getSpeechRecognition()));

  const toggle = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      if (text) onResult(text);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [listening, onResult]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
        listening
          ? "border-red-300 bg-red-50 text-red-600"
          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
        className
      )}
      aria-label={listening ? "Остановить запись" : "Диктовать название"}
      title={listening ? "Слушаю…" : "Диктовать название"}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
