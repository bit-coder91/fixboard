import '../styles/globals.css';
import '../styles/components.css';
import { AppProvider } from '../lib/AppContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { ToastProvider } from '../lib/ToastContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
