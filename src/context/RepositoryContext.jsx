import { createContext, useContext } from 'react';

const RepositoryContext = createContext(null);

/**
 * Injects the repositories into the component tree. Tests pass fakes here.
 */
export function RepositoryProvider({ repositories, children }) {
  return (
    <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const repositories = useContext(RepositoryContext);
  if (!repositories) {
    throw new Error('useRepositories must be used inside <RepositoryProvider>');
  }
  return repositories;
}
