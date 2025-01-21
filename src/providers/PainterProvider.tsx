import {createContext, useState, FC, PropsWithChildren, useReducer, useEffect} from 'react';

type PainterState = {
    connStatus: boolean;
    isPaused: boolean;
    estimatedTime: number;
    runTime: number;
}

interface IPainterContext {
    state: PainterState;
    dispatch: (action: Action) => void;
    currentSVG: SVGSVGElement | null;
    setCurrentSVG: (svg: SVGSVGElement) => void;
}

type Action =
    | { type: 'START', payload: { estimatedTime: number } }
    | { type: 'PAUSE' }
    | { type: 'RESUME' }
    | { type: 'STOP' }
    | { type: 'TICK' };

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
            return { ...state, connStatus: false, isPaused: false, estimatedTime: 0, runTime: 0 };
        case 'TICK':
            return { ...state, runTime: state.estimatedTime > 0 ? state.runTime + 1 : 0 };
        default:
            return state;
    }
};

export const PainterContext = createContext<IPainterContext>({} as IPainterContext);

export const PainterProvider: FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [currentSVG, setCurrentSVG] = useState<SVGSVGElement | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!state.isPaused && !state.isPaused) {
            timer = setInterval(() => {
                dispatch({ type: 'TICK' });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [!state.isPaused, state.isPaused]);

    return (
        <PainterContext.Provider value={{ state, dispatch, currentSVG, setCurrentSVG }}>
            {children}
        </PainterContext.Provider>
    );
};