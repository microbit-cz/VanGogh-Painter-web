import {FC} from "react";
import {Header} from "../components/Header.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Welcome.module.css";
import {getServices, requestMicrobit} from "microbit-web-bluetooth";
//import {useStore} from "../stores/main.ts";

const handleConnect = async () => {
    const device = await requestMicrobit(window.navigator.bluetooth);
    //useStore().connection.device = device;
    if (!device) {
        console.log("No device found.");
        return;
    }
    const services = await getServices(device);
    console.log(device);
    console.log(services);
}

export const Welcome: FC = () => {

    return (
        <>
            <Header />
            <main className={Styles["welcome__main"]}>
                <p className={Styles["welcome__title"]}>Welcome to VanGogh Painter!</p>
                <p className={Styles["welcome__subtitle"]}>Connect via bluetooth.</p>
                <button onClick={handleConnect} className={"btn btn--large"}>Connect <Icon variant={IconVariant.BLUETOOTH} /></button>
            </main>
        </>
    )
}