import { HelpLanguageProvider } from '../i18n/Help';
import { LearningProvider, useLearning } from './LearningContext';
import { LearningPathProvider } from './LearningPathContext';
import { RepositoryProvider } from './RepositoryContext';

/** Applies the help language chosen in the Lab (FR-017). */
function HelpFromPreferences({ children }) {
  const { preferences } = useLearning();
  return <HelpLanguageProvider lang={preferences?.helpLanguage}>{children}</HelpLanguageProvider>;
}

/** Every provider the app needs. Tests pass fake repositories and a fixed clock. */
export default function AppProviders({ repositories, clock, children }) {
  return (
    <RepositoryProvider repositories={repositories}>
      <LearningProvider clock={clock}>
        <HelpFromPreferences>
          <LearningPathProvider>{children}</LearningPathProvider>
        </HelpFromPreferences>
      </LearningProvider>
    </RepositoryProvider>
  );
}
