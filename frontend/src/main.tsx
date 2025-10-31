import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from 'redux-persist/integration/react';

import { AppErrorBoundary } from './common/components/app-error-boundary';
import { CommonSuspenseFallback } from './common/components/common-suspense-fallback';
import './index.css';
import { SentryDebugButton } from './main/components/sentry-debug-button.component';
import './main/locale/setup.ts';
import { MainRouter } from './main/routers/main.router';
import { MainPersistStore, MainStore } from './main/store/main.store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={MainStore}>
        <PersistGate loading={<CommonSuspenseFallback />} persistor={MainPersistStore}>
          <ToastContainer closeButton closeOnClick newestOnTop />
          <MainRouter />
          <SentryDebugButton />
        </PersistGate>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>,
);
