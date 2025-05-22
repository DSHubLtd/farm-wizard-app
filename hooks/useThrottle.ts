import { useRef } from "react";

export const useThrottle = (fn: (...args: any[]) => void, limit: number) => {
  const lastRun = useRef(0);

  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      lastRun.current = now;
      fn(...args);
    }
  };
};

// import { throttle } from "lodash";

// const triggerSprayThrottled = useMemo(
//   () => throttle(triggerSpray, 1000),
//   [triggerSpray]
// );

// // Usage in button
// <Button onPress={triggerSprayThrottled}>Spray</Button>;
