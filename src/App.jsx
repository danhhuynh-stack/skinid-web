import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app/providers.jsx';
import { router } from './app/router.jsx';
import PageLoader from './shared/ui/PageLoader.jsx';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} fallbackElement={<PageLoader />} />
    </AppProviders>
  );
}

