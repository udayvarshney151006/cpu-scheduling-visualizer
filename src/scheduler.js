const colors = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", 
  "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-rose-500"
];

function getColor(index) {
  return colors[index % colors.length];
}

export function simulate(algorithm, processes, timeQuantum) {
  if (processes.length === 0) return { ganttChart: [], metrics: [], averages: { avgWait: 0, avgTurnaround: 0 } };

  // Assign colors to processes
  const processColors = {};
  processes.forEach((p, i) => processColors[p.id] = getColor(i));

  // Clone processes
  let procs = processes.map(p => ({ ...p, remaining: p.burst, finish: 0, rr: 0 }));
  
  let time = 0;
  let completed = 0;
  let gantt = [];
  
  const addToGantt = (id, t1, t2) => {
    if (t1 === t2) return;
    if (gantt.length > 0 && gantt[gantt.length - 1].process === id) {
      gantt[gantt.length - 1].end = t2;
    } else {
      gantt.push({ process: id, start: t1, end: t2, color: processColors[id] });
    }
  };

  const isArrived = (p, t) => p.arrival <= t && p.remaining > 0;

  if (algorithm === "First-Come, First-Served (FCFS)") {
    procs.sort((a, b) => a.arrival - b.arrival);
    for (let p of procs) {
      if (time < p.arrival) time = p.arrival;
      addToGantt(p.id, time, time + p.burst);
      time += p.burst;
      p.finish = time;
    }
  } 
  else if (algorithm === "Shortest Job First (SJF) - Non-Preemptive") {
    while (completed < procs.length) {
      let available = procs.filter(p => isArrived(p, time));
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      let p = available[0];
      addToGantt(p.id, time, time + p.burst);
      time += p.burst;
      p.remaining = 0;
      p.finish = time;
      completed++;
    }
  }
  else if (algorithm === "Shortest Remaining Time First (SRTF) - Preemptive") {
    while (completed < procs.length) {
      let available = procs.filter(p => isArrived(p, time));
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival);
      let p = available[0];
      addToGantt(p.id, time, time + 1);
      p.remaining -= 1;
      time += 1;
      if (p.remaining === 0) {
        p.finish = time;
        completed++;
      }
    }
  }
  else if (algorithm === "Round Robin (RR)") {
    let queue = [];
    let t = Math.min(...procs.map(p => p.arrival)); // jump to first arrival
    time = t;
    
    let pending = [...procs].sort((a, b) => a.arrival - b.arrival);
    
    const checkArrivals = (currentTime) => {
      while (pending.length > 0 && pending[0].arrival <= currentTime) {
        queue.push(pending.shift());
      }
    };
    
    checkArrivals(time);
    
    while (queue.length > 0 || pending.length > 0) {
      if (queue.length === 0) {
        time = pending[0].arrival;
        checkArrivals(time);
      }
      
      let p = queue.shift();
      let execTime = Math.min(p.remaining, timeQuantum);
      
      addToGantt(p.id, time, time + execTime);
      time += execTime;
      p.remaining -= execTime;
      
      checkArrivals(time); 
      
      if (p.remaining > 0) {
        queue.push(p);
      } else {
        procs.find(orig => orig.id === p.id).finish = time;
      }
    }
  }
  else if (algorithm === "Priority Scheduling - Non-Preemptive") {
    while (completed < procs.length) {
      let available = procs.filter(p => isArrived(p, time));
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
      let p = available[0];
      addToGantt(p.id, time, time + p.burst);
      time += p.burst;
      p.remaining = 0;
      p.finish = time;
      completed++;
    }
  }
  else if (algorithm === "Priority Scheduling - Preemptive") {
    while (completed < procs.length) {
      let available = procs.filter(p => isArrived(p, time));
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
      let p = available[0];
      addToGantt(p.id, time, time + 1);
      p.remaining -= 1;
      time += 1;
      if (p.remaining === 0) {
        p.finish = time;
        completed++;
      }
    }
  }
  else if (algorithm === "Multilevel Queue") {
    while (completed < procs.length) {
      let available = procs.filter(p => isArrived(p, time));
      if (available.length === 0) {
        time++;
        continue;
      }
      let q1 = available.filter(p => p.priority <= 2);
      let q2 = available.filter(p => p.priority > 2);
      
      let p;
      let isRR = false;
      if (q1.length > 0) {
        q1.sort((a, b) => a.arrival - b.arrival);
        p = q1[0];
        isRR = true;
      } else {
        q2.sort((a, b) => a.arrival - b.arrival);
        p = q2[0];
      }
      
      let execTime = isRR ? Math.min(p.remaining, timeQuantum) : p.remaining;
      addToGantt(p.id, time, time + execTime);
      time += execTime;
      p.remaining -= execTime;
      
      if (p.remaining === 0) {
        p.finish = time;
        completed++;
      }
    }
  }

  // Ensure unique contiguous gantt blocks
  let finalGantt = [];
  for (let block of gantt) {
    if (finalGantt.length > 0 && finalGantt[finalGantt.length - 1].process === block.process) {
      finalGantt[finalGantt.length - 1].end = block.end;
    } else {
      finalGantt.push(block);
    }
  }

  // Calculate metrics
  let metrics = procs.map(p => {
    let turnaroundTime = p.finish - p.arrival;
    let waitTime = turnaroundTime - p.burst;
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      waitTime,
      turnaroundTime
    };
  });

  let avgWait = metrics.reduce((sum, p) => sum + p.waitTime, 0) / (metrics.length || 1);
  let avgTurnaround = metrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / (metrics.length || 1);

  return {
    ganttChart: finalGantt,
    metrics,
    averages: { avgWait, avgTurnaround }
  };
}
