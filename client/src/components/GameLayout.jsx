import styles from './GameLayout.module.css';

export default function GameLayout({ children }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}