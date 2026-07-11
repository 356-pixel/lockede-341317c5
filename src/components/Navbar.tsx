import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/blogs", label: "Blogs" },
  { to: "/about", label: "About us" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/contact", label: "Contact us" },
];

function CreateLinksButton({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/create"
      className={`inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 ${className}`}
    >
      Create Links
    </Link>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      aria-label="Lockede — Home"
      className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-foreground"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">L</span>
      Lockede
    </Link>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="mt-10 flex flex-col gap-1">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.to}>
              <Link
                to={link.to}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Navbar() {
  const location = useLocation();
  // Hide navbar on bridge pages so they stay ad-focused.
  if (location.pathname.startsWith("/l/")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* Mobile: burger extreme left */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Logo: left on desktop, centered on mobile */}
        <div className="flex flex-1 justify-center md:flex-none md:justify-start">
          <Logo />
        </div>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors hover:text-foreground ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Create Links: extreme right */}
        <CreateLinksButton />
      </div>
    </header>
  );
}
