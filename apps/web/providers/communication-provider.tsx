'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRealTimeNotifications } from '@/lib/communications/hooks/use-notifications';

interface CommunicationContextType {
  // Context values for communication state
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export function CommunicationProvider({ children }: { children: ReactNode }) {
  useRealTimeNotifications(); // Initialize real-time notifications

  const value = {
    // Provide communication context values
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
}

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
