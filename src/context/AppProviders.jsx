import { LearningProvider } from './LearningContext';
import { RepositoryProvider } from './RepositoryContext';

/** Every provider the app needs. Tests pass fake repositories and a fixed clock. */
export default function AppProviders({ repositories, clock, children }) {
  return (
    <RepositoryProvider repositories={repositories}>
      <LearningProvider clock={clock}>{children}</LearningProvider>
    </RepositoryProvider>
  );
}
