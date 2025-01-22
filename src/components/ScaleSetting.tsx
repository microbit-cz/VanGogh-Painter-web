import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./ScaleSetting.module.css";
import {FC} from "react";

interface ScaleSettingProps {
    onScaleChange: (scale: number) => void;
}

export const ScaleSetting: FC<ScaleSettingProps> = ({ onScaleChange }) => {

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(event.target.value);
        onScaleChange(newScale);
    };

    return (
        <div className={Styles["scaleSetting__container"]}>
            <p className={Styles["scaleSetting__title"]}>Real size multiplier:</p>
            <div className={Styles["scaleSetting__inputContainer"]}>
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.MINUS} size={1} /></button>
                <div className={Styles["scaleSetting__inputNumberContainer"]}>
                    <span className={Styles["scaleSetting__unit"]}>×</span>
                    <input className={Styles["scaleSetting__input"]} type="number" id="scale" name="scale" min="0.1" max="10" step="0.1" defaultValue="1" onChange={handleInputChange}/>
                </div>
                <button className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.PLUS} size={1}/></button>
            </div>
        </div>
    );
};