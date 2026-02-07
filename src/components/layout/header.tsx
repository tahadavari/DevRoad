"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store";
import {
  Map,
  LogIn,
  UserPlus,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  Bell,
} from "lucide-react";

export function Header() {
  const { user, setUser, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check theme
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);

    // Fetch user session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [setUser]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const handleLogout = async () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Map className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">دوراه</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/roadmaps">
            <Button variant="ghost" size="sm">
              <Map className="h-4 w-4" />
              مسیرها
            </Button>
          </Link>
          <Link href="/forum">
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
              فوروم
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              بلاگ
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm">
              درباره ما
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {user ? (
            <>
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
              {(user.role === "ADMIN" || user.role === "MENTOR") && (
                <Link href="/admin">
                  <Button variant="ghost" size="icon">
                    <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {user.firstName}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4" />
                  ورود
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  <UserPlus className="h-4 w-4" />
                  ثبت‌نام
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          <Link
            href="/roadmaps"
            className="block"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="ghost" className="w-full justify-start">
              <Map className="h-4 w-4" />
              مسیرها
            </Button>
          </Link>
          <Link
            href="/forum"
            className="block"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="h-4 w-4" />
              فوروم
            </Button>
          </Link>
          <Link
            href="/blog"
            className="block"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="ghost" className="w-full justify-start">
              بلاگ
            </Button>
          </Link>
          <Link
            href="/about"
            className="block"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="ghost" className="w-full justify-start">
              درباره ما
            </Button>
          </Link>
          <div className="border-t pt-2 mt-2 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "حالت روشن" : "حالت تاریک"}
            </Button>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4" />
                    داشبورد
                  </Button>
                </Link>
                <Link
                  href="/messages"
                  className="block"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="h-4 w-4" />
                    پیام‌ها
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <LogIn className="h-4 w-4" />
                    ورود
                  </Button>
                </Link>
                <Link
                  href="/register"
                  className="block"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button className="w-full justify-start">
                    <UserPlus className="h-4 w-4" />
                    ثبت‌نام
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
