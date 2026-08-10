"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <nav className="flex px-4 py-3 text-sm text-gray-500 bg-gray-50/50 rounded-lg" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          
          // Capitalize first letter and replace dashes with spaces
          const title = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <li key={href}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                {isLast ? (
                  <span className="text-gray-900 font-medium" aria-current="page">
                    {title}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    {title}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
