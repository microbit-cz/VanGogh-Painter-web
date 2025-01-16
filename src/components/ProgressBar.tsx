import {FC} from "react";
import Styles from "./ProgressBar.module.css";

export const ProgressBar: FC = () => {
    return (
        <>
            <div className={Styles["progressBar__container"]}>
                <span className={Styles["progressBar__time"]}>-00:00</span>
                <progress className={Styles["progressBar__bar"]} value="32" max="100"> 32%</progress>
                <span className={Styles["progressBar__time"]}>59:59</span>
            </div>
        </>
    );
};