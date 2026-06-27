"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Signature {
  id: string; status: string; token: string;
  signedAt: string | null; emailSentAt: string | null;
  ipAddress: string | null; versionId: string | null;
  versionTag: string; createdAt: string;
}
interface Leader { id: string; name: string; role: string; email: string; signatures: Signature[]; }
interface Version {
  id: string; versionTag: string; title: string; content: string;
  contentType: string; status: string; publishedAt: string | null;
  createdAt: string; signatures: { status: string; leaderId: string }[];
}
interface AuditLog { id: string; action: string; actor: string; detail: string | null; createdAt: string; }
interface Props {
  leaders: Leader[]; versions: Version[];
  signedCount: number; pendingCount: number; rejectedCount: number;
  currentEmail: string; superAdmin: boolean;
  subscribers: { id: string; email: string; createdAt: string }[];
  adminUsers: { id: string; email: string; passwordHash: string | null; createdAt: string }[];
  dbStats: { table: string; count: number }[];
  auditLogs: AuditLog[];
}
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "n/a";
const fmtDT = (d: string | null) =>
  d ? new Date(d).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "n/a";

function StatusBadge({ s }: { s: string }) {
  if (s === "signed")   return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Signed</span>;
  if (s === "rejected") return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">Declined</span>;
  return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
}

function VerBadge({ s }: { s: string }) {
  if (s === "published") return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Published</span>;
  if (s === "archived")  return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Archived</span>;
  return <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Draft</span>;
}

function PreviewModal({ v, onClose }: { v: Version; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-auto py-8 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="font-bold text-[#1A5C38]">Preview: {v.versionTag}</p>
            <p className="text-xs text-gray-500">How leaders will see this on the sign page</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="max-h-[75vh] overflow-auto">
          <div className="bg-[#1A5C38] px-8 py-6 text-center">
            <p className="text-white font-bold text-xl font-serif tracking-wide">GREENWAVE SOCIETY</p>
            <p className="text-green-200 text-sm mt-1">{v.title.toUpperCase()}</p>
            <p className="text-green-300 text-xs mt-0.5 italic">{v.versionTag} &bull; Preview</p>
          </div>
          {v.content ? (
            <div
              className="px-10 py-8"
              style={{ fontFamily: "Times New Roman,serif", fontSize: "14px", lineHeight: "1.75", color: "#111", textAlign: "justify" }}
              dangerouslySetInnerHTML={{ __html: v.content }}
            />
          ) : (
            <div className="px-10 py-8 space-y-6" style={{ fontFamily: "Times New Roman,serif", fontSize: "14px", lineHeight: "1.75", color: "#111", textAlign: "justify" }}>
              <PreviewSect title="PREAMBLE">
                <p>We, the founding Executive Leaders of Greenwave Society, a Kenya-based non-profit youth organization dedicated to accelerating climate action and empowering youth as global changemakers, do hereby establish this Constitution as the governing covenant of our Executive Leadership Team.</p>
                <p>Guided by our mission to foster sustainable community development through international cooperation, and rooted in the principles of the 2030 Sustainable Development Agenda, we recognize that the strength of our organization begins with the integrity, commitment, and accountability of those who lead it.</p>
                <p>This Constitution is not merely a procedural document. It is a personal and collective pledge, a declaration that each Executive Leader freely and sincerely commits to the people we serve, to our fellow leaders, and to the planet we are called to protect and restore. By affixing our signatures hereto, we bind ourselves to the obligations, standards, and values set forth in this instrument.</p>
              </PreviewSect>
              <PreviewSect title="ARTICLE I: NAME, NATURE, AND REGISTERED CONTACT">
                <p>The organization operating under this Constitution shall be known as the <strong>Greenwave Society</strong> (hereinafter referred to as &ldquo;the Society&rdquo; or &ldquo;the Organization&rdquo;).</p>
                <p><strong>Type of Organization:</strong> Youth-led Non-Governmental Organization (NGO)</p>
                <p><strong>Country of Primary Operation:</strong> Kenya</p>
                <p><strong>Official Website:</strong> greenwave.rauell.systems</p>
                <p><strong>Email:</strong> info@greenwavesociety.org</p>
              </PreviewSect>
              <PreviewSect title="ARTICLE II: MISSION, VISION, AND CORE VALUES">
                <p><strong>Mission:</strong> To accelerate climate action, empower youth as global changemakers, and foster sustainable community development through international cooperation.</p>
                <p><strong>Vision:</strong> A world where humanity and planetary ecosystems coexist in harmony, achieved through the full and faithful implementation of the 2030 Sustainable Development Agenda.</p>
              </PreviewSect>
              <PreviewSect title="ARTICLE III: EXECUTIVE LEADERSHIP STRUCTURE">
                <p>The Executive Leadership Team of the Society shall comprise six (6) individuals: Martin Kyalo (CEO), Njeri Njoroge (COO), Eugene Shadrack (CIO), Mark Katana (CSWO), Roy Okola Otieno (Head of Design), Roy John (Design Assistant).</p>
              </PreviewSect>
              <PreviewSect title="ARTICLE X: EXECUTIVE COMMITMENT PLEDGE">
                <blockquote style={{ borderLeft: "4px solid #1A5C38", paddingLeft: "1.25rem", fontStyle: "italic", color: "#444" }}>
                  &ldquo;I commit to serve the mission of Greenwave Society with integrity, consistency, and purpose. I will attend every scheduled Executive Meeting, communicate proactively and in advance when genuinely unable to attend, and at all times uphold the values, ethical standards, and accountability obligations set forth in this Constitution.&rdquo;
                </blockquote>
              </PreviewSect>
              <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">Full constitution articles V through IX appear on the actual sign page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function PreviewSect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontWeight: "bold", fontSize: "12px", color: "#1A5C38", borderBottom: "2px solid #1A5C38", paddingBottom: "3px", marginBottom: "10px", letterSpacing: "0.04em" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
    </div>
  );
}

function VersionEditor({ existing, onSaved, onCancel }: {
  existing: Version[];
  onSaved: (v: Version) => void;
  onCancel: () => void;
}) {
  const [tag, setTag]         = useState("V" + (existing.length + 1));
  const [title, setTitle]     = useState("Executive Leadership Constitution");
  const [content, setContent] = useState("");
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text   = await file.text();
    const isHtml = text.trim().startsWith("<");
    setContent(isHtml ? text : '<pre style="white-space:pre-wrap;font-family:inherit">' + text.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>");
  }

  async function save() {
    if (!content.trim()) { setErr("Content cannot be empty."); return; }
    setSaving(true); setErr("");
    try {
      const res  = await fetch("/api/admin/constitution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionTag: tag, title, content, contentType: "html" }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to save"); return; }
      onSaved(data.version);
    } catch {
      setErr("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-[#1A5C38]">New Constitution Version</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Version Tag</label>
          <input value={tag} onChange={e => setTag(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">Document Content (HTML or plain text)</label>
          <button onClick={() => fileRef.current?.click()}
            className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg border border-gray-300 transition-colors">
            Upload .txt / .html
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".txt,.html,.htm" className="hidden" onChange={handleFile} />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          placeholder="Paste HTML or plain text here, or upload a file above..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5C38] resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">HTML renders as-is on the sign page. Plain text is wrapped automatically.</p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <button onClick={save} disabled={saving || !content.trim()}
          className="bg-[#1A5C38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d2f] disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save as Draft"}
        </button>
        <button onClick={onCancel}
          className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
export default function ConstitutionDashboard({
  leaders, versions: initVers, currentEmail, superAdmin,
  subscribers, adminUsers, dbStats, auditLogs,
}: Props) {
  const router                      = useRouter();
  const [tab, setTab]               = useState<"constitution"|"newsletter"|"accounts"|"activity"|"database">("constitution");
  const [versions, setVersions]     = useState<Version[]>(initVers);
  const [showEditor, setShowEditor] = useState(false);
  const [preview, setPreview]       = useState<Version | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [unsigning, setUnsigning]   = useState<string | null>(null);
  const [toast, setToast]           = useState("");
  const [loadingId, setLoadingId]   = useState<string | null>(null);

  const activeVer  = versions.find(v => v.status === "published");
  const TOTAL      = 6;
  const activeSigs = activeVer?.signatures ?? [];
  const signed     = activeSigs.filter(s => s.status === "signed").length;
  const pending    = activeSigs.filter(s => s.status === "pending").length;
  const rejected   = activeSigs.filter(s => s.status === "rejected").length;

  function getActiveSig(l: Leader): Signature | undefined {
    return activeVer ? l.signatures.find(s => s.versionId === activeVer.id) ?? l.signatures[0] : l.signatures[0];
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function publishVersion(id: string) {
    setPublishing(id);
    try {
      const res = await fetch("/api/admin/constitution/" + id + "/publish", { method: "POST" });
      const d   = await res.json();
      if (res.ok) { showToast(d.versionTag + " published. Invites sent!"); router.refresh(); }
      else showToast(d.error ?? "Failed to publish");
    } catch { showToast("Network error"); } finally { setPublishing(null); }
  }

  async function unsignSig(sigId: string, vId: string) {
    if (!confirm("Reset this signature to pending? The leader will need to sign again.")) return;
    setUnsigning(sigId);
    try {
      const res = await fetch("/api/admin/constitution/" + vId + "/unsign/" + sigId, { method: "POST" });
      if (res.ok) { showToast("Signature reset to pending."); router.refresh(); }
      else showToast("Failed to unsign");
    } catch { showToast("Network error"); } finally { setUnsigning(null); }
  }

  async function sendInvite(leaderId: string) {
    setLoadingId(leaderId);
    try {
      const res = await fetch("/api/admin/send-invite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId }),
      });
      const d = await res.json();
      if (res.ok) { showToast("Invite sent to " + (d.name ?? "leader")); router.refresh(); }
      else showToast(d.error ?? "Failed");
    } catch { showToast("Network error"); } finally { setLoadingId(null); }
  }

  function exportCSV() {
    const rows: string[][] = [["Name","Role","Email","Version","Status","Signed At","IP"]];
    leaders.forEach(l => {
      const s = getActiveSig(l);
      rows.push([l.name, l.role, l.email, s?.versionTag ?? "", s?.status ?? "no_invite", s?.signedAt ? fmtDate(s.signedAt) : "", s?.ipAddress ?? ""]);
    });
    const csv = rows.map(r => r.map(c => '"' + c + '"').join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "signatures.csv"; a.click();
  }

  const TABS = [
    { key: "constitution", label: "Constitution" },
    { key: "newsletter",   label: "Newsletter" },
    { key: "accounts",     label: "Accounts" },
    ...(superAdmin ? [{ key: "activity", label: "Activity" }, { key: "database", label: "Database" }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-[oklch(0.975_0.015_85)]">
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#1A5C38] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}
      {preview && <PreviewModal v={preview} onClose={() => setPreview(null)} />}

      <header className="bg-[#1A5C38] text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Greenwave Society" className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-bold font-serif tracking-wide">GREENWAVE SOCIETY</p>
              <p className="text-green-200 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-200 text-xs hidden sm:block">{currentEmail}</span>
            {superAdmin && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">SUPER ADMIN</span>}
            <form action="/api/admin/logout" method="POST">
              <button className="text-green-200 hover:text-white text-xs border border-green-600 px-3 py-1.5 rounded-lg transition-colors">Logout</button>
            </form>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-6 overflow-x-auto">
          {([["bg-green-500", signed, "Signed"], ["bg-amber-400", pending, "Pending"], ["bg-red-400", rejected, "Declined"]] as [string, number, string][]).map(([color, n, label]) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <span className={"w-2 h-2 rounded-full " + color} />
              <span className="text-xs text-gray-600"><strong className="text-gray-900">{n}</strong> {label}</span>
            </div>
          ))}
          <div className="h-4 w-px bg-gray-200 shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Active: <strong className="text-[#1A5C38]">{activeVer?.versionTag ?? "None"}</strong></span>
          <div className="flex items-center gap-2 min-w-28 shrink-0">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: (signed / TOTAL * 100) + "%" }} />
            </div>
            <span className="text-xs text-gray-400">{signed}/{TOTAL}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (tab === t.key ? "bg-[#1A5C38] text-white" : "text-gray-600 hover:bg-gray-100")}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "constitution" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Constitution Versions</h2>
                <button onClick={() => setShowEditor(e => !e)} className="bg-[#1A5C38] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#154d2f] transition-colors font-medium">+ New Version</button>
              </div>
              {showEditor && (
                <div className="p-6 border-b border-gray-100">
                  <VersionEditor existing={versions}
                    onSaved={v => { setVersions(p => [v, ...p]); setShowEditor(false); showToast(v.versionTag + " saved as draft"); }}
                    onCancel={() => setShowEditor(false)} />
                </div>
              )}
              {versions.length === 0 ? (
                <p className="px-6 py-10 text-center text-gray-400 text-sm">No versions yet. Create one above and publish it to send signing invites.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {versions.map(v => {
                    const vSigned  = v.signatures.filter(s => s.status === "signed").length;
                    const vPending = v.signatures.filter(s => s.status === "pending").length;
                    return (
                      <div key={v.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#1A5C38] text-sm w-8">{v.versionTag}</span>
                          <VerBadge s={v.status} />
                          <span className="text-xs text-gray-500 hidden sm:block">{v.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {v.signatures.length > 0 && <span>{vSigned}/{TOTAL} signed &bull; {vPending} pending</span>}
                          <span>Created {fmtDate(v.createdAt)}</span>
                          {v.publishedAt && <span>Published {fmtDate(v.publishedAt)}</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPreview(v)} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:border-[#1A5C38] hover:text-[#1A5C38] transition-colors">Preview</button>
                          {v.status !== "published" && (
                            <button onClick={() => publishVersion(v.id)} disabled={publishing === v.id}
                              className="text-xs bg-[#1A5C38] text-white px-3 py-1.5 rounded-lg hover:bg-[#154d2f] disabled:opacity-50 transition-colors">
                              {publishing === v.id ? "Publishing..." : "Publish & Send Invites"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  Leader Signatures{activeVer && <span className="ml-2 text-sm font-normal text-gray-400">({activeVer.versionTag})</span>}
                </h2>
                <button onClick={exportCSV} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:border-[#1A5C38] hover:text-[#1A5C38] transition-colors">Export CSV</button>
              </div>
              {!activeVer ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">No published version. Publish a version to start collecting signatures.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {["Leader","Status","Signed","IP","Invite Sent","Actions"].map(h => <th key={h} className="text-left px-6 py-3">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaders.map(l => {
                        const s = getActiveSig(l);
                        return (
                          <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4"><p className="font-medium text-gray-900">{l.name}</p><p className="text-xs text-gray-500">{l.role}</p></td>
                            <td className="px-6 py-4">{s ? <StatusBadge s={s.status} /> : <span className="text-xs text-gray-400">No invite</span>}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{fmtDate(s?.signedAt ?? null)}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{s?.ipAddress ?? "n/a"}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{fmtDate(s?.emailSentAt ?? null)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                {s && <>
                                  <button onClick={() => window.open("/sign/" + s.token, "_blank")}
                                    className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded hover:border-gray-400 transition-colors">View</button>
                                  <button onClick={() => sendInvite(l.id)} disabled={loadingId === l.id}
                                    className="text-xs border border-[#1A5C38] text-[#1A5C38] px-2 py-1 rounded hover:bg-[#1A5C38] hover:text-white disabled:opacity-50 transition-colors">
                                    {loadingId === l.id ? "..." : "Resend"}
                                  </button>
                                  {superAdmin && s.status === "signed" && (
                                    <button onClick={() => unsignSig(s.id, s.versionId ?? "")} disabled={unsigning === s.id}
                                      className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 transition-colors">
                                      {unsigning === s.id ? "..." : "Unsign"}
                                    </button>
                                  )}
                                </>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "newsletter" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Newsletter Subscribers</h2>
              <span className="text-sm text-gray-500">{subscribers.length} total</span>
            </div>
            {subscribers.length === 0 ? <p className="px-6 py-8 text-gray-400 text-sm text-center">No subscribers yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">{["#","Email","Subscribed"].map(h=><th key={h} className="text-left px-6 py-3">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscribers.map((sub,i)=><tr key={sub.id} className="hover:bg-gray-50"><td className="px-6 py-3 text-gray-400">{i+1}</td><td className="px-6 py-3">{sub.email}</td><td className="px-6 py-3 text-gray-500">{fmtDate(sub.createdAt)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "accounts" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Admin Users</h2>
              <p className="text-xs text-gray-500 mt-0.5">Only allow-listed emails can log in.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">{["Email","Password","Created"].map(h=><th key={h} className="text-left px-6 py-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {adminUsers.map(u=>(
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900 flex items-center gap-2">
                        {u.email}{u.email===currentEmail&&<span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">You</span>}
                      </td>
                      <td className="px-6 py-3">{u.passwordHash?<span className="text-green-600 text-xs font-semibold">Set</span>:<span className="text-amber-500 text-xs font-semibold">Not set</span>}</td>
                      <td className="px-6 py-3 text-gray-500">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "activity" && superAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Audit Log</h2>
              <span className="text-xs text-gray-400">Last 100 events</span>
            </div>
            {auditLogs.length===0?<p className="px-6 py-8 text-gray-400 text-sm text-center">No activity yet.</p>:(
              <div className="divide-y divide-gray-100">
                {auditLogs.map(log=>(
                  <div key={log.id} className="px-6 py-3 flex items-start gap-4">
                    <span className="text-xs text-gray-400 shrink-0 w-36 mt-0.5">{fmtDT(log.createdAt)}</span>
                    <div className="flex-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded mr-2">{log.action}</span>
                      <span className="text-sm text-gray-600">{log.detail??""}</span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{log.actor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "database" && superAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900">Database Statistics</h2></div>
            <div className="divide-y divide-gray-100">
              {dbStats.map(s=>(
                <div key={s.table} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.table}</span>
                  <span className="font-bold text-gray-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}