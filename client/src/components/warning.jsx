import React from 'react';
import styles from './warning.module.css';

export default function Warning() {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    return visible ? (
        <div className={styles.warningBox}>
            ⚠️ Refreshing is not allowed. If you refresh, you may lose progress.
        </div>
    ) : null;
};