import { FC, useContext, useEffect, useState } from "react";
import Styles from "./Status.module.css";
import { Icon, IconColor, IconVariant } from "./Icon.tsx";
import { PainterContext } from "../providers/PainterProvider.tsx";
import { microbitStore } from "../stores/main.ts";
import { getServices, requestMicrobit } from "microbit-web-bluetooth";

export const Status: FC = () => {
    const { state, dispatch } = useContext(PainterContext);
    const [connStatus, setConnStatus] = useState(state.connStatus);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);

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

    const handleConnect = async () => {
        if (connStatus) {
            // === DISCONNECT PATH ===
            if (device?.gatt?.connected) {
                await device.gatt.disconnect();
            }
            setDevice(null);
            microbitStore.empty();
            dispatch({ type: "DISCONNECT_CONNECT", payload: false });
        } else {
            // === CONNECT PATH ===
            const newDevice = await requestMicrobit(window.navigator.bluetooth);
            if (newDevice) {
                setDevice(newDevice);
                microbitStore.update("device", newDevice);

                const services = await getServices(newDevice);
                microbitStore.update("services", services);

                if (services.deviceInformationService) {
                    const deviceInformation = await services.deviceInformationService.readDeviceInformation();
                    microbitStore.update("deviceInformation", deviceInformation);
                }

                newDevice.addEventListener("gattserverdisconnected", handleConnect);
                dispatch({ type: "DISCONNECT_CONNECT", payload: true });
            } else {
                // user canceled the chooser or something went wrong
                setConnStatus(false);
                dispatch({ type: "DISCONNECT_CONNECT", payload: false });
            }
        }
    };

    return (
        <>
            <button className={`${Styles["status__connectButton"]} btn`} onClick={handleConnect}>
                Status
                <Icon variant={IconVariant.NETWORK} color={connStatus ? IconColor.GREEN : IconColor.RED}/>
                <span className={Styles["status__tooltiptext"]}>{connStatus ? "Disconnect from Micro:bit" : "Connect to Micro:bit"}</span>
            </button>
        </>
    );
};