import { useState, useEffect, useCallback } from 'react';

export interface BatteryState {
  batteryLevel: number; // 0 to 100
  isCharging: boolean;
  isLowBattery: boolean; // batteryLevel < 20
  isSupported: boolean;
  simulatedLevel: number | null;
  setSimulatedLevel: (level: number | null) => void;
  toggleLowBatterySimulation: () => void;
}

export function useBatteryStatus(): BatteryState {
  const [realLevel, setRealLevel] = useState<number>(85);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [simulatedLevel, setSimulatedLevel] = useState<number | null>(() => {
    const saved = localStorage.getItem('devil_simulated_battery');
    return saved !== null ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    let batteryInstance: any = null;
    let isMounted = true;

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          if (!isMounted) return;
          batteryInstance = battery;
          setIsSupported(true);
          setRealLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          const handleLevelChange = () => {
            if (isMounted) {
              setRealLevel(Math.round(battery.level * 100));
            }
          };

          const handleChargingChange = () => {
            if (isMounted) {
              setIsCharging(battery.charging);
            }
          };

          battery.addEventListener('levelchange', handleLevelChange);
          battery.addEventListener('chargingchange', handleChargingChange);
        })
        .catch(() => {
          setIsSupported(false);
        });
    }

    return () => {
      isMounted = false;
      if (batteryInstance) {
        try {
          batteryInstance.removeEventListener('levelchange', () => {});
          batteryInstance.removeEventListener('chargingchange', () => {});
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const updateSimulatedLevel = useCallback((level: number | null) => {
    setSimulatedLevel(level);
    if (level === null) {
      localStorage.removeItem('devil_simulated_battery');
    } else {
      localStorage.setItem('devil_simulated_battery', level.toString());
    }
  }, []);

  const toggleLowBatterySimulation = useCallback(() => {
    if (simulatedLevel === null) {
      // Switch to 15% (Low battery < 20% to trigger red theme)
      updateSimulatedLevel(15);
    } else if (simulatedLevel < 20) {
      // Switch to 85% (Normal battery >= 20% to trigger cyan theme)
      updateSimulatedLevel(85);
    } else {
      // Clear simulation, back to real
      updateSimulatedLevel(null);
    }
  }, [simulatedLevel, updateSimulatedLevel]);

  const activeLevel = simulatedLevel !== null ? simulatedLevel : realLevel;
  const isLowBattery = activeLevel < 20;

  return {
    batteryLevel: activeLevel,
    isCharging,
    isLowBattery,
    isSupported,
    simulatedLevel,
    setSimulatedLevel: updateSimulatedLevel,
    toggleLowBatterySimulation,
  };
}
