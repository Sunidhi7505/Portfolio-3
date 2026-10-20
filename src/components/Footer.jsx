import { profile } from '../data/portfolioData'

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      <a href="#home">Back to top ↑</a>
    </footer>
  )
}
