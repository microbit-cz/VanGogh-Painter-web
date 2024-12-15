import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./ScaleSetting.module.css";
import {FC} from "react";

export const ScaleSetting: FC = () => {
    return (
        <div className={Styles["scaleSetting__container"]}>
            <p className={Styles["scaleSetting__title"]}>Real size multiplier:</p>
            <div className={Styles["scaleSetting__inputContainer"]}>
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.MINUS} /></button>
                <input className={Styles["scaleSetting__input"]} type="number" defaultValue={1.0} />
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.PLUS} /></button>
            </div>
            <button className={"btn"}>Default</button>
        </div>
    );
};