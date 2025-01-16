import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./Upload.module.css";
import {FC} from "react";

export const Upload: FC = () => {
    return (
        <div className={Styles["upload__container"]} onClick={() => {
            const inputElement = document.querySelector(`.${Styles["upload__fileContainer__input"]}`) as HTMLInputElement | null;
            if (inputElement) {
                inputElement.click();
            }
        }}>
            <p className={Styles["upload__title"]}>Click or drag here to upload SVG file</p>
            <Icon variant={IconVariant.UPLOAD} size={15}/>
            <input className={Styles["upload__fileContainer__input"]} type="file" accept=".svg"/>
        </div>
    );
};