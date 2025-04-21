import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { appWithTranslation } from "next-i18next";
import type { AppProps } from 'next/app';
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    DndProvider,
    MouseTransition,
    TouchTransition
} from "react-dnd-multi-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import Parse from "@/newComponents/opensigncomponents/parseClient"; // Don't delete this, otherwise, we need to import the page separately GuiquanSun20250325
import { pdfjs } from "react-pdf";
import createEmotionCache from '../createEmotionCache';
import "../i18n"; // don't delete this line if we need to use useTransaction 20250227 Guiquan Sun
import '../styles/AddUser.css';
import '../styles/bootstrap.min.css';
import '../styles/font.css';
import '../styles/globals.css';
import "../styles/index.css";
import '../styles/managesign.css';
import '../styles/opensigndrive.css';
import '../styles/quill.css';
import '../styles/signature.css';
import theme from '../theme';
import Sidebar from "@/pages/SideBar";
import NoSSR from '@/newComponents/utils/NoSSR';
import {useState, useEffect} from "react";

if (typeof window !== 'undefined') {
  //Keep the same as the definition in package.json, don't upgrade pdfjs-dist and react-pdf defined in package.json
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js`;
}


const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition
    }
  ]
};

const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
}
function App({
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps,
}: MyAppProps) {
  const [isClient, setIsClient] = useState(false);

    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                 <DndProvider options={HTML5toTouch}>
                <CssBaseline />
                <NoSSR>
                <div className="flex">
                        <Sidebar />
                        <main className="ml-64 p-4 w-full">
                            <Component {...pageProps} />
                        </main>
                    </div>
                    </NoSSR>
                </DndProvider>
            </ThemeProvider>

        </CacheProvider>
    );
}

export default (appWithTranslation(App));