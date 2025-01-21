import {FC, useContext} from "react";
import Styles from "./Status.module.css";
import { Icon, IconColor, IconVariant } from "./Icon.tsx";
import {PainterContext} from "../providers/PainterProvider.tsx";

export const Status: FC = () => {
    const { state } = useContext(PainterContext);

    return (
        <div className={Styles["status__container"]}>
            <p className={Styles["status__text"]}>VanGogh Painter status: </p>
            <Icon variant={IconVariant.NETWORK} color={state.connStatus ? IconColor.GREEN : IconColor.RED} />
        </div>
    );
};