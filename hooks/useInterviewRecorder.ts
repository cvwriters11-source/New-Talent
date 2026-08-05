"use client";

import { useCallback, useRef } from "react";

export type PendingAudioClip = {
  id: string;
  role: "user" | "assistant" | "system";
  blob: Blob;
  text?: string;
};

async function uploadClip(
  sessionId: string,
  clip: PendingAudioClip,
): Promise<{ id: string; role: string; url: string; text?: string } | null> {
  const form = new FormData();
  const ext = clip.blob.type.includes("mp3") ? "mp3" : "webm";
  form.append(
    "file",
    new File([clip.blob], `${clip.role}-${clip.id}.${ext}`, {
      type: clip.blob.type || "audio/webm",
    }),
  );
  form.append("sessionId", sessionId);
  form.append("role", clip.role);

  const res = await fetch("/api/interview-prep/audio", {
    method: "POST",
    body: form,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { url?: string };
  if (!json.url) return null;
  return {
    id: clip.id,
    role: clip.role,
    url: json.url,
    text: clip.text,
  };
}

export function useInterviewRecorder(sessionId?: string) {
  const clipsRef = useRef<PendingAudioClip[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentRoleRef = useRef<"user" | "assistant" | "system">("user");
  const currentTextRef = useRef<string>("");

  const ensureStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  const startCandidateRecording = useCallback(async () => {
    try {
      const stream = await ensureStream();
      chunksRef.current = [];
      currentRoleRef.current = "user";
      currentTextRef.current = "";
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
    } catch {
      /* mic may already be in use by speech recognition */
    }
  }, [ensureStream]);

  const stopCandidateRecording = useCallback(async (text?: string) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      try {
        recorder.stop();
      } catch {
        resolve();
      }
    });

    mediaRecorderRef.current = null;
    const blob = new Blob(chunksRef.current, {
      type: recorder.mimeType || "audio/webm",
    });
    chunksRef.current = [];
    if (blob.size < 200) return;

    clipsRef.current.push({
      id: crypto.randomUUID(),
      role: "user",
      blob,
      text,
    });
  }, []);

  const addAssistantAudio = useCallback((blob: Blob, text: string) => {
    if (blob.size < 200) return;
    clipsRef.current.push({
      id: crypto.randomUUID(),
      role: "assistant",
      blob,
      text,
    });
  }, []);

  const uploadAll = useCallback(async () => {
    const id = sessionId || `local_${Date.now()}`;
    const uploaded = [];
    for (const clip of clipsRef.current) {
      const result = await uploadClip(id, clip);
      if (result) uploaded.push(result);
    }
    return uploaded;
  }, [sessionId]);

  const clear = useCallback(() => {
    clipsRef.current = [];
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  return {
    startCandidateRecording,
    stopCandidateRecording,
    addAssistantAudio,
    uploadAll,
    clear,
  };
}
