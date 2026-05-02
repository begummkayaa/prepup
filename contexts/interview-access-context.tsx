import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'prepup:interviewSimulationCompleted';

type InterviewAccessContextValue = {
  /** En az bir mülakat simülasyonu tamamlandı (yerel; backend gelince API ile senkronlanabilir). */
  hasCompletedInterviewSimulation: boolean;
  isLoading: boolean;
  markInterviewSimulationCompleted: () => Promise<void>;
};

const InterviewAccessContext = createContext<InterviewAccessContextValue>({
  hasCompletedInterviewSimulation: false,
  isLoading: true,
  markInterviewSimulationCompleted: async () => {},
});

export function InterviewAccessProvider({ children }: PropsWithChildren) {
  const [hasCompletedInterviewSimulation, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active) {
          setHasCompleted(raw === '1' || raw === 'true');
        }
      } catch {
        if (active) {
          setHasCompleted(false);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const markInterviewSimulationCompleted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setHasCompleted(true);
  }, []);

  const value = useMemo(
    () => ({
      hasCompletedInterviewSimulation,
      isLoading,
      markInterviewSimulationCompleted,
    }),
    [hasCompletedInterviewSimulation, isLoading, markInterviewSimulationCompleted]
  );

  return (
    <InterviewAccessContext.Provider value={value}>{children}</InterviewAccessContext.Provider>
  );
}

export function useInterviewAccess() {
  return useContext(InterviewAccessContext);
}
