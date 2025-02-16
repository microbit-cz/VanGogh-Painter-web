import {FC, useContext, useRef, useState} from "react";
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
    const [isIndicatorActive, setIsIndicatorActive] = useState(false);
    const [scale, setScale] = useState(1);


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