"use client";

import { useEffect, useRef, useState } from "react";

type Clip = {
  id: string;
  role: string;
  url: string;
  text?: string;
};

export function InterviewAudioPlayer({ clips }: { clips: Clip[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (clips.length === 0) {
    return (
      <p className="text-sm text-muted">
        No audio recording was saved for this session. Transcript is still
        available below.
      </p>
    );
  }

  async function playFrom(startIndex: number) {
    setIndex(startIndex);
    setPlaying(true);
    for (let i = startIndex; i < clips.length; i += 1) {
      setIndex(i);
      await new Promise<void>((resolve) => {
        const audio = new Audio(clips[i].url);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        void audio.play().catch(() => resolve());
      });
    }
    setPlaying(false);
  }

  function stop() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={playing}
          onClick={() => void playFrom(0)}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
        >
          {playing ? "Playing…" : "Play full interview"}
        </button>
        {playing ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink"
          >
            Stop
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {clips.map((clip, i) => (
          <li
            key={clip.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              playing && i === index
                ? "border-teal bg-teal/10"
                : "border-line bg-paper-deep"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold capitalize text-ink">{clip.role}</p>
              <button
                type="button"
                className="text-xs font-semibold text-teal"
                onClick={() => void playFrom(i)}
              >
                Play
              </button>
            </div>
            {clip.text ? (
              <p className="mt-1 text-xs text-muted line-clamp-2">{clip.text}</p>
            ) : null}
            <audio controls className="mt-2 w-full" src={clip.url} preload="none" />
          </li>
        ))}
      </ul>
    </div>
  );
}
