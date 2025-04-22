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
        if (device) {
            if (device.gatt && device.gatt.connected) {
                await device.gatt.disconnect();
            }
            setDevice(null);
            microbitStore.empty();
            dispatch({ type: "DISCONNECT_CONNECT", payload: false });
            return;
        }
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
        }
    };

    return (
        <>
            {connStatus && (
                <div className={Styles["status__container"]}>
                    <p className={Styles["status__text"]}>VanGogh status: </p>
                    <Icon variant={IconVariant.NETWORK} color={connStatus ? IconColor.GREEN : IconColor.RED} />
                </div>
            )}
            {!connStatus && (
                <button className={` btn`} onClick={handleConnect}>
                    Connect
                    <Icon variant={IconVariant.BLUETOOTH} />
                </button>
            )}
        </>
    );
};