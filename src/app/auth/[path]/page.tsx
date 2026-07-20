import Link from "next/link";
import { AuthView } from "@neondatabase/auth-ui";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient backdrop blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Greenwave Society Logo"
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-2xl font-serif font-black tracking-tight text-foreground">
              Green<span className="text-primary font-normal">wave</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign in to access your Greenwave account & member portal
          </p>
        </div>

        <div className="bg-card border border-border/60 shadow-xl rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <AuthView pathname={path} />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
