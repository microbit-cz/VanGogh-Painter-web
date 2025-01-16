import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./ScaleSetting.module.css";
import {FC} from "react";

export const ScaleSetting: FC = () => {
    return (
        <div className={Styles["scaleSetting__container"]}>
            <p className={Styles["scaleSetting__title"]}>Real size multiplier:</p>
            <div className={Styles["scaleSetting__inputContainer"]}>
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.MINUS} size={1} /></button>
                <div className={Styles["scaleSetting__inputNumberContainer"]}>
                    <span className={Styles["scaleSetting__unit"]}>×</span>
                    <input className={Styles["scaleSetting__input"]} type="number" defaultValue={1.0}/>
                </div>
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.PLUS} size={1}/></button>
            </div>
        </div>
    );
};