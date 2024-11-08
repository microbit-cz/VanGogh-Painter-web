import {FC} from "react";
import {Header} from "../components/Header.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Welcome.module.css";

export const Welcome: FC = () => {

    return (
        <>
            <Header />
            <main className={Styles["welcome__main"]}>
                <p className={Styles["welcome__title"]}>Welcome to VanGogh Painter!</p>
                <p className={Styles["welcome__subtitle"]}>Connect via bluetooth.</p>
                <button className={"btn btn--large"}>Connect <Icon variant={IconVariant.BLUETOOTH} /></button>
            </main>
        </>
    )
}