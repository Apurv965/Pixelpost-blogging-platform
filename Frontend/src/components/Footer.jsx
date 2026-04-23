import React from "react";

const Footer = () => {
  return (
    <footer className="pixelpost-footer">
      <div className="pixelpost-footer-socials">
        <a
          href="https://facebook.com"
          className="footer-social-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
        >
          <svg viewBox="0 0 24 24" className="footer-social-icon" aria-hidden="true">
            <path
              d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.6-1.6H16.5V5a18 18 0 0 0-2.1-.1c-2.1 0-3.5 1.3-3.5 3.7V11H8.5v3h2.4v7h2.6Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          href="https://instagram.com"
          className="footer-social-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" className="footer-social-icon" aria-hidden="true">
            <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
          </svg>
        </a>
        <a
          href="https://linkedin.com"
          className="footer-social-link"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" className="footer-social-icon" aria-hidden="true">
            <path
              d="M6.8 8.4a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2ZM5.4 18.8h2.8v-8.5H5.4v8.5Zm4.4 0h2.8V14c0-1.3.3-2.6 1.9-2.6 1.6 0 1.6 1.5 1.6 2.7v4.7H19V13.5c0-2.6-.6-4.5-3.7-4.5-1.5 0-2.4.8-2.8 1.6h-.1v-1.4H9.8c0 .9 0 1.9 0 3v6.6Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
      <p className="pixelpost-footer-copy">© PixelPost Private Limited</p>
      <div className="pixelpost-footer-links">
        <a href="/privacy.html" className="footer-link" target="_blank" rel="noreferrer">
          Privacy
        </a>
        <a href="/terms.html" className="footer-link" target="_blank" rel="noreferrer">
          Terms
        </a>
      </div>
    </footer>
  );
};

export default Footer;
