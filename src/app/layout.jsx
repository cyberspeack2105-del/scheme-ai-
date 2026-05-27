import '../index.css';
import { AuthProvider } from '../context/AuthContext';
import { VoiceProvider } from '../context/VoiceContext';
import BackgroundEffect from '../components/BackgroundEffect';

export const metadata = {
  title: 'Voice Data App - AI-Powered Schemes Portal',
  description: 'An AI-powered secure data collection portal with smart scheme recommendations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <VoiceProvider>
            <BackgroundEffect />
            {children}
          </VoiceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
