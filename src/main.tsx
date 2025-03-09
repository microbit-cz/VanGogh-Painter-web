import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PainterProvider} from "./providers/PainterProvider.tsx";
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PainterProvider>
            <App />
        </PainterProvider>
        <Analytics />
    </StrictMode>,
)
