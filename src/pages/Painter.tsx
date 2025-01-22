import {FC, useContext, useEffect, useRef, useState} from "react";
import {Header} from "../components/Header.tsx";
import {ProgressBar} from "../components/ProgressBar.tsx";
import {ScaleSetting} from "../components/ScaleSetting.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Painter.module.css";
import {Status} from "../components/Status.tsx";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {useNavigate} from "react-router-dom";

export const Painter: FC = () => {
    const { state, dispatch, currentSVG } = useContext(PainterContext);
    const navigate = useNavigate();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isIndicatorActive, setIsIndicatorActive] = useState(false);
    const [scale, setScale] = useState(1); // State to manage the scale value
    const speed = 54; // Speed by which the indicator travels

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    const sortPaths = (paths: SVGPathElement[]) => {
        const sortedPaths: SVGPathElement[] = [];
        let currentPath = paths.shift();
        if (currentPath) {
            sortedPaths.push(currentPath);
        }

        while (paths.length > 0) {
            const currentEnd = currentPath!.getPointAtLength(currentPath!.getTotalLength());
            let closestPathIndex = 0;
            let closestDistance = Infinity;

            paths.forEach((path, index) => {
                const start = path.getPointAtLength(0);
                const distance = calculateDistance(currentEnd.x, currentEnd.y, start.x, start.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPathIndex = index;
                }
            });

            currentPath = paths.splice(closestPathIndex, 1)[0];
            sortedPaths.push(currentPath);
        }

        return sortedPaths;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!state.isPaused && currentSVG) {
            let paths = Array.from(currentSVG.querySelectorAll('path'));
            paths = sortPaths(paths);

            const totalLength = paths.reduce((sum, path) => sum + path.getTotalLength(), 0);
            dispatch({ type: 'START', payload: { estimatedTime: Math.floor(totalLength / speed) } });

            const moveIndicator = () => {
                if (currentPathIndex < paths.length) {
                    setIsIndicatorActive(true);
                    const path = paths[currentPathIndex];
                    const length = path.getTotalLength();

                    if (progress < length) {
                        const point = path.getPointAtLength(progress);

                        if (indicatorRef.current) {
                            const scaledX = point.x * scale;
                            const scaledY = point.y * scale;
                            indicatorRef.current.style.transform = `translate(${scaledX}px, ${scaledY}px)`;
                        }
                        setProgress(prev => prev + 1); // Adjust the speed as needed
                    } else {
                        setProgress(0);
                        setCurrentPathIndex(prev => prev + 1);
                    }
                } else {
                    setIsIndicatorActive(false);
                    clearInterval(interval);
                }
            };

            interval = setInterval(moveIndicator, 16); // Adjust the interval as needed
        }
        return () => clearInterval(interval);
    }, [state.isPaused, currentSVG, currentPathIndex, progress, scale]);

    useEffect(() => {
        if (state.runTime >= state.estimatedTime) {
            dispatch({ type: 'STOP' });
        }
    }, [state.runTime, state.estimatedTime]);

    const handleStartPause = () => {
        if (!state.isPaused) {
            dispatch({ type: 'PAUSE' });
        } else {
            dispatch({ type: 'RESUME' });
        }
    };

    const handleEdit = () => {
        if (!state.isPaused) {
            dispatch({ type: 'PAUSE' });
        }
        navigate("/Editor");
    }

    const handleCancel = () => {
        dispatch({ type: 'STOP' });
        setCurrentPathIndex(0);
        setProgress(0);
        setIsIndicatorActive(false);
    };

    const handleScaleChange = (newScale: number) => {
        setScale(newScale);
    };

    return (
        <>
            <Header />
            <main className={Styles["painter__container"]}>
                <div className={`${Styles["painter__section"]} ${Styles["left"]}`}>
                    <ProgressBar/>
                    <div className={Styles["painter__displayContainer"]}>
                        <div ref={indicatorRef} className={Styles["indicator"]} style={{ display: isIndicatorActive ? 'block' : 'none' }}></div>
                        <div className={Styles["painter__display"]}>
                            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} dangerouslySetInnerHTML={{__html: currentSVG?.outerHTML ?? ""}}></div>
                        </div>
                    </div>
                </div>
                <div className={`${Styles["painter__section"]} ${Styles["right"]}`}>
                    <div className={Styles["painter__topContainer"]}>
                        <Status/>
                        <ScaleSetting onScaleChange={handleScaleChange}/>
                    </div>
                    <div className={Styles["painter__buttonContainer"]}>
                        <button className={"btn"} onClick={handleStartPause}>{!state.isPaused ? "Pause" : "Start"}<Icon variant={IconVariant.PLAY_PAUSE}/></button>
                        <button className={"btn"} onClick={handleEdit}>Edit<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"} onClick={handleCancel}>Cancel<Icon variant={IconVariant.CROSS}/></button>
                    </div>
                </div>
            </main>
        </>
    )
}