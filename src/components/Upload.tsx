import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./Upload.module.css";

export const Upload = () => {
    return (
        <div className={Styles["upload__container"]}>
            <p className={Styles["upload__title"]}>Drag here to upload SVG file</p>
            <Icon variant={IconVariant.UPLOAD} />
            <input className={Styles["upload__fileContainer__input"]} type="file" accept=".svg" />
        </div>
    );
};