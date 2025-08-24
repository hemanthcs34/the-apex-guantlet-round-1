import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/login" className={styles.title}>🏆 The Apex Gauntlet</Link>
        <Link href="/leaderboard" className={styles.link}>
          Leaderboard
        </Link>
      </div>
    </nav>
  );
}