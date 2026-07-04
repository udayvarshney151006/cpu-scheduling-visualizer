import { useState, useEffect, useRef } from 'react'
import { simulate, type Process, type SchedulingResult } from './scheduler'

const ALGOS = [
  "FCFS",
  "SJF (Non-Preemptive)",
  "SRTF (Preemptive)",
  "Round Robin",
  "Priority (Non-Preemptive)",
  "Priority (Preemptive)",
  "Multilevel Queue",
]

// map short names to scheduler keys
const ALGO_MAP: Record<string, string> = {
  "FCFS":                       "First-Come, First-Served (FCFS)",
  "SJF (Non-Preemptive)":       "Shortest Job First (SJF) - Non-Preemptive",
  "SRTF (Preemptive)":          "Shortest Remaining Time First (SRTF) - Preemptive",
  "Round Robin":                "Round Robin (RR)",
  "Priority (Non-Preemptive)":  "Priority Scheduling - Non-Preemptive",
  "Priority (Preemptive)":      "Priority Scheduling - Preemptive",
  "Multilevel Queue":           "Multilevel Queue",
}

const COLORS = [
  '#2563eb','#16a34a','#d97706','#dc2626',
  '#7c3aed','#0891b2','#db2777','#65a30d',
]
const colorMap: Record<string, string> = {}
let ci = 0
const gc = (id: string) => { if (!colorMap[id]) colorMap[id] = COLORS[ci++ % COLORS.length]; return colorMap[id] }

const DEFAULTS: Process[] = [
  { id: 'P1', arrival: 2, burst: 3, priority: 2 },
  { id: 'P2', arrival: 0, burst: 3, priority: 1 },
  { id: 'P3', arrival: 4, burst: 2, priority: 3 },
]
DEFAULTS.forEach(p => gc(p.id))

export default function App() {
  const [algo, setAlgo]     = useState('Priority (Preemptive)')
  const [tq, setTq]         = useState(2)
  const [rows, setRows]     = useState<Process[]>(DEFAULTS)
  const [result, setResult] = useState<SchedulingResult | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // new row form
  const idRef       = useRef<HTMLInputElement>(null)
  const [nid, setNid]   = useState('P4')
  const [nArr, setNArr] = useState(0)
  const [nBst, setNBst] = useState(1)
  const [nPri, setNPri] = useState(1)
  const [err, setErr]   = useState('')

  const runSim = () => {
    setResult(simulate(ALGO_MAP[algo], rows, tq))
  }
  useEffect(runSim, [])

  const addRow = () => {
    if (!nid.trim())               { setErr('ID required'); return }
    if (rows.find(r => r.id===nid)){ setErr(`${nid} already exists`); return }
    if (nBst < 1)                  { setErr('Burst ≥ 1'); return }
    gc(nid)
    setRows(r => [...r, { id: nid, arrival: nArr, burst: nBst, priority: nPri }])
    setErr('')
    const next = `P${rows.length + 2}`
    setNid(next)
    idRef.current?.focus()
  }

  const deleteRow = (id: string) => setRows(r => r.filter(p => p.id !== id))

  const total = result?.ganttChart.at(-1)?.end ?? 0

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e4e4e7',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  const inp: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #d4d4d8',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: '0.82rem',
    color: '#18181b',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>

        {/* ── PAGE TITLE ─────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#18181b' }}>
            CPU Scheduling Visualizer
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: 4 }}>
            Add your processes, pick an algorithm, and hit Simulate.
          </p>
        </div>

        {/* ── CONFIG ROW ─────────────────────────────────────── */}
        <div style={{ ...card, padding: '18px 20px', marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#52525b', marginBottom: 5 }}>Algorithm</label>
            <div style={{ position: 'relative' }}>
              <select
                value={algo}
                onChange={e => setAlgo(e.target.value)}
                style={{ ...inp, paddingRight: 28, cursor: 'pointer' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
              >
                {ALGOS.map(a => <option key={a}>{a}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', pointerEvents: 'none', fontSize: '0.65rem' }}>▾</span>
            </div>
          </div>

          {algo === 'Round Robin' && (
            <div style={{ width: 120 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#52525b', marginBottom: 5 }}>Time Quantum</label>
              <input
                type="number" min={1} value={tq}
                onChange={e => setTq(+e.target.value)}
                style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
              />
            </div>
          )}

          <button
            onClick={runSim}
            style={{
              padding: '7px 20px',
              background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 6,
              fontSize: '0.84rem', fontWeight: 500,
              cursor: 'pointer', flexShrink: 0,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
          >
            Simulate
          </button>
        </div>

        {/* ── PROCESS TABLE ──────────────────────────────────── */}
        <div style={{ ...card, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>Processes</span>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>{rows.length} in queue</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                <th style={th}>Process</th>
                <th style={th}>Arrival</th>
                <th style={th}>Burst</th>
                <th style={th}>Priority</th>
                <th style={{ ...th, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: gc(p.id), display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{p.id}</span>
                    </div>
                  </td>
                  <td style={td}>{p.arrival}</td>
                  <td style={td}>{p.burst}</td>
                  <td style={td}>{p.priority}</td>
                  <td style={td}>
                    <button
                      onClick={() => deleteRow(p.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d8', fontSize: '1rem', lineHeight: 1, padding: '2px 4px', borderRadius: 4, transition: 'color 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#d4d4d8')}
                    >×</button>
                  </td>
                </tr>
              ))}

              {/* Inline add row */}
              <tr style={{ background: '#fffbeb', borderTop: '1px solid #e4e4e7' }}>
                <td style={{ padding: '8px 16px' }}>
                  <input
                    ref={idRef}
                    value={nid}
                    onChange={e => setNid(e.target.value)}
                    placeholder="P4"
                    style={{ ...inp, fontFamily: "'JetBrains Mono', monospace", width: 70 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
                    onKeyDown={e => e.key === 'Enter' && addRow()}
                  />
                </td>
                <td style={{ padding: '8px 8px 8px 16px' }}>
                  <input type="number" min={0} value={nArr} onChange={e => setNArr(+e.target.value)} style={{ ...inp, width: 70 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')} />
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <input type="number" min={1} value={nBst} onChange={e => setNBst(+e.target.value)} style={{ ...inp, width: 70 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')} />
                </td>
                <td style={{ padding: '8px 8px' }}>
                  <input type="number" min={1} value={nPri} onChange={e => setNPri(+e.target.value)} style={{ ...inp, width: 70 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')} />
                </td>
                <td style={{ padding: '8px 16px' }}>
                  <button
                    onClick={addRow}
                    style={{
                      padding: '5px 12px', background: '#f4f4f5',
                      border: '1px solid #d4d4d8', borderRadius: 5,
                      fontSize: '0.75rem', cursor: 'pointer', color: '#52525b',
                      transition: 'all 0.12s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#2563eb' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f5'; e.currentTarget.style.color = '#52525b'; e.currentTarget.style.borderColor = '#d4d4d8' }}
                  >+ Add</button>
                </td>
              </tr>
            </tbody>
          </table>
          {err && <p style={{ padding: '6px 20px 10px', fontSize: '0.72rem', color: '#ef4444' }}>{err}</p>}
        </div>

        {/* ── GANTT CHART ────────────────────────────────────── */}
        {result && result.ganttChart.length > 0 && (
          <div style={{ ...card, padding: '20px 20px 22px', marginBottom: 16 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>Gantt Chart</span>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>Total: {total} ms</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 480 }}>

                {/* Bars */}
                <div style={{ display: 'flex', height: 52, gap: 2, marginBottom: 6 }}>
                  {result.ganttChart.map((b, i) => {
                    const color = gc(b.process)
                    const w = ((b.end - b.start) / total) * 100
                    const isH = hoveredBar === i
                    return (
                      <div
                        key={`${b.process}-${i}`}
                        className="bar-animate"
                        style={{
                          width: `${w}%`, minWidth: 30, flexShrink: 0,
                          background: isH ? color : color + 'e0',
                          borderRadius: 5,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          cursor: 'default', position: 'relative',
                          animationDelay: `${i * 55}ms`,
                          outline: isH ? `2px solid ${color}` : 'none',
                          outlineOffset: 1,
                          transition: 'outline 0.1s',
                        }}
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                          {b.process}
                        </span>
                        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                          {b.end - b.start}ms
                        </span>

                        {isH && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 6px)',
                            background: '#18181b', color: '#fff',
                            fontSize: '0.67rem', padding: '4px 8px',
                            borderRadius: 4, whiteSpace: 'nowrap',
                            pointerEvents: 'none', zIndex: 20,
                          }}>
                            {b.process} &nbsp;·&nbsp; t={b.start} → {b.end}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Time axis */}
                <div style={{ position: 'relative', height: 18, borderTop: '1px solid #e4e4e7' }}>
                  <span style={{ position: 'absolute', left: 0, top: 4, fontSize: '0.62rem', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>0</span>
                  {result.ganttChart.map((b, i) => (
                    <span key={i} style={{
                      position: 'absolute', left: `${(b.end / total) * 100}%`,
                      transform: 'translateX(-50%)', top: 4,
                      fontSize: '0.62rem', color: '#a1a1aa',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{b.end}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────── */}
        {result && result.metrics.length > 0 && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f4f4f5', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>Results</span>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontSize: '0.78rem', color: '#52525b' }}>
                  Avg wait: <b style={{ color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>{result.averages.avgWait.toFixed(2)} ms</b>
                </span>
                <span style={{ fontSize: '0.78rem', color: '#52525b' }}>
                  Avg turnaround: <b style={{ color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>{result.averages.avgTurnaround.toFixed(2)} ms</b>
                </span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                  <th style={th}>Process</th>
                  <th style={th}>Priority</th>
                  <th style={th}>Arrival</th>
                  <th style={th}>Burst</th>
                  <th style={th}>Wait</th>
                  <th style={th}>Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f4f4f5', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                  >
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: gc(row.id), flexShrink: 0 }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{row.id}</span>
                      </div>
                    </td>
                    <Tc>{row.priority}</Tc>
                    <Tc>{row.arrival}</Tc>
                    <Tc>{row.burst}</Tc>
                    <Tc bold>{row.waitTime}</Tc>
                    <Tc bold>{row.turnaroundTime}</Tc>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!result && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#a1a1aa', fontSize: '0.85rem' }}>
            Configure your processes above and click Simulate.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared styles ────────────────────────────────────────────
const th: React.CSSProperties = {
  padding: '9px 16px',
  textAlign: 'left',
  fontWeight: 500,
  fontSize: '0.72rem',
  color: '#71717a',
}

const td: React.CSSProperties = {
  padding: '10px 16px',
  color: '#3f3f46',
}

function Tc({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace", color: bold ? '#18181b' : '#71717a', fontWeight: bold ? 500 : 400 }}>
      {children}
    </td>
  )
}
