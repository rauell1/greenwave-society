export const SITE_URL = "https://greenwavesociety.org";
export const FROM_EMAIL = "Greenwave Society <info@rauell.systems>";
export const CONTACT_EMAIL = "info@rauell.systems";

const BRAND = {
  forest: "#1A5C38",
  leaf: "#5FAF2D",
  lime: "#DFF1C7",
  ink: "#173126",
  muted: "#607068",
  canvas: "#F3F7F1",
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto"><tr><td style="background:${BRAND.forest};border-radius:10px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700">${escapeHtml(label)}</a></td></tr></table>`;
}

export function emailNotice(content: string, tone: "green" | "amber" | "red" = "green"): string {
  const colors = tone === "amber"
    ? { bg: "#FFF8E8", border: "#D69A20", text: "#795816" }
    : tone === "red"
      ? { bg: "#FFF0F0", border: "#C84A4A", text: "#812D2D" }
      : { bg: "#EFF9E9", border: BRAND.leaf, text: BRAND.forest };
  return `<div style="margin:22px 0;padding:16px 18px;background:${colors.bg};border-left:4px solid ${colors.border};border-radius:8px;color:${colors.text};font-size:14px;line-height:1.65">${content}</div>`;
}

export function brandedEmail(options: {
  eyebrow: string;
  title: string;
  body: string;
  preheader?: string;
}): string {
  const preheader = escapeHtml(options.preheader ?? options.title);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.canvas};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvas};padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #DDE7DA;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(23,49,38,.08)">
        <tr><td style="height:6px;background:${BRAND.leaf};font-size:0">&nbsp;</td></tr>
        <tr><td style="background:${BRAND.forest};padding:26px 30px;text-align:center">
          <a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/logo.png" width="76" height="76" alt="Greenwave Society" style="display:block;width:76px;height:76px;margin:0 auto 12px;border-radius:16px;object-fit:cover;background:${BRAND.lime};border:2px solid rgba(255,255,255,.55)"></a>
          <p style="margin:0;color:#ffffff;font-size:19px;font-weight:800;letter-spacing:1.4px">GREENWAVE SOCIETY</p>
          <p style="margin:7px 0 0;color:${BRAND.lime};font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase">${escapeHtml(options.eyebrow)}</p>
        </td></tr>
        <tr><td style="padding:34px 34px 30px">
          <h1 style="margin:0 0 20px;color:${BRAND.ink};font-size:24px;line-height:1.25">${escapeHtml(options.title)}</h1>
          <div style="font-size:15px;line-height:1.75;color:${BRAND.ink}">${options.body}</div>
        </td></tr>
        <tr><td style="padding:20px 28px;background:#EEF5EA;border-top:1px solid #DDE7DA;text-align:center">
          <p style="margin:0 0 6px;color:${BRAND.ink};font-size:12px;font-weight:700">Greenwave Society · Nairobi, Kenya</p>
          <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.6"><a href="${SITE_URL}" style="color:${BRAND.forest};text-decoration:none">greenwavesociety.org</a> · <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.forest};text-decoration:none">${CONTACT_EMAIL}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
