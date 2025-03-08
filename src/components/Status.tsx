import { FC, useContext, useEffect, useState } from "react";
import Styles from "./Status.module.css";
import { Icon, IconColor, IconVariant } from "./Icon.tsx";
import { PainterContext } from "../providers/PainterProvider.tsx";
import { microbitStore } from "../stores/main.ts";

type StatusProps = {
    WLCMPage?: boolean,
}

export const Status: FC<StatusProps> = ({WLCMPage}) => {
    const { state, dispatch } = useContext(PainterContext);
    const [connStatus, setConnStatus] = useState(state.connStatus);

    useEffect(() => {
        const checkConnection = () => {
            const device = microbitStore.get("device") as BluetoothDevice | null;
            const isConnected = device?.gatt?.connected ?? false;

            if (isConnected !== connStatus) {
                setConnStatus(isConnected);
                dispatch({ type: "DISCONNECT_CONNECT", payload: isConnected });
            }
        };

        // Run check every 2 seconds
        const interval = setInterval(checkConnection, 2000);

        return () => clearInterval(interval);
    }, [connStatus, dispatch]);

    switch (WLCMPage) {
        case true:
            return (
                <div className={`${Styles["status__container--welcome"]} ${state.connStatus ? Styles["con"] : Styles["dis"]}`}>
                    <p className={Styles["status__text--welcome"]}>{state.connStatus ? "VanGogh is connected!" : "VanGogh is disconnected..."}</p>
                </div>
            );
        default:
            return (
                <div className={Styles["status__container"]}>
                    <p className={Styles["status__text"]}>VanGogh status: </p>
                    <Icon variant={IconVariant.NETWORK} color={state.connStatus ? IconColor.GREEN : IconColor.RED} />
                </div>
            );
    }
};