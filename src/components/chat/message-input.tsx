"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Mic, Video, X, Send, Loader2, Square } from "lucide-react";
import type { ChatMessageRow } from "./chat-types";

type PendingMedia = { file: File; type: "image" | "voice" | "video"; url?: string };

function getVoiceMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) return "audio/ogg;codecs=opus";
  return "audio/webm";
}

function getVideoMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) return "video/webm;codecs=vp9,opus";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) return "video/webm;codecs=vp8,opus";
  if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
  return "video/webm";
}

interface MessageInputProps {
  onSend: (payload: { type: string; content: string; fileUrl?: string; replyToId?: string }) => Promise<void>;
  replyTo: ChatMessageRow | null;
  onClearReply: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  replyTo,
  onClearReply,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // تایمر ضبط صدا یا ویدیو
  useEffect(() => {
    if (!isRecording && !isRecordingVideo) return;
    const start = Date.now();
    const id = setInterval(() => setRecordingSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [isRecording, isRecordingVideo]);

  // پیش‌نمایش لایو دوربین هنگام ضبط ویدیو
  useEffect(() => {
    const video = videoPreviewRef.current;
    const stream = streamRef.current;
    if (!video || !stream || !isRecordingVideo) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [isRecordingVideo]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startVoiceRecording = useCallback(async () => {
    if (disabled || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = getVoiceMimeType();
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch {
      // دسترسی به میکروفون رد شد یا خطا
    }
  }, [disabled]);

  const stopVoiceRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopStream();
      setIsRecording(false);
      return;
    }
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        stopStream();
        setIsRecording(false);
        mediaRecorderRef.current = null;
        const chunks = chunksRef.current;
        if (chunks.length === 0) {
          resolve();
          return;
        }
        const blob = new Blob(chunks, { type: chunks[0].type || "audio/webm" });
        const ext = blob.type.includes("ogg") ? ".ogg" : ".webm";
        const file = new File([blob], `voice-${Date.now()}${ext}`, { type: blob.type });
        setUploading(true);
        try {
          const url = await uploadFile(file, "voice");
          await onSend({
            type: "VOICE",
            content: "رسانه",
            fileUrl: url,
            replyToId: replyTo?.id,
          });
          onClearReply();
        } catch {
          // خطا در آپلود/ارسال
        } finally {
          setUploading(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [replyTo?.id, onSend, onClearReply, stopStream]);

  const startVideoRecording = useCallback(async () => {
    if (disabled || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = getVideoMimeType();
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.start(200);
      setIsRecordingVideo(true);
      setRecordingSeconds(0);
    } catch {
      // دسترسی به دوربین/میک رد شد
    }
  }, [disabled]);

  const stopVideoRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopStream();
      setIsRecordingVideo(false);
      return;
    }
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        stopStream();
        setIsRecordingVideo(false);
        mediaRecorderRef.current = null;
        const chunks = chunksRef.current;
        if (chunks.length === 0) {
          resolve();
          return;
        }
        const blob = new Blob(chunks, { type: chunks[0].type || "video/webm" });
        const file = new File([blob], `video-msg-${Date.now()}.webm`, { type: blob.type });
        setUploading(true);
        try {
          const url = await uploadFile(file, "video");
          await onSend({
            type: "VIDEO",
            content: "رسانه",
            fileUrl: url,
            replyToId: replyTo?.id,
          });
          onClearReply();
        } catch {
          //
        } finally {
          setUploading(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [replyTo?.id, onSend, onClearReply, stopStream]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      stopStream();
    };
  }, [stopStream]);

  const uploadFile = async (file: File, type: "image" | "voice" | "video") => {
    const form = new FormData();
    form.set("file", file);
    form.set("type", type);
    const res = await fetch("/api/chat/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.success && data.url) return data.url;
    throw new Error(data.error || "آپلود ناموفق");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "voice" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await uploadFile(file, type);
      setPendingMedia({ file, type, url });
    } catch {
      // could toast
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    const content = text.trim();
    const hasMedia = !!pendingMedia?.url;
    if (!content && !hasMedia) return;
    setSending(true);
    try {
      await onSend({
        type: hasMedia ? (pendingMedia!.type === "image" ? "IMAGE" : pendingMedia!.type === "voice" ? "VOICE" : "VIDEO") : "TEXT",
        content: content || "رسانه",
        fileUrl: pendingMedia?.url,
        replyToId: replyTo?.id,
      });
      setText("");
      setPendingMedia(null);
      onClearReply();
    } finally {
      setSending(false);
    }
  };

  const canSend = (text.trim() || pendingMedia?.url) && !sending && !uploading;

  return (
    <div className="border-t bg-background p-3">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/80 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            در پاسخ به {replyTo.sender.firstName} {replyTo.sender.lastName}: {replyTo.content.slice(0, 40)}...
          </span>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={onClearReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {pendingMedia && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/80 p-2">
          {pendingMedia.type === "image" && pendingMedia.url && (
            <img src={pendingMedia.url} alt="" className="h-12 w-12 rounded object-cover" />
          )}
          <span className="text-xs text-muted-foreground">
            {pendingMedia.type === "image" ? "تصویر" : pendingMedia.type === "voice" ? "صدا" : "ویدیو"} آماده ارسال
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-auto"
            onClick={() => setPendingMedia(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* حالت ضبط صدا ریل‌تایم (مثل تلگرام) */}
      {isRecording && (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-destructive/15 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
          </span>
          <span className="tabular-nums text-sm text-destructive">
            {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">در حال ضبط...</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mr-auto gap-1"
            onClick={stopVoiceRecording}
            disabled={uploading}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            توقف و ارسال
          </Button>
        </div>
      )}
      {/* حالت ضبط ویدیو مسج (مثل تلگرام) — پیش‌نمایش دوربین + تایمر + توقف */}
      {isRecordingVideo && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl overflow-hidden bg-black/90 p-2">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 tabular-nums text-[10px] text-white">
              {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">در حال ضبط ویدیو...</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mr-auto gap-1"
            onClick={stopVideoRecording}
            disabled={uploading}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            توقف و ارسال
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "image")}
          />
          <input
            ref={voiceInputRef}
            type="file"
            accept="audio/*,video/webm"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "voice")}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "video")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${isRecording ? "bg-destructive/20 text-destructive" : ""}`}
            disabled={disabled || uploading}
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            title={isRecording ? "توقف و ارسال" : "ضبط پیام صوتی"}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${isRecordingVideo ? "bg-destructive/20 text-destructive" : ""}`}
            disabled={disabled || uploading || isRecording}
            onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
            title={isRecordingVideo ? "توقف و ارسال ویدیو" : "ضبط ویدیو مسج"}
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="پیام..."
          className="min-h-10 max-h-32 resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={disabled}
        />
        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={!canSend}
          onClick={handleSend}
        >
          {sending || uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
