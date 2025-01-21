import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PainterProvider} from "./providers/PainterProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PainterProvider>
        <App />
        </PainterProvider>
    </StrictMode>,
)
