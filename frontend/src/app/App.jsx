import { RouterProvider } from 'react-router-dom';
import { AppStoreProvider } from '../context/AppStore';
import { router } from './router';

export default function App() {
  return (
    <AppStoreProvider>
      <RouterProvider router={router} />
    </AppStoreProvider>
  );
}
