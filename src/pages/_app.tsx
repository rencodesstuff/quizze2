import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0066FF" />
      </Head>
      <Component {...pageProps} />
      <Analytics 
        mode={'production'} // Change to 'development' when testing locally
        debug={false} // Set to true to see debug messages in console
        beforeSend={(event) => {
          // Optional: Modify or filter events before they're sent
          return event;
        }}
      />
    </>
  );
}

export default MyApp;