# CPU Scheduling Visualizer

A simple, interactive visualizer for common OS CPU scheduling algorithms. Built with React, TypeScript, and Tailwind CSS v4.

![CPU Scheduling Visualizer](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

---

## What it does

You give it a list of processes (arrival time, burst time, priority), pick a scheduling algorithm, and it shows you:

- **Gantt Chart** — visual timeline of when each process runs
- **Per-process metrics** — wait time and turnaround time for each process
- **Averages** — average wait time and average turnaround time

## Supported Algorithms

| Algorithm | Type |
|---|---|
| First-Come, First-Served (FCFS) | Non-Preemptive |
| Shortest Job First (SJF) | Non-Preemptive |
| Shortest Remaining Time First (SRTF) | Preemptive |
| Round Robin (RR) | Preemptive |
| Priority Scheduling | Non-Preemptive |
| Priority Scheduling | Preemptive |
| Multilevel Queue | Mixed |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/udayvarshney151006/cpu-scheduling-visualizer.git
cd cpu-scheduling-visualizer

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

## Tech Stack

- **React 19** — UI
- **TypeScript** — type safety
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite` plugin)
- **Vite 8** — build tool
- **Lucide React** — icons

## Project Structure

```
src/
├── App.tsx          # Main UI component
├── scheduler.ts     # All scheduling algorithm logic
├── index.css        # Global styles + Tailwind import
└── main.tsx         # Entry point
```

## How the scheduler works

All algorithm logic lives in `src/scheduler.ts`. The `simulate()` function takes:
- `algorithm` — the algorithm name string
- `processes` — array of `{ id, arrival, burst, priority }`
- `timeQuantum` — used only for Round Robin and Multilevel Queue

It returns a `SchedulingResult` with the Gantt chart blocks and computed metrics.

---

Made as an OS concepts project.
