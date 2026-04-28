import '../styles/globals.css';

export const metadata = {
  title: 'HairCare Tracker',
  description: 'Track your weekly hair care routine',
  applicationName: 'HairCare Tracker',
  themeColor: '#FAF6F1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HairCare',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
