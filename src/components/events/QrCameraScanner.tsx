"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { Camera, X, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCameraScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
  isActive: boolean;
}

export function QrCameraScanner({
  onScan,
  onClose,
  isActive,
}: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const playSuccessBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(100);
      }
    } catch {
      // Audio autoplay or vibration unavailable
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && code.data && code.data !== lastScanned) {
      setLastScanned(code.data);
      playSuccessBeep();
      onScan(code.data);

      // Prevent immediate duplicate scans for 2 seconds
      setTimeout(() => {
        setLastScanned(null);
      }, 2000);
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [lastScanned, onScan, playSuccessBeep]);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setHasCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser settings to scan attendee tickets."
          : "Unable to access device camera. Please check your connection or use manual search."
      );
    } finally {
      setIsStarting(false);
    }
  }, [scanFrame, stopCamera]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  if (!isActive) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-black shadow-2xl p-4 sm:p-6 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-white">Live Camera Scanner</h4>
            <p className="text-[10px] text-white/60">Align attendee QR code inside the box</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={startCamera}
            disabled={isStarting}
            className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8 px-2.5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStarting ? "animate-spin" : ""}`} />
          </Button>

          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8 px-2 rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Video & Scanner Viewport */}
      <div className="relative aspect-video max-h-[380px] w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/15">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Target Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/70 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            {/* Viewfinder Corners */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

            {/* Scanning Line Animation */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce mt-10" />
          </div>
        </div>

        {/* Loading Overlay */}
        {isStarting && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs text-white/80">Activating camera sensor...</span>
          </div>
        )}

        {/* Error Overlay */}
        {hasCameraError && (
          <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center gap-3 text-white">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <p className="text-xs text-white/90 max-w-sm leading-relaxed">{hasCameraError}</p>
            <Button
              size="sm"
              onClick={startCamera}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/60 pt-3 px-1">
        <span>Continuous door scan mode</span>
        <span>Auto-registers arrival on detection</span>
      </div>
    </div>
  );
}
