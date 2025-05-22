import { useEffect, useRef, useState } from "react";

// export const useThrottle = (fn: (...args: any[]) => void, limit: number) => {
//   const lastRun = useRef(0);

//   return (...args: any[]) => {
//     const now = Date.now();
//     if (now - lastRun.current >= limit) {
//       lastRun.current = now;
//       fn(...args);
//     }
//   };
// };
// const throttledTriggerSpray = useThrottle(triggerSpray, 1000);

export const useThrottleWithState = (
  fn: (...args: any[]) => void,
  limit: number
) => {
  const lastRun = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  const throttledFn = (...args: any[]) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      lastRun.current = now;
      setIsThrottled(true);
      fn(...args);
      timeout.current = setTimeout(() => {
        setIsThrottled(false);
      }, limit);
    }
  };

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return [throttledFn, isThrottled] as const;
};

// import { throttle } from "lodash";

// const triggerSprayThrottled = useMemo(
//   () => throttle(triggerSpray, 1000),
//   [triggerSpray]
// );

// // Usage in button
// <Button onPress={triggerSprayThrottled}>Spray</Button>;
