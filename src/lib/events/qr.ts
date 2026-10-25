import QRCode from "qrcode";

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates a base64 Data URL for a QR code image
 */
export async function generateQrDataUrl(
  text: string,
  options?: QrCodeOptions
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options?.width || 300,
    margin: options?.margin ?? 1,
    color: {
      dark: options?.darkColor || "#0f3a22", // Emerald dark
      light: options?.lightColor || "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generates an SVG string representation of a QR code
 */
export async function generateQrSvg(
  text: string,
  options?: QrCodeOptions
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: options?.width || 300,
    margin: options?.margin ?? 1,
    color: {
      dark: options?.darkColor || "#0f3a22",
      light: options?.lightColor || "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}
