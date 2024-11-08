import {FC} from "react";
import {Header} from "../components/Header.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";

export const Welcome: FC = () => {

    return (
        <>
            <Header />
            <main>
                <p>Welcome to VanGogh Painter!</p>
                <p>Connect via bluetooth.</p>
                <button className={"btn btn--large"}>Connect <Icon variant={IconVariant.BLUETOOTH} /></button>
            </main>
        </>
    )
}