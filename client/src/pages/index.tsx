import createCache from '@emotion/cache';
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
                <title>OPenSignDemo</title>
                <meta name="description" content="Created by EducationCa" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <h1 className="text-2xl font-bold mb-4">Welcome to OPenSignDemo</h1>
                <p>This is your dashboard content.</p>
            </div>
        </>
    );
}
