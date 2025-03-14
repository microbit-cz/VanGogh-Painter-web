import {createContext, useState, FC, PropsWithChildren, useReducer, useRef, RefObject} from 'react';
import {Canvas} from "fabric";

type PainterState = {
    connStatus: boolean;
    isPaused: boolean;
    estimatedTime: number;
    runTime: number;
}

interface IPainterContext {
    state: PainterState;
    dispatch: (action: Action) => void;
    unprocessedSVG: SVGSVGElement | null;
    setUnprocessedSVG: (svg: SVGSVGElement) => void;
    unprocessedSVGstr: string | null;
    setUnprocessedSVGstr: (svg: string) => void;
    currentSVG: string[] | null;
    setCurrentSVG: (svg: string[]) => void;
    canvas: string | null;
    setCanvas: (canvas: string | null) => void;
    width: number;
    setWidth: (width: number) => void;
    canvasRef: RefObject<Canvas>;
}

type Action =
    | { type: 'START', payload: { estimatedTime: number } }
    | { type: 'PAUSE' }
    | { type: 'RESUME' }
    | { type: 'STOP' }
    | { type: 'TICK' }
    | { type: 'DISCONNECT_CONNECT', payload: boolean };

const initialState: PainterState = {
    connStatus: false,
    isPaused: true,
    estimatedTime: 0,
    runTime: 0
};

const reducer = (state: PainterState, action: Action): PainterState => {
    switch (action.type) {
        case 'START':
            return { ...state, connStatus: true, isPaused: false, estimatedTime: action.payload.estimatedTime };
        case 'PAUSE':
            return { ...state, isPaused: true };
        case 'RESUME':
            return { ...state, isPaused: false };
        case 'STOP':
            return { ...state, isPaused: true, estimatedTime: 0, runTime: 0 };
        case 'TICK':
            return { ...state, runTime: state.estimatedTime > 0 ? state.runTime + 1 : 0 };
        case 'DISCONNECT_CONNECT':
            return { ...state, connStatus: action.payload };
        default:
            return state;
    }
};

export const PainterContext = createContext<IPainterContext>({} as IPainterContext);

export const PainterProvider: FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [currentSVG, setCurrentSVG] = useState<string[] | null>(null);
    const [unprocessedSVG, setUnprocessedSVG] = useState<SVGSVGElement | null>(null);
    const [unprocessedSVGstr, setUnprocessedSVGstr] = useState<string | null>(null);
    const [canvas, setCanvas] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(500);
    const canvasRef = useRef(null);

    return (
        <PainterContext.Provider value={{ state, dispatch, unprocessedSVG, setUnprocessedSVG, unprocessedSVGstr, setUnprocessedSVGstr, currentSVG, setCurrentSVG, canvas, setCanvas, width, setWidth, canvasRef }}>
            {children}
        </PainterContext.Provider>
    );
};