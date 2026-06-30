import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { Separator } from "./ui/separator";
import { XIcon, InstagramIcon, FacebookIcon } from "./SocialIcon";
import { AdBanner } from "./ads";

const footerLinks = [
  {
    title: "Browse",
    links: [
      { label: "Home", to: "/" },
      { label: "Servers", to: "/servers" },
      { label: "Movies", to: "/movies" },

    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Anime Sources", to: "/category/Anime" },
      { label: "Asian Drama", to: "/category/AsianDrama" },
      { label: "All Sources", to: "/category/all" },
      { label: "Search", to: "/search" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "#" },
      { label: "Terms of Service", to: "#" },
      { label: "Cookie Policy", to: "#" },
      { label: "DMCA", to: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-primary">Portal</span>
                <span className="text-foreground">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Indonesian streaming source catalog. Discover and explore streaming providers from across the web.
            </p>
            <div className="flex gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                aria-label="X (Twitter)"
              >
                <XIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center py-4">
          <AdBanner type="468x60" />
        </div>

        <Separator className="bg-border/50 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} PortalHub Cinema. All rights reserved.
          </p>
          <p className="text-center">
            For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
