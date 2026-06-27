import styles from "./PlayerPanel.module.css";

const PlayerPanel = () => {
  return (
    <div className={styles.panel}>
      <span className={styles.red}>RED</span>
      <span className={styles.blue}>BLUE</span>
      <span className={styles.green}>GREEN</span>
      <span className={styles.yellow}>YELLOW</span>
    </div>
  );
};

export default PlayerPanel;
