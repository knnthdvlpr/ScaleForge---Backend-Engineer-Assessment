export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  // Step 1: Flatten all downtime logs into a single array
  const allLogs: [Date, Date][] = args.flat();
  
  // Step 2: Handle edge cases
  if (allLogs.length === 0) {
    return [];
  }
  
  if (allLogs.length === 1) {
    return allLogs;
  }
  
  // Step 3: Sort by start time (earliest first)
  allLogs.sort((a, b) => a[0].getTime() - b[0].getTime());
  
  // Step 4: Merge overlapping or adjacent periods
  const merged: [Date, Date][] = [];
  let current = allLogs[0];
  
  for (let i = 1; i < allLogs.length; i++) {
    const next = allLogs[i];
    
    // Check if current and next overlap or are adjacent
    if (current[1].getTime() >= next[0].getTime()) {
      // Overlapping or touching - merge them
      // Take the later end time
      current = [
        current[0],
        current[1].getTime() > next[1].getTime() ? current[1] : next[1]
      ];
    } else {
      // No overlap - push current and move to next
      merged.push(current);
      current = next;
    }
  }
  
  // Don't forget to push the last period
  merged.push(current);
  
  return merged;
}