import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <div className="nav-logo-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                  <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              Gizmopuzzle
            </Link>
            <p className="footer-tagline">
              Free daily puzzles for everyone. Sharpen your mind with Sudoku, Word Search, Logic, and Jigsaw challenges.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-btn" title="Twitter" aria-label="Twitter">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9e9b95" strokeWidth="1.8">
                  <path d="M4 4l16 16M4 20L20 4" />
                </svg>
              </a>
              <a href="#" className="footer-social-btn" title="Instagram" aria-label="Instagram">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9e9b95" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </a>
              <a href="#" className="footer-social-btn" title="Discord" aria-label="Discord">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9e9b95" strokeWidth="1.8">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Puzzles</span>
            <ul>
              <li><Link href="/puzzles/sudoku">Sudoku</Link></li>
              <li><Link href="/puzzles/wordsearch">Word Search</Link></li>
              <li><Link href="/puzzles/logic">Logic Puzzles</Link></li>
              <li><Link href="/puzzles/jigsaw">Jigsaw</Link></li>
              <li><Link href="/">Daily Challenges</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Company</span>
            <ul>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Support</span>
            <ul>
              <li><Link href="/contact">Help Center</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} Gizmopuzzle. All rights reserved.</span>
          <ul className="footer-bottom-links">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
