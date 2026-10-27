"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import {
  Camera,
  CameraOff,
  X,
  RefreshCw,
  Upload,
  Flashlight,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface QrCameraScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
  isActive: boolean;
  title?: string;
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

export function QrCameraScanner({
  onScan,
  onClose,
  isActive,
  title = "Live Camera Scanner",
}: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  const playSuccessBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Audio or vibration unavailable
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setTorchAvailable(false);
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
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data && code.data.trim() && code.data !== lastScanned) {
      const cleanData = code.data.trim();
      setLastScanned(cleanData);
      playSuccessBeep();
      onScan(cleanData);

      // Prevent immediate duplicate scans for 2.5 seconds
      setTimeout(() => {
        setLastScanned(null);
      }, 2500);
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [lastScanned, onScan, playSuccessBeep]);

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
      setAvailableDevices(videoInputs);
    } catch {
      // ignore
    }
  }, []);

  // Multi-tier camera launcher
  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setHasCameraError(null);
    setIsPermissionDenied(false);
    stopCamera();

    if (typeof window === "undefined") {
      setIsStarting(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      const isHttps = window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!isHttps) {
        setHasCameraError("Camera access requires a secure HTTPS connection. Please use manual entry or image upload.");
      } else {
        setHasCameraError("Camera device is not supported on this browser. Please use photo upload or manual entry.");
      }
      setIsStarting(false);
      return;
    }

    // List of candidate constraints to try sequentially
    const candidateConstraints: MediaStreamConstraints[] = [];

    if (selectedDeviceId) {
      candidateConstraints.push({
        video: { deviceId: { exact: selectedDeviceId } },
        audio: false,
      });
    }

    // Standard mobile back camera
    candidateConstraints.push({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    // Fallback facingMode only
    candidateConstraints.push({
      video: { facingMode: "environment" },
      audio: false,
    });

    // Fallback user camera (laptop / desktop webcam)
    candidateConstraints.push({
      video: { facingMode: "user" },
      audio: false,
    });

    // Fallback any video device
    candidateConstraints.push({
      video: true,
      audio: false,
    });

    let activeStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of candidateConstraints) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err: any) {
        lastError = err;
        // If permission was explicitly denied, don't loop endlessly through all constraints
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          break;
        }
      }
    }

    if (!activeStream) {
      console.warn("All camera constraint attempts failed:", lastError);
      const isDenied = lastError?.name === "NotAllowedError" || lastError?.name === "PermissionDeniedError";
      setIsPermissionDenied(isDenied);

      if (isDenied) {
        setHasCameraError(
          "Camera permission was blocked. Allow camera permissions in your browser address bar, or use the instant photo upload below."
        );
      } else if (lastError?.name === "NotFoundError" || lastError?.name === "DevicesNotFoundError") {
        setHasCameraError("No video camera detected on this device. Please use photo upload or manual ticket code.");
      } else if (lastError?.name === "NotReadableError" || lastError?.name === "TrackStartError") {
        setHasCameraError("Camera is currently in use by another application. Please close other camera tabs or apps.");
      } else {
        setHasCameraError(
          lastError?.message || "Unable to start camera stream. Please use photo upload or manual ticket code."
        );
      }
      setIsStarting(false);
      return;
    }

    try {
      streamRef.current = activeStream;

      // Check torch capability
      const videoTrack = activeStream.getVideoTracks()[0];
      if (videoTrack && typeof (videoTrack.getCapabilities as any) === "function") {
        const caps = (videoTrack.getCapabilities as any)() || {};
        if ("torch" in caps) {
          setTorchAvailable(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }

      await refreshDevices();
    } catch (err: any) {
      console.error("Error attaching camera stream:", err);
      setHasCameraError("Error initializing camera preview. Please retry.");
    } finally {
      setIsStarting(false);
    }
  }, [refreshDevices, scanFrame, selectedDeviceId, stopCamera]);

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      await (track.applyConstraints as any)({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch {
      // Torch not supported on this track
    }
  };

  // Decode from uploaded or snapped image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const offscreenCanvas = document.createElement("canvas");
          offscreenCanvas.width = img.width;
          offscreenCanvas.height = img.height;
          const ctx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            setIsProcessingFile(false);
            return;
          }

          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);

          let decoded = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "attemptBoth",
          });

          // If full image decode didn't find it, try crop around bottom right or scaled versions
          if (!decoded) {
            // Try resized down if image is huge (e.g. 4000px phone camera photo)
            if (img.width > 1200 || img.height > 1200) {
              const maxDim = 1000;
              const scale = Math.min(maxDim / img.width, maxDim / img.height);
              const sw = Math.round(img.width * scale);
              const sh = Math.round(img.height * scale);
              offscreenCanvas.width = sw;
              offscreenCanvas.height = sh;
              ctx.drawImage(img, 0, 0, sw, sh);
              const scaledData = ctx.getImageData(0, 0, sw, sh);
              decoded = jsQR(scaledData.data, scaledData.width, scaledData.height, {
                inversionAttempts: "attemptBoth",
              });
            }
          }

          if (decoded && decoded.data && decoded.data.trim()) {
            playSuccessBeep();
            onScan(decoded.data.trim());
          } else {
            alert("No QR code detected in the selected image. Please try another angle or enter ticket code manually.");
          }
        } catch (err) {
          console.error("Error decoding image QR:", err);
          alert("Error processing image file.");
        } finally {
          setIsProcessingFile(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playSuccessBeep();
    onScan(manualCode.trim());
    setManualCode("");
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, selectedDeviceId, startCamera, stopCamera]);

  if (!isActive) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-slate-950 shadow-2xl p-4 sm:p-6 text-white space-y-4">
      {/* Hidden file input for native camera snapshot / gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-white">{title}</h4>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5">
                Live
              </Badge>
            </div>
            <p className="text-[10px] text-white/60">Align attendee QR pass inside the target viewfinder</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Torch toggle */}
          {torchAvailable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleTorch}
              className={`text-xs h-8 px-2.5 rounded-xl ${
                torchOn ? "bg-amber-500/20 text-amber-300" : "text-white/80 hover:bg-white/10"
              }`}
              title="Toggle flashlight"
            >
              <Flashlight className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Camera switch if multiple devices */}
          {availableDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-900 border border-white/20 text-white text-[11px] rounded-xl px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {availableDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          {/* Native photo upload / snap bypass */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="border-white/20 text-white hover:bg-white/10 text-xs h-8 px-2.5 rounded-xl gap-1.5"
            title="Upload or take a photo of QR code"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Upload Photo</span>
          </Button>

          {/* Restart Camera */}
          <Button
            size="sm"
            variant="ghost"
            onClick={startCamera}
            disabled={isStarting}
            className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8 px-2 rounded-xl"
            title="Restart camera stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStarting ? "animate-spin" : ""}`} />
          </Button>

          {/* Close Scanner */}
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8 px-2 rounded-xl"
              title="Close scanner"
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

        {/* Viewfinder Target Overlay (only when camera is running) */}
        {!hasCameraError && !isStarting && (
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
        )}

        {/* Loading Overlay */}
        {isStarting && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs text-white/80">Activating camera sensor...</span>
          </div>
        )}

        {/* File Processing Overlay */}
        {isProcessingFile && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs text-white/80">Analyzing QR photo...</span>
          </div>
        )}

        {/* Actionable Error Overlay */}
        {hasCameraError && !isStarting && !isProcessingFile && (
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center gap-3.5 text-white overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <CameraOff className="w-6 h-6" />
            </div>

            <div className="space-y-1 max-w-md">
              <h5 className="font-semibold text-sm text-white">
                {isPermissionDenied ? "Camera Permission Needed" : "Camera Sensor Unavailable"}
              </h5>
              <p className="text-xs text-white/70 leading-relaxed">
                {hasCameraError}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-sm font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Snap or Upload QR Photo</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={startCamera}
                className="rounded-xl border-white/20 text-white hover:bg-white/10 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry Camera
              </Button>

              {isPermissionDenied && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPermissionHelp(!showPermissionHelp)}
                  className="rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 text-xs gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to unblock?</span>
                </Button>
              )}
            </div>

            {/* Collapsible browser permission unblock guide */}
            {showPermissionHelp && (
              <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-left text-[11px] text-white/80 max-w-md space-y-1.5">
                <p className="font-semibold text-emerald-400">How to unblock camera in your browser:</p>
                <ol className="list-decimal pl-4 space-y-1 text-white/70">
                  <li>Look at the address bar at the very top of your browser.</li>
                  <li>Click the <strong>Padlock 🔒 or Site Settings icon</strong> on the left side of the URL.</li>
                  <li>Find <strong>Camera</strong> and toggle it from <em>Block</em> to <strong>Allow</strong>.</li>
                  <li>Click <strong>Retry Camera</strong> above or refresh the page.</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar: Quick Manual Ticket Code Entry */}
      <form onSubmit={handleManualSubmit} className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <Input
            type="text"
            placeholder="Or type Ticket # (e.g. GW-D8C43F), ID, or paste QR URL..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="pl-9 h-9 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-emerald-500"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!manualCode.trim()}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 px-4 shrink-0"
        >
          Verify Pass
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-white/20 text-white hover:bg-white/10 text-xs h-9 px-3 shrink-0 sm:hidden"
        >
          <Upload className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          Photo
        </Button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-white/50 px-1 pt-1 border-t border-white/5">
        <span>Continuous door scan mode</span>
        <span>Supports QR camera, photo upload & manual code</span>
      </div>
    </div>
  );
}
