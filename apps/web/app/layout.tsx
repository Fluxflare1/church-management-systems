import { Providers } from './providers';
import { CommunicationProvider } from '@/providers/communication-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CommunicationProvider>
          <Providers>
            {children}
          </Providers>
        </CommunicationProvider>
      </body>
    </html>
  );
}
