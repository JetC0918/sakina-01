import { useContext } from 'react';
import { SakinaContext } from '@/context/SakinaContext';

/**
 * Consumer hook for accessing Sakina context
 * Must be used within a SakinaProvider
 *
 * @returns SakinaContext value with state and actions
 * @throws Error if used outside SakinaProvider
 */
export function useSakina() {
  const context = useContext(SakinaContext);

  if (context === undefined) {
    throw new Error('useSakina must be used within a SakinaProvider');
  }

  return context;
}
