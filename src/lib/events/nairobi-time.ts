// Events are scheduled in Africa/Nairobi, which is UTC+03:00 all year (no daylight saving), so a
// fixed offset converts between stored UTC instants and the date and time admins type in.
const NAIROBI_OFFSET = "+03:00";
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;

export function toNairobiParts(value: Date | string | null | undefined): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const shifted = new Date(new Date(value).getTime() + NAIROBI_OFFSET_MS).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

export function fromNairobiParts(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const result = new Date(`${date}T${time}:00${NAIROBI_OFFSET}`);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function formatNairobi(value: Date | string, options: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "short" }): string {
  return new Date(value).toLocaleString("en-KE", { timeZone: "Africa/Nairobi", ...options });
}
