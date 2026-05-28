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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
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
