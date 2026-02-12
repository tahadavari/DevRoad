"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import type { ChatMessageRow, ReplyToMessage } from "./chat-types";

interface MessageBubbleProps {
  message: ChatMessageRow;
  isOwn: boolean;
  onReply?: (message: ChatMessageRow) => void;
}

function ReplyPreview({ reply }: { reply: ReplyToMessage }) {
  const name = reply.sender ? `${reply.sender.firstName} ${reply.sender.lastName}` : "پیام";
  return (
    <div className="mb-1 border-r-2 border-primary/50 pr-2 text-xs text-muted-foreground">
      <p className="font-medium text-foreground/80">{name}</p>
      <p className="truncate max-w-[200px]">{reply.content}</p>
    </div>
  );
}

/** ویدیو مسج با ظاهر تلگرام: گرد، دکمه پلی وسط، مدت پایین */
function VideoMessageBubble({ fileUrl, isOwn }: { fileUrl: string; isOwn: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(Math.round(v.duration));
    const onEnded = () => setPlaying(false);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("ended", onEnded);
    };
  }, [fileUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "relative max-w-[240px] overflow-hidden rounded-2xl bg-black",
          isOwn ? "rounded-br-md" : "rounded-bl-md"
        )}
      >
        <video
          ref={videoRef}
          src={fileUrl}
          className="block max-h-64 w-full object-cover"
          playsInline
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          type="button"
          onClick={togglePlay}
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          aria-label={playing ? "توقف" : "پخش"}
        >
          {playing ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          )}
        </button>
        {duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white tabular-nums">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    </div>
  );
}

export function MessageBubble({ message, isOwn, onReply }: MessageBubbleProps) {
  const hasMedia = ["IMAGE", "VOICE", "VIDEO"].includes(message.type);

  return (
    <div
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "group max-w-[85%] rounded-2xl px-4 py-2 shadow-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted"
        )}
      >
        {message.replyTo && (
          <ReplyPreview reply={message.replyTo} />
        )}
        {message.type === "TEXT" && (
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        )}
        {message.type === "IMAGE" && message.fileUrl && (
          <div className="space-y-1">
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden">
              <img src={message.fileUrl} alt="" className="max-h-64 w-full object-cover" />
            </a>
            {message.content && message.content !== "رسانه" && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        )}
        {message.type === "VOICE" && message.fileUrl && (
          <div className="space-y-1">
            <audio controls className="w-full max-w-[240px] h-9" src={message.fileUrl} />
            {message.content && message.content !== "رسانه" && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        )}
        {message.type === "VIDEO" && message.fileUrl && (
          <VideoMessageBubble fileUrl={message.fileUrl} isOwn={isOwn} />
        )}
        <div className="mt-1 flex items-center justify-end gap-2">
          <span className="text-[10px] opacity-80">
            {new Date(message.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="opacity-0 group-hover:opacity-100 text-xs underline"
            >
              پاسخ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
