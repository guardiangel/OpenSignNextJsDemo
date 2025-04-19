import customTheme from '@/ui/theme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import Head from 'next/head';
import { useRouter } from 'next/router';


export const muiCache = createCache({
    key: 'mui',
    prepend: true,
});

export default function Home() {
    const router = useRouter();
    
    return (
        <>
            <Head>
                <title>DocVenture</title>
                <meta name="description" content="Created by VassuTech" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <CacheProvider value={muiCache}>
                <ThemeProvider theme={customTheme}>
                    
                </ThemeProvider>
            </CacheProvider>
        </>
    );
}
