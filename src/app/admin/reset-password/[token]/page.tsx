import ResetPasswordForm from "./ResetPasswordForm";
export const metadata = { title: "Reset Password | Greenwave Society Admin" };
export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
