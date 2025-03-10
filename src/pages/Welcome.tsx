import {FC, useContext, useState} from "react";
import {Header} from "../components/Header.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Welcome.module.css";
import {getServices, requestMicrobit} from "microbit-web-bluetooth";
import {Status} from "../components/Status.tsx";
import {useNavigate} from "react-router-dom";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {microbitStore} from "../stores/main.ts";

export const Welcome: FC = () => {
    const { dispatch } = useContext(PainterContext);
    const navigate = useNavigate();
    const [device, setDevice] = useState<BluetoothDevice | null>(null);



    const handleConnect = async () => {
        if (device) {
            if (device.gatt && device.gatt.connected) { 
                await device.gatt.disconnect();
            }
            setDevice(null);
            microbitStore.empty();
            dispatch({ type: 'DISCONNECT_CONNECT', payload: false });
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
            dispatch({ type: 'DISCONNECT_CONNECT', payload: true });
            navigate("/Upload");
        }
    }

    return (
        <>
            <Header />
            <main className={Styles["welcome__main"]}>
                <p className={Styles["welcome__title"]}>Welcome to VanGogh Painter!</p>
                <p className={Styles["welcome__subtitle"]}>Connect via bluetooth.</p>
                <button onClick={handleConnect} className={"btn btn--large"}>Connect <Icon variant={IconVariant.BLUETOOTH} /></button>
            </main>
            <Status WLCMPage={true} />
        </>
    )
}