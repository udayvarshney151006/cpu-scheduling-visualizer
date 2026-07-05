import { useState, useEffect } from 'react'
import { simulate } from './scheduler'

const ALGOS = [
  "FCFS",
  "SJF (Non-Preemptive)",
  "SRTF (Preemptive)",
  "Round Robin",
  "Priority (Non-Preemptive)",
  "Priority (Preemptive)",
  "Multilevel Queue",
]

const ALGO_MAP = {
  "FCFS":                      "First-Come, First-Served (FCFS)",
  "SJF (Non-Preemptive)":      "Shortest Job First (SJF) - Non-Preemptive",
  "SRTF (Preemptive)":         "Shortest Remaining Time First (SRTF) - Preemptive",
  "Round Robin":               "Round Robin (RR)",
  "Priority (Non-Preemptive)": "Priority Scheduling - Non-Preemptive",
  "Priority (Preemptive)":     "Priority Scheduling - Preemptive",
  "Multilevel Queue":          "Multilevel Queue",
}

const ALGO_DESC = {
  "FCFS":                      "Processes run in order of arrival. Simple but can cause long waits.",
  "SJF (Non-Preemptive)":      "Shortest burst time runs next. Minimizes average wait.",
  "SRTF (Preemptive)":         "Preemptive SJF — switches to a shorter job when one arrives.",
  "Round Robin":               "Each process gets a fixed time slice (quantum) in turns.",
  "Priority (Non-Preemptive)": "Highest priority process runs to completion first.",
  "Priority (Preemptive)":     "Can preempt a running process if a higher priority one arrives.",
  "Multilevel Queue":          "Processes grouped by priority into separate queues.",
}

const COLORS = [
  { bg: '#3b82f6', light: '#eff6ff', text: '#1d4ed8' },
  { bg: '#10b981', light: '#ecfdf5', text: '#065f46' },
  { bg: '#f59e0b', light: '#fffbeb', text: '#92400e' },
  { bg: '#ef4444', light: '#fef2f2', text: '#991b1b' },
  { bg: '#8b5cf6', light: '#f5f3ff', text: '#5b21b6' },
  { bg: '#ec4899', light: '#fdf2f8', text: '#9d174d' },
  { bg: '#14b8a6', light: '#f0fdfa', text: '#134e4a' },
  { bg: '#f97316', light: '#fff7ed', text: '#9a3412' },
]

const colorMap = {}
let ci = 0
const gc = (id) => {
  if (!colorMap[id]) colorMap[id] = COLORS[ci % COLORS.length]
  ci++
  return colorMap[id]
}

const DEFAULTS = [
  { id: 'P1', arrival: 2, burst: 3, priority: 2 },
  { id: 'P2', arrival: 0, burst: 3, priority: 1 },
  { id: 'P3', arrival: 4, burst: 2, priority: 3 },
]
DEFAULTS.forEach(p => gc(p.id))

export default function App() {
  const [algo, setAlgo]     = useState('Priority (Preemptive)')
  const [tq, setTq]         = useState(2)
  const [procs, setProcs]   = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [hovBar, setHovBar] = useState(null)
  const [simKey, setSimKey] = useState(0)

  const [nid, setNid]   = useState('P4')
  const [nArr, setNArr] = useState(0)
  const [nBst, setNBst] = useState(1)
  const [nPri, setNPri] = useState(1)
  const [err, setErr]   = useState('')

  const runSim = () => {
    setResult(simulate(ALGO_MAP[algo], procs, tq))
    setSimKey(k => k + 1)
  }
  useEffect(runSim, [])

  const addRow = () => {
    if (!nid.trim())                   { setErr('Process ID required'); return }
    if (procs.find(r => r.id === nid)) { setErr(`${nid} already exists`); return }
    if (nBst < 1)                      { setErr('Burst time must be ≥ 1'); return }
    gc(nid)
    setProcs(ps => [...ps, { id: nid, arrival: nArr, burst: nBst, priority: nPri }])
    setNid(`P${procs.length + 2}`)
    setErr('')
  }

  const total = result?.ganttChart.at(-1)?.end ?? 0

  // Shared styles
  const panel = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  }

  const inputStyle = {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 7,
    padding: '7px 10px',
    fontSize: '0.82rem',
    color: '#111827',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', paddingBottom: 80 }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
              CPU Scheduling Visualizer
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 1 }}>
              Operating Systems — Process Scheduler
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {procs.map(p => {
              const c = gc(p.id)
              return (
                <span key={p.id} title={`${p.id}: Arrival ${p.arrival}, Burst ${p.burst}`}
                  style={{
                    padding: '3px 9px', borderRadius: 99,
                    background: c.light, color: c.text,
                    fontSize: '0.7rem', fontWeight: 600,
                    border: `1px solid ${c.bg}33`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                  {p.id}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}>

        {/* ── ALGORITHM + SIMULATE ────────────────────────── */}
        <div style={{ ...panel, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Scheduling Algorithm
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={algo}
                  onChange={e => setAlgo(e.target.value)}
                  style={{ ...inputStyle, background: '#fff', paddingRight: 32, cursor: 'pointer' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {ALGOS.map(a => <option key={a}>{a}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', fontSize: '0.6rem' }}>▾</span>
              </div>
              {/* Algorithm description */}
              <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 6 }}>
                {ALGO_DESC[algo]}
              </p>
            </div>

            {algo === 'Round Robin' && (
              <div style={{ width: 130, flexShrink: 0 }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Time Quantum
                </label>
                <input type="number" min={1} value={tq}
                  onChange={e => setTq(+e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            )}

            <button onClick={runSim} style={{
              padding: '8px 24px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '0.84rem', fontWeight: 600,
              cursor: 'pointer', flexShrink: 0, letterSpacing: '-0.01em',
              transition: 'background 0.15s, transform 0.1s, box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(37,99,235,0.3)' }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Simulate
            </button>
          </div>
        </div>

        {/* ── PROCESS TABLE ───────────────────────────────── */}
        <div style={{ ...panel, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>Process Queue</span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 99, padding: '2px 10px' }}>
              {procs.length} process{procs.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Process', 'Arrival Time', 'Burst Time', 'Priority', ''].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {procs.map((p, i) => {
                const c = gc(p.id)
                return (
                  <tr key={p.id} className="fade-up"
                    style={{ borderBottom: '1px solid #f9fafb', animationDelay: `${i * 30}ms`, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.bg, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 0 3px ${c.light}` }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: '#111827' }}>{p.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#374151' }}>{p.arrival}</td>
                    <td style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#374151' }}>{p.burst}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: c.light, color: c.text, fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                        {p.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button onClick={() => setProcs(ps => ps.filter(x => x.id !== p.id))}
                        style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', color: '#d1d5db', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 5, transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = '#fef2f2' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'none' }}
                      >Remove</button>
                    </td>
                  </tr>
                )
              })}

              {/* Add row */}
              <tr style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 16px' }}>
                  <input value={nid} onChange={e => setNid(e.target.value)} placeholder="P4"
                    style={{ ...inputStyle, width: 72, fontFamily: "'JetBrains Mono', monospace" }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620'; e.currentTarget.style.background = '#fff' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb' }}
                    onKeyDown={e => e.key === 'Enter' && addRow()}
                  />
                </td>
                {[
                  { val: nArr, set: setNArr },
                  { val: nBst, set: setNBst },
                  { val: nPri, set: setNPri },
                ].map(({ val, set }, i) => (
                  <td key={i} style={{ padding: '10px 16px' }}>
                    <input type="number" min={i === 1 ? 1 : 0} value={val} onChange={e => set(+e.target.value)}
                      style={{ ...inputStyle, width: 80, fontFamily: "'JetBrains Mono', monospace" }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620'; e.currentTarget.style.background = '#fff' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb' }}
                    />
                  </td>
                ))}
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                  <button onClick={addRow}
                    style={{ padding: '6px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500, color: '#374151', cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#2563eb' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#d1d5db' }}
                  >+ Add</button>
                </td>
              </tr>
            </tbody>
          </table>
          {err && <p style={{ padding: '6px 20px 12px', fontSize: '0.72rem', color: '#ef4444' }}>{err}</p>}
        </div>

        {/* ── GANTT CHART ─────────────────────────────────── */}
        {result && result.ganttChart.length > 0 && (
          <div style={{ ...panel, padding: '22px 24px', marginBottom: 20 }} key={`gantt-${simKey}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>Gantt Chart</span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: 10 }}>
                  {algo} · {total} ms total · {result.ganttChart.length} blocks
                </span>
              </div>
              {/* Mini legend */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[...new Set(result.ganttChart.map(b => b.process))].map(pid => {
                  const c = gc(pid)
                  return (
                    <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.bg, display: 'inline-block' }} />
                      <span style={{ fontSize: '0.68rem', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>{pid}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 500 }}>
                {/* Bars */}
                <div style={{ display: 'flex', height: 64, gap: 3, marginBottom: 8 }}>
                  {result.ganttChart.map((b, i) => {
                    const c = gc(b.process)
                    const w = ((b.end - b.start) / total) * 100
                    const isH = hovBar === i
                    return (
                      <div key={`${b.process}-${i}`} className="bar-grow"
                        style={{
                          width: `${w}%`, minWidth: 32, flexShrink: 0,
                          background: isH ? c.bg : c.bg,
                          opacity: isH ? 1 : 0.88,
                          borderRadius: 7,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          cursor: 'default', position: 'relative',
                          animationDelay: `${i * 60}ms`,
                          transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
                          transform: isH ? 'translateY(-3px) scaleY(1.04)' : 'none',
                          boxShadow: isH ? `0 6px 16px ${c.bg}55` : `0 1px 3px ${c.bg}33`,
                        }}
                        onMouseEnter={() => setHovBar(i)}
                        onMouseLeave={() => setHovBar(null)}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>{b.process}</span>
                        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{b.end - b.start}ms</span>

                        {isH && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 8px)',
                            background: '#111827', color: '#f9fafb',
                            fontSize: '0.68rem', padding: '5px 10px',
                            borderRadius: 6, whiteSpace: 'nowrap',
                            pointerEvents: 'none', zIndex: 20,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          }}>
                            <b style={{ fontFamily: "'JetBrains Mono', monospace" }}>{b.process}</b>
                            &nbsp;·&nbsp; {b.start}ms → {b.end}ms &nbsp;·&nbsp; {b.end - b.start}ms burst
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Time axis */}
                <div style={{ position: 'relative', height: 20, borderTop: '1px solid #f3f4f6' }}>
                  <Tick label="0" pct={0} />
                  {result.ganttChart.map((b, i) => (
                    <Tick key={i} label={String(b.end)} pct={(b.end / total) * 100} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ─────────────────────────────────────── */}
        {result && result.metrics.length > 0 && (
          <div style={{ ...panel, overflow: 'hidden' }} key={`results-${simKey}`}>
            {/* Stats header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 0 }}>
              <div style={{ flex: 1, paddingRight: 24, borderRight: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em', marginBottom: 4 }}>AVG WAIT TIME</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2563eb', letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {result.averages.avgWait.toFixed(2)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>ms</span>
                </p>
              </div>
              <div style={{ flex: 1, paddingLeft: 24, paddingRight: 24, borderRight: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em', marginBottom: 4 }}>AVG TURNAROUND</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {result.averages.avgTurnaround.toFixed(2)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>ms</span>
                </p>
              </div>
              <div style={{ flex: 1, paddingLeft: 24 }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em', marginBottom: 4 }}>CPU UTILIZATION</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {total > 0 ? ((procs.reduce((s, p) => s + p.burst, 0) / total) * 100).toFixed(1) : '—'}
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9ca3af', marginLeft: 2 }}>%</span>
                </p>
              </div>
            </div>

            {/* Per-process table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Process', 'Priority', 'Arrival', 'Burst', 'Wait Time', 'Turnaround'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((row, i) => {
                  const c = gc(row.id)
                  return (
                    <tr key={row.id} className="fade-up"
                      style={{ borderBottom: '1px solid #f9fafb', animationDelay: `${i * 40}ms`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.bg, flexShrink: 0, boxShadow: `0 0 0 3px ${c.light}` }} />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#111827' }}>{row.id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: c.light, color: c.text, fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>{row.priority}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#6b7280' }}>{row.arrival}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#6b7280' }}>{row.burst}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#111827' }}>{row.waitTime}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#111827' }}>{row.turnaroundTime}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!result && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏱</div>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6b7280' }}>Ready to simulate</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Configure your processes and click Simulate</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Tick({ label, pct }) {
  return (
    <span style={{
      position: 'absolute', left: `${pct}%`,
      transform: 'translateX(-50%)', top: 5,
      fontSize: '0.62rem', color: '#9ca3af',
      fontFamily: "'JetBrains Mono', monospace",
    }}>{label}</span>
  )
}
