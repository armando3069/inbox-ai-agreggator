"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Inbox,
  Users,
  Bot,
  Cable,
  TrendingUp,
  LogOut,
  Bell,
  BellOff,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { requestNotificationPermission, getNotificationPermission } from "@/lib/notify";

// ── Navigation config ─────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Inbox;
}

const PRIMARY_NAV: NavItem[] = [
  { id: "inbox",    label: "Inbox",        href: "/",             icon: Inbox },
  { id: "contacts", label: "Contacts",     href: "/contacts",     icon: Users },
  { id: "ai",       label: "AI Assistant",  href: "/ai-assistant", icon: Bot },
];

const SECONDARY_NAV: NavItem[] = [
  { id: "sentiment",  label: "Sentiment Analysis", href: "#",                         icon: TrendingUp },
  { id: "platforms",  label: "Manage Platforms",    href: "/connect-platforms?manage=1", icon: Cable },
];

// ── NavItemButton ─────────────────────────────────────────────────────────────

function NavItemButton({
  item,
  isActive,
  expanded,
}: {
  item: NavItem;
  isActive: boolean;
  expanded: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2.5 rounded-[var(--radius-badge)] transition-colors ${
        expanded ? "px-2.5 py-2" : "justify-center p-2.5"
      } ${
        isActive
          ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      {isActive && expanded && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent-primary)]" />
      )}
      {isActive && !expanded && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent-primary)]" />
      )}
      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
      {expanded && <span className="text-[13px]">{item.label}</span>}
    </Link>
  );

  if (!expanded) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)] animate-in fade-in-0 zoom-in-95"
          >
            {item.label}
            <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return content;
}

// ── AppSidebar ────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { expanded, toggle } = useSidebar();

  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const isActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href.split("?")[0]);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Tooltip.Provider>
      <div
        className={`flex flex-col bg-white border-r border-[var(--border-subtle)] transition-[width] duration-200 ease-in-out ${
          expanded ? "w-[240px]" : "w-[60px]"
        }`}
      >
        {/* Logo + Toggle */}
        <div className={`flex items-center ${expanded ? "justify-between px-4" : "justify-center px-2"} pt-4 pb-3`}>
          {expanded ? (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width={100}
                height={100}
                alt="logo"
                className="w-8 h-8 rounded-[var(--radius-badge)]"
              />
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Zottis</span>
            </Link>
          ) : (
            <Link href="/">
              <Image
                src="/logo.png"
                width={100}
                height={100}
                alt="logo"
                className="w-8 h-8 rounded-[var(--radius-badge)]"
              />
            </Link>
          )}
          {expanded && (
            <button
              onClick={toggle}
              className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed toggle */}
        {!expanded && (
          <div className="flex justify-center pb-2">
            <button
              onClick={toggle}
              className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Nav */}
        <div className={`flex-1 overflow-y-auto ${expanded ? "px-3" : "px-1.5"} pb-3`}>
          <div className="space-y-0.5">
            {PRIMARY_NAV.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={isActive(item)}
                expanded={expanded}
              />
            ))}
          </div>

          {/* Secondary Nav */}
          <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
            {expanded && (
              <div className="px-2.5 mb-2">
                <h3 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Tools
                </h3>
              </div>
            )}
            <div className="space-y-0.5">
              {SECONDARY_NAV.map((item) => (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={isActive(item)}
                  expanded={expanded}
                />
              ))}
            </div>

            {/* Notification status */}
            {expanded && (
              <div className="mt-3">
                <div className="border-t border-[var(--border-subtle)] pt-3">
                  {notifPermission === "unavailable" ? null : notifPermission === "granted" ? (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 text-emerald-600">
                      <Bell className="w-4 h-4" />
                      <span className="text-[12px]">Notificări active</span>
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                  ) : notifPermission === "denied" ? (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 text-[var(--text-tertiary)]">
                      <BellOff className="w-4 h-4" />
                      <span className="text-[12px]">Notificări blocate</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-badge)] text-[var(--accent-blue)] hover:bg-blue-50/60 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="text-[12px] font-medium">Activează notificările</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {!expanded && (
              <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 flex justify-center">
                {notifPermission === "unavailable" ? null : notifPermission === "granted" ? (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <div className="relative p-2.5 text-emerald-600">
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={8}
                        className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]"
                      >
                        Notificări active
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : notifPermission === "denied" ? (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <div className="p-2.5 text-[var(--text-tertiary)]">
                        <BellOff className="w-[18px] h-[18px]" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={8}
                        className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]"
                      >
                        Notificări blocate
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleEnableNotifications}
                        className="p-2.5 rounded-[var(--radius-badge)] text-[var(--accent-blue)] hover:bg-blue-50/60 transition-colors"
                      >
                        <Bell className="w-[18px] h-[18px]" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={8}
                        className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]"
                      >
                        Activează notificările
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User profile section */}
        <div className={`border-t border-[var(--border-subtle)] ${expanded ? "px-3 py-3" : "px-1.5 py-3"}`}>
          {expanded ? (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  width={32}
                  height={32}
                  alt={user?.name ?? ""}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-white">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{user?.name ?? "—"}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate">{user?.email ?? ""}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <div>
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        width={32}
                        height={32}
                        alt={user?.name ?? ""}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white">{initials}</span>
                      </div>
                    )}
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]"
                  >
                    {user?.name ?? "—"}
                    <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50/60 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]"
                  >
                    Deconectare
                    <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
