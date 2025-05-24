export const getThreatPanelty = (level: number) => {
  if (level === 1) return 5;
  if (level === 2) return 10;
  if (level === 3) return 15;
  if (level === 4) return 20;
  return 25;
};
