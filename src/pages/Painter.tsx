import {FC, useContext} from "react";
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

    const handleStartPause = () => {
        if (!state.isPaused) {
            dispatch({ type: 'PAUSE' });
        } else {
            dispatch({ type: 'START', payload: { estimatedTime: 300 } }); // Example: 5 minutes
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
    };

    return (
        <>
            <Header />
            <main className={Styles["painter__container"]}>
                <div className={`${Styles["painter__section"]} ${Styles["left"]}`}>
                    <ProgressBar />
                    <div className={Styles["painter__display"]} dangerouslySetInnerHTML={{ __html: currentSVG?.outerHTML ?? ""}}></div>
                </div>
                <div className={`${Styles["painter__section"]} ${Styles["right"]}`}>
                    <div className={Styles["painter__topContainer"]}>
                        <Status />
                        <ScaleSetting/>
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