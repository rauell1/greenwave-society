"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  token: string;
  status: string;
  leaderName: string;
}

export default function SigningActions({ token, status, leaderName }: Props) {
  const router = useRouter();
  const [loading, setLoading]                   = useState(false);
  const [showRejectForm, setShowRejectForm]     = useState(false);
  const [rejectionReason, setRejectionReason]   = useState("");
  const [done, setDone]                         = useState<"signed" | "rejected" | null>(null);
  const [error, setError]                       = useState("");

  const alreadyActed = status !== "pending";
  const isSigned     = done === "signed" || (alreadyActed && status === "signed");

  if (alreadyActed || done) {
    return (
      <div className={`rounded-2xl border px-8 py-8 text-center ${isSigned ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
        <div className={`text-5xl mb-3 ${isSigned ? "text-green-600" : "text-red-500"}`}>
          {isSigned ? "✓" : "✗"}
        </div>
        <p className={`font-bold text-lg font-serif ${isSigned ? "text-green-800" : "text-red-800"}`}>
          {isSigned ? "Constitution Signed" : "Constitution Declined"}
        </p>
        <p className={`text-sm mt-2 max-w-md mx-auto leading-relaxed ${isSigned ? "text-green-700" : "text-red-700"}`}>
          {isSigned
            ? `Thank you, ${leaderName}. Your signature has been recorded. Your commitment to the Greenwave Society mission is acknowledged.`
            : `Your decision has been recorded. Please contact info@greenwavesociety.org if you have questions or wish to discuss further.`}
        </p>
      </div>
    );
  }

  async function submit(action: "sign" | "reject") {
    if (action === "reject" && !rejectionReason.trim()) {
      setError("Please provide a reason for declining.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`/api/sign/${token}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, rejectionReason: rejectionReason.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(action === "sign" ? "signed" : "rejected");
        router.refresh();
      } else if (res.status === 409) {
        router.refresh();
      } else {
        setError(data.error ?? "An error occurred. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 px-8 py-8">
      <h2 className="text-lg font-bold text-[#1A5C38] font-serif mb-2">Your Decision</h2>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        By clicking <strong>I Accept and Sign</strong> below, you confirm that you have read this Constitution in full
        and freely accept all terms, obligations, and responsibilities set out herein. This action is legally binding
        and will be recorded with your name, the date, and your IP address.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {!showRejectForm ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => submit("sign")}
            disabled={loading}
            className="flex-1 bg-[#1A5C38] text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-[#154d2f] disabled:opacity-50 transition-colors"
          >
            {loading ? "Recording your signature..." : "I Accept and Sign the Constitution"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="sm:w-auto border border-gray-300 text-gray-600 py-3 px-6 rounded-xl text-sm hover:border-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            I Decline
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for declining <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Please state your reason for declining to sign the Constitution..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => submit("reject")}
              disabled={loading || !rejectionReason.trim()}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Submitting..." : "Confirm Decline"}
            </button>
            <button
              onClick={() => { setShowRejectForm(false); setRejectionReason(""); setError(""); }}
              disabled={loading}
              className="border border-gray-300 text-gray-600 py-3 px-6 rounded-xl text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
