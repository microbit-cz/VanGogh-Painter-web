import {FC, useContext, useState} from "react";
import {Header} from "../components/Header.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Welcome.module.css";
import {getServices, requestMicrobit} from "microbit-web-bluetooth";
import {Status} from "../components/Status.tsx";
import {useNavigate} from "react-router-dom";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {microbitStore} from "../stores/main.ts";
/*
const drawState = reactive({
    h: 0,
    clr: 'rgb(206, 12, 12)',
    txt: 'Waiting for upload'
})
let itCnt = 0

const output = ref('')
*/
export const Welcome: FC = () => {
    const { dispatch } = useContext(PainterContext);
    const navigate = useNavigate();
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    //let input: [] = []



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
            navigate("/upload");
        }
    }
/*
    const sendout () => {
        let textOut = '['
        input.forEach((x) => (textOut += `[${x[0]}, ${x[1]}],`))
        textOut += '[4,0]]'
        if (service) {
            let sendText = '%' + textOut + '%'
            console.log(sendText)
            drawState.txt = 'Uploading'
            itCnt = Math.ceil(sendText.length / 14)
            for (let i = 0; i < sendText.length; i += 14) {
                console.log(sendText.slice(i, i + 14) + '$')
                service.sendText(sendText.slice(i, i + 14) + '$')
            }
        }
        navigator.clipboard.writeText(textOut)
        output.value = textOut
        alert(textOut)
    }
*/
    return (
        <>
            <Header />
            <main className={Styles["welcome__main"]}>
                <p className={Styles["welcome__title"]}>Welcome to VanGogh Painter!</p>
                <p className={Styles["welcome__subtitle"]}>Connect via bluetooth.</p>
                <button onClick={handleConnect} className={"btn btn--large"}>Connect <Icon variant={IconVariant.BLUETOOTH} /></button>
            </main>
            <Status />
        </>
    )
}