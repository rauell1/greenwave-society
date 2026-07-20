import { Metadata } from "next";
import MemberPortal from "./MemberPortal";

export const metadata: Metadata = {
  title: "Member Portal | Greenwave Society",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MemberPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <MemberPortal token={token} />;
}
