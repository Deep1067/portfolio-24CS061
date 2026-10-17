/**
 * PerformanceMetricsChart.jsx – Practical 8: Lazy-loaded Heavy Component
 * Student: Deep Patel | Roll No: 24CS061 | CHARUSAT / CSPIT
 *
 * Demonstrates component-level code splitting using React.lazy() and Suspense.
 * Visualizes load times, chunk splitting metrics, and task analytics.
 */
import { useState } from 'react';

export default function PerformanceMetricsChart({ taskCount = 7 }) {
  const [activeMetric, setActiveMetric] = useState('bundles');

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '20px',
        background: 'var(--color-surface, #1e293b)',
        border: '1px solid var(--color-border, #334155)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text, #f8fafc)' }}>
            ⚡ Performance Profiler &amp; Metrics (Lazy Loaded Chunk)
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted, #94a3b8)' }}>
            Demonstrates Supplementary Problem: component-level lazy loading loaded on demand
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveMetric('bundles')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #334155)',
              background: activeMetric === 'bundles' ? 'var(--color-primary, #6366f1)' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Chunk Splitting
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('tasks')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #334155)',
              background: activeMetric === 'tasks' ? 'var(--color-primary, #6366f1)' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Task Distribution
          </button>
        </div>
      </div>

      {activeMetric === 'bundles' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baseline Monolithic JS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171' }}>307.7 kB</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Loaded all upfront</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Code-Split Initial Entry</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>Reduced Entry</div>
            <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Route chunks on demand</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Network Strategy</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>Route Chunks</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>5 discrete dynamic modules</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <span>Active Tasks in Memory:</span>
            <strong>{taskCount} Documents</strong>
          </div>
          <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)' }} />
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
            Loaded asynchronously via lazy-split bundle.
          </div>
        </div>
      )}
    </div>
  );
}
