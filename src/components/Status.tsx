import {FC, useState} from "react";
import Styles from "./Status.module.css";
import {Icon, IconColor, IconVariant} from "./Icon.tsx";


export const Status: FC = () => {
    const [isConnected, setIsConnected] = useState(false);

    return (
        <>
            <div className={Styles["status__container"]}>
                <p className={Styles["status__text"]}>VanGogh Painter status: </p>
                <Icon variant={IconVariant.NETWORK} color={isConnected ? IconColor.GREEN : IconColor.RED}/>
            </div>
        </>
    );
};