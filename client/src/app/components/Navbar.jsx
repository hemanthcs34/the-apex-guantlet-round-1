import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.title}>
          ⚡ The Apex Gauntlet
        </Link>
        <div className={styles.links}>
          <Link href="/leaderboard" className={styles.link}>
            Leaderboard
          </Link>
          <Link href="/admin" className={styles.link}>
            🔑 Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
