import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
       
        <div className={styles.logo}>
          <img src="/images/IEEE-LOGO.jpg" alt="Logo" width={42} height={42} style={{ objectFit: 'cover', display: 'block' }} />
        </div>
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
