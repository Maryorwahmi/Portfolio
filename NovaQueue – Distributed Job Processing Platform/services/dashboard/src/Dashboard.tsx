/**
 * NovaQueue Dashboard
 * Author: CaptainCode | Company: NovaCore Systems
 * 
 * Real-time monitoring and management UI for the job queue system
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface QueueStats {
  name: string;
  pending: number;
  dlq: number;
}

interface SystemStats {
  total_jobs: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
}

export function Dashboard() {
  const [queueStats, setQueueStats] = useState<QueueStats[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/queues`);

      if (response.data.success) {
        setQueueStats(response.data.data.queues || []);
        setSystemStats(response.data.data.system);
        setError(null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>NovaQueue Dashboard</h1>
        <p style={styles.subtitle}>Built with ❤️ by CaptainCode | NovaCore Systems</p>
      </header>

      {error && <div style={styles.error}>Error: {error}</div>}

      {loading && <div style={styles.loading}>Loading...</div>}

      {!loading && (
        <>
          {/* System Stats */}
          {systemStats && (
            <section style={styles.section}>
              <h2>System Statistics</h2>
              <div style={styles.statsGrid}>
                <StatCard label="Total Jobs" value={systemStats.total_jobs} color="#3498db" />
                <StatCard label="Completed" value={systemStats.completed} color="#27ae60" />
                <StatCard label="Failed" value={systemStats.failed} color="#e74c3c" />
                <StatCard label="Processing" value={systemStats.processing} color="#f39c12" />
                <StatCard label="Pending" value={systemStats.pending} color="#9b59b6" />
              </div>
            </section>
          )}

          {/* Queue Stats */}
          <section style={styles.section}>
            <h2>Queue Status</h2>
            <div style={styles.table}>
              <div style={styles.tableHead}>
                <div style={styles.tableCell}>Queue Name</div>
                <div style={styles.tableCell}>Pending</div>
                <div style={styles.tableCell}>Dead Letter Queue</div>
              </div>
              {queueStats.map(queue => (
                <div key={queue.name} style={styles.tableRow}>
                  <div style={styles.tableCell}>{queue.name}</div>
                  <div style={styles.tableCell}>{queue.pending}</div>
                  <div style={styles.tableCell}>{queue.dlq}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <footer style={styles.footer}>
        <p>NovaQueue v2.0.0 | Distributed Job Processing Platform</p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div style={{ ...styles.statCard, borderLeftColor: color }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color }}>{value.toLocaleString()}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '40px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  subtitle: {
    margin: '10px 0 0',
    opacity: 0.9,
    fontSize: '14px'
  },
  section: {
    marginBottom: '30px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '4px solid',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#7f8c8d',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  table: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    background: '#f8f9fa',
    fontWeight: '600',
    borderBottom: '2px solid #e9ecef'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    borderBottom: '1px solid #e9ecef',
    ':hover': { backgroundColor: '#f8f9fa' }
  },
  tableCell: {
    padding: '15px',
    borderRight: '1px solid #e9ecef'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#7f8c8d',
    fontSize: '12px',
    marginTop: '40px'
  }
};

export default Dashboard;
