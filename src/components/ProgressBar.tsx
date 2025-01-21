import {FC, useContext} from "react";
import Styles from "./ProgressBar.module.css";
import {PainterContext} from "../providers/PainterProvider.tsx";

export const ProgressBar: FC = () => {
    const { state } = useContext(PainterContext);
    const Rminutes = Math.floor(state.runTime / 60);
    const Rseconds = state.runTime % 60;
    const Eminutes = Math.floor(state.estimatedTime / 60);
    const Eseconds = state.estimatedTime % 60;

    return (
        <>
            <div className={Styles["progressBar__container"]}>
                <span className={Styles["progressBar__time"]}>-{Rminutes}:{Rseconds < 10 ? `0${Rseconds}` : Rseconds}</span>
                <progress className={Styles["progressBar__bar"]} value={state.runTime} max={state.estimatedTime}/>
                <span className={Styles["progressBar__time"]}>{Eminutes}:{Eseconds < 10 ? `0${Eseconds}` : Eseconds}</span>
            </div>
        </>
    );
};