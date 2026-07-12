import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="container py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Lockede
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A quiet corner of the internet for notes on tech, marketing,
              URL shortening, and everyday utility tools.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About us</Link>
            <Link to="/blogs" className="text-muted-foreground hover:text-foreground">Blogs</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy policy</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact us</Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-1 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Lockede. All rights reserved.</p>
          <p>Built for readers, not algorithms.</p>
        </div>
      </div>
    </footer>
  );
}
