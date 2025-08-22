"use client";
import useSWR from "swr";
import { motion } from "framer-motion";
import styles from './leaderboard.module.css';
import GameLayout from "@/components/GameLayout";

const fetcher = (url) => fetch(url).then((res) => res.json());

const PodiumCard = ({ player, rank, style }) => {
  const medal = ["🥇", "🥈", "🥉"][rank - 1];
  return (
    <motion.div
      className={`${styles.podiumCard} ${style}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }}
    >
      <div className={styles.medal}>{medal}</div>
      <div className={styles.podiumName}>{player.name}</div>
      <div className={styles.podiumScore}>{player.score} pts</div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { data: players, error, isLoading } = useSWR(
    "/api/leaderboard",
    fetcher,
    { refreshInterval: 5000 }
  );

  if (isLoading) return <div className={styles.loading}>Loading Leaderboard...</div>;
  if (error) return <div className={styles.error}>Failed to load leaderboard.</div>;
  if (!players || players.length === 0) {
    return <div className={styles.loading}>No players yet.</div>;
  }

  const topThree = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <GameLayout>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1>🏆 Leaderboard</h1>
        <div className={styles.podium}>
          {topThree.length > 1 && <PodiumCard player={topThree[1]} rank={2} style={styles.silver} />}
          {topThree.length > 0 && <PodiumCard player={topThree[0]} rank={1} style={styles.gold} />}
          {topThree.length > 2 && <PodiumCard player={topThree[2]} rank={3} style={styles.bronze} />}
        </div>
        <table className={styles.table}>
          <tbody>
            {rest.map((p, i) => (
              <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td className={styles.rank}>{i + 4}</td>
                <td className={styles.name}>{p.name}</td>
                <td className={styles.score}>{p.score} pts</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </GameLayout>
  );
}