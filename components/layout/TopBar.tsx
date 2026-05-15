"use client";

import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * TopBar — shown only on mobile (md:hidden).
 * On desktop the sidebar handles all navigation.
 */
export default function TopBar() {
  const pathname = usePathname();
  const notifHref = "/notifications";

  return (
    <header className="md:hidden bg-surface-container-lowest sticky top-0 z-30 ghost-border border-t-0 border-x-0">
      <div className="flex justify-end items-center w-full px-6 py-3">
        {/* Actions only — no logo (logo is in sidebar) */}
        <div className="flex items-center gap-2">
          <Link
            href={notifHref}
            aria-label="Notifications"
            className={`relative p-2 rounded-full transition-colors ${
              pathname === "/notifications"
                ? "bg-primary-fixed text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <Icon name="notifications" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full" />
          </Link>
          <button
            aria-label="User Account"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full"
          >
            <Icon name="account_circle" />
          </button>
        </div>
      </div>
    </header>
  );
}
