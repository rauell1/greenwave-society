"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { QrCameraScanner } from "@/components/events/QrCameraScanner";
import { toast } from "sonner";

interface AdminQuickScannerProps {
  eventId: string;
}

export default function AdminQuickScanner({ eventId: _eventId }: AdminQuickScannerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    name?: string;
    role?: string;
    ticketNumber?: string;
    error?: string;
  } | null>(null);

  const handleScan = async (scannedText: string) => {
    try {
      let regId = "";
      let regToken = "";

      if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
        const url = new URL(scannedText);
        regId = url.searchParams.get("id") || "";
        regToken = url.searchParams.get("token") || "";
      } else if (scannedText.includes("id=")) {
        const params = new URLSearchParams(scannedText);
        regId = params.get("id") || "";
        regToken = params.get("token") || "";
      } else {
        regId = scannedText.trim();
      }

      if (!regId) {
        toast.error("Could not parse registration ID from code");
        return;
      }

      const res = await fetch("/api/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: regId,
          token: regToken || undefined,
          status: "checked_in",
        }),
      });

      const data = await res.json();

      if (data.success) {
        const reg = data.registration;
        setScanResult({
          success: true,
          name: reg.fullName,
          role: reg.role,
          ticketNumber: reg.ticketNumber,
        });
        toast.success(`Checked in: ${reg.fullName} (${reg.ticketNumber})`);
        router.refresh();
      } else {
        setScanResult({
          success: false,
          error: data.error || "Check-in failed",
        });
        toast.error(data.error || "Verification failed");
      }
    } catch {
      toast.error("Network error during check-in");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-xl text-xs font-semibold gap-1.5 shadow-sm transition-all ${
            isOpen
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-emerald-700 hover:bg-emerald-800 text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isOpen ? "Close Live Scanner" : "Scan Passes (Camera / Photo)"}</span>
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-3">
          <QrCameraScanner
            isActive={isOpen}
            onClose={() => setIsOpen(false)}
            onScan={handleScan}
            title="Dashboard Pass Scanner"
          />

          {scanResult && (
            <Card
              className={`border-2 shadow-md ${
                scanResult.success
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-red-500 bg-red-500/10"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {scanResult.success ? scanResult.name : "Check-In Unsuccessful"}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {scanResult.success
                        ? `${scanResult.role} • ${scanResult.ticketNumber}`
                        : scanResult.error}
                    </p>
                  </div>
                </div>

                {scanResult.success && (
                  <Badge className="bg-emerald-600 text-white text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
