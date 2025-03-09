import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./ScaleSetting.module.css";
import {ChangeEvent, FC, useState} from "react";

interface ScaleSettingProps {
    onScaleChange: (scale: number) => void;
}

export const ScaleSetting: FC<ScaleSettingProps> = ({ onScaleChange }) => {
    const [scale, setScale] = useState(1);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newScale = Math.round(parseFloat(event.target.value) * 10) / 10;
        setScale(Math.round(newScale*10)/10);
        onScaleChange(newScale);
    };

    const handleIncrease = () => {
        const newScale = Math.min(scale + 0.1, 10);
        setScale(Math.round(newScale*10)/10);
        onScaleChange(newScale);
    };

    const handleDecrease = () => {
        const newScale = Math.max(scale - 0.1, 0.1);
        setScale(Math.round(newScale*10)/10);
        onScaleChange(newScale);
    };

    return (
        <div className={Styles["scaleSetting__container"]}>
            <p className={Styles["scaleSetting__title"]}>Real size multiplier:</p>
            <div className={Styles["scaleSetting__inputContainer"]}>
                <button onClick={handleDecrease} className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.MINUS} size={1} /></button>
                <div className={Styles["scaleSetting__inputNumberContainer"]}>
                    <span className={Styles["scaleSetting__unit"]}>×</span>
                    <input className={Styles["scaleSetting__input"]} type="number" id="scale" name="scale" min="0.1" max="10" step="0.1" value={scale} onChange={handleInputChange}/>
                </div>
                <button onClick={handleIncrease} className={Styles["scaleSetting__button"]}><Icon variant={IconVariant.PLUS} size={1}/></button>
            </div>
        </div>
    );
};