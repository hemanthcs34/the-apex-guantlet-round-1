import Link from 'next/link';
import Image from 'next/image'; // It's better to use the Next.js Image component
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    // 1. The <nav> element is now the main grid container
    <nav className={styles.navbar}>

      {/* 2. Logo section for the left grid column */}
      <div className={styles.navbarLogo}>
        <Link href="/">
            <Image 
              src="/images/IEEE-LOGO.jpg" 
              alt="IEEE Logo" 
              width={42} 
              height={42} 
              style={{ objectFit: 'cover', borderRadius: '50%' }} // Making it circular looks nice
            />
        </Link>
      </div>

      {/* 3. Title section for the center grid column */}
      <div className={styles.navbarTitle}>
        <Link href="/" className={styles.titleLink}>
          🏆 The Apex Gauntlet
        </Link>
      </div>

      {/* 4. Links section for the right grid column */}
      <div className={styles.navbarLinks}>
        <Link href="/leaderboard" className={styles.link}>
          Leaderboard
        </Link>
        {/* You can add more links or buttons here */}
      </div>

    </nav>
  );
}