"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getInterviewerPitch,
  getInterviewerRate,
  getInterviewerSpeechLang,
  pickInterviewerVoice,
} from "@/lib/interview/voices";
import type { InterviewerId, VoiceStatus } from "@/lib/interview/types";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(getSpeechRecognitionCtor() || window.speechSynthesis);
}

export function isMicSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(getSpeechRecognitionCtor());
}

type VoiceMode = "natural" | "browser";

type UseVoiceInterviewOptions = {
  interviewer: InterviewerId;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (message: string) => void;
  onAssistantAudio?: (blob: Blob, text: string) => void;
};

export function useVoiceInterview({
  interviewer,
  onTranscript,
  onError,
  onAssistantAudio,
}: UseVoiceInterviewOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speakingText, setSpeakingText] = useState("");
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("natural");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  const onTranscriptRef = useRef(onTranscript);
  const onAssistantAudioRef = useRef(onAssistantAudio);
  const speakGenerationRef = useRef(0);

  onErrorRef.current = onError;
  onTranscriptRef.current = onTranscript;
  onAssistantAudioRef.current = onAssistantAudio;

  const ensureVoices = useCallback(() => {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }, []);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.abort();
    } catch {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    }
    recognitionRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    revokeObjectUrl();
  }, [revokeObjectUrl]);

  const speakWithBrowser = useCallback(
    (text: string, generation: number) => {
      return new Promise<void>((resolve, reject) => {
        if (!window.speechSynthesis) {
          reject(new Error("Speech synthesis is not supported in this browser."));
          return;
        }

        window.speechSynthesis.cancel();
        const voices = ensureVoices();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickInterviewerVoice(voices, interviewer);
        if (voice) utterance.voice = voice;
        utterance.lang = getInterviewerSpeechLang(interviewer);
        utterance.rate = getInterviewerRate(interviewer);
        utterance.pitch = getInterviewerPitch(interviewer);

        utterance.onend = () => {
          if (speakGenerationRef.current !== generation) {
            resolve();
            return;
          }
          resolve();
        };
        utterance.onerror = () => {
          if (speakGenerationRef.current !== generation) {
            resolve();
            return;
          }
          reject(new Error("Could not play speech audio."));
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [ensureVoices, interviewer],
  );

  const speakWithOpenAi = useCallback(
    async (text: string, generation: number) => {
      const res = await fetch("/api/interview-prep/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, interviewer }),
      });

      if (!res.ok) return false;

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("audio")) {
        setVoiceMode("browser");
        return false;
      }

      if (speakGenerationRef.current !== generation) return true;

      revokeObjectUrl();
      const blob = await res.blob();
      onAssistantAudioRef.current?.(blob, text);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      await new Promise<void>((resolve, reject) => {
        if (speakGenerationRef.current !== generation) {
          resolve();
          return;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Could not play speech audio."));
        void audio.play().catch(reject);
      });

      return true;
    },
    [interviewer, revokeObjectUrl],
  );

  const speak = useCallback(
    async (text: string) => {
      const generation = ++speakGenerationRef.current;
      setSpeakingText(text);
      setStatus("speaking");

      try {
        const usedNatural = await speakWithOpenAi(text, generation);
        if (speakGenerationRef.current !== generation) return;

        if (usedNatural) {
          setVoiceMode("natural");
        } else {
          setVoiceMode("browser");
          await speakWithBrowser(text, generation);
        }
      } catch {
        if (speakGenerationRef.current !== generation) return;
        try {
          setVoiceMode("browser");
          await speakWithBrowser(text, generation);
        } catch (err) {
          if (speakGenerationRef.current !== generation) return;
          setSpeakingText("");
          setStatus("error");
          throw err;
        }
      } finally {
        if (speakGenerationRef.current === generation) {
          setSpeakingText("");
          setStatus("idle");
          audioRef.current = null;
        }
      }
    },
    [speakWithBrowser, speakWithOpenAi],
  );

  const listen = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        reject(
          new Error(
            "Voice input is not supported. Please use Chrome or Edge.",
          ),
        );
        return;
      }

      stopListening();
      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = "en-ZA";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      let finalText = "";
      let silenceTimer: number | null = null;
      let settled = false;

      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        if (silenceTimer) window.clearTimeout(silenceTimer);
        recognitionRef.current = null;
        setInterimTranscript("");
        fn();
      };

      const finish = (value: string) => {
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
        settle(() => {
          setStatus("idle");
          resolve(value.trim());
        });
      };

      const scheduleFinish = () => {
        if (silenceTimer) window.clearTimeout(silenceTimer);
        silenceTimer = window.setTimeout(() => {
          if (finalText.trim()) finish(finalText);
        }, 2000);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";
          if (result.isFinal) {
            finalText = `${finalText} ${transcript}`.trim();
          } else {
            interim += transcript;
          }
        }
        const display = finalText || interim;
        setInterimTranscript(display);
        onTranscriptRef.current?.(display, Boolean(finalText));
        if (finalText) scheduleFinish();
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "aborted") {
          settle(() => {
            setStatus("idle");
            if (finalText.trim()) resolve(finalText.trim());
            else reject(new Error("Listening cancelled."));
          });
          return;
        }
        if (finalText.trim()) {
          finish(finalText);
          return;
        }
        const message =
          event.error === "not-allowed"
            ? "Microphone access was denied. Please allow the mic and try again."
            : event.error === "no-speech"
              ? "No speech detected. Tap the microphone and speak clearly."
              : "Could not capture your voice. Please try again.";
        onErrorRef.current?.(message);
        settle(() => {
          setStatus("error");
          reject(new Error(message));
        });
      };

      recognition.onend = () => {
        if (settled) return;
        if (finalText.trim()) {
          settle(() => {
            setStatus("idle");
            resolve(finalText.trim());
          });
          return;
        }
        settle(() => {
          setStatus("idle");
          reject(
            new Error("No speech detected. Tap the microphone and try again."),
          );
        });
      };

      setStatus("listening");
      try {
        recognition.start();
      } catch {
        settle(() => {
          setStatus("error");
          reject(new Error("Could not start the microphone. Please try again."));
        });
      }
    });
  }, [stopListening]);

  const cancelSpeech = useCallback(() => {
    speakGenerationRef.current += 1;
    stopAudio();
    stopListening();
    setStatus("idle");
    setInterimTranscript("");
    setSpeakingText("");
  }, [stopAudio, stopListening]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureVoices();
    const onVoicesChanged = () => ensureVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      window.speechSynthesis?.removeEventListener(
        "voiceschanged",
        onVoicesChanged,
      );
      speakGenerationRef.current += 1;
      stopAudio();
      stopListening();
    };
  }, [ensureVoices, stopAudio, stopListening]);

  return {
    status,
    interimTranscript,
    speakingText,
    voiceMode,
    speak,
    listen,
    cancelSpeech,
    setStatus,
    isSupported: isVoiceSupported(),
    isMicSupported: isMicSupported(),
  };
}
