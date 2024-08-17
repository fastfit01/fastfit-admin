import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import { darkTheme } from '../theme/darkTheme';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />  
        <meta name="description" content="Fitness app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Other meta tags */}
      </Head>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </>

  );
}

export default MyApp;