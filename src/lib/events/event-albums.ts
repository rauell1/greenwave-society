import triviaManifest from "../../../docs/trivia-photos-manifest.json";
import { TRIVIA_DATE } from "./campaign-2026";

export interface EventAlbumPhoto {
  id: string;
  index: number;
  filename: string;
  width: number;
  height: number;
  src: string;
}

export interface EventPhotoAlbum {
  title: string;
  subtitle: string;
  photos: EventAlbumPhoto[];
}

export function getEventPhotoAlbum(event: { slug: string; title: string; startsAt: Date }): EventPhotoAlbum | null {
  const nairobiDate = new Date(event.startsAt.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);
  if (/trivia/i.test(event.title) && nairobiDate === TRIVIA_DATE) {
    return {
      title: "Event Photos",
      subtitle: `${triviaManifest.length} photos from Trivia & Games Hang Out (18 Nov 2026).`,
      photos: triviaManifest as EventAlbumPhoto[],
    };
  }
  return null;
}
