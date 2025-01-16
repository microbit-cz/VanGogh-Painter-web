import {FC, useState} from "react";
import {Header} from "../components/Header.tsx";
import {ProgressBar} from "../components/ProgressBar.tsx";
import {ScaleSetting} from "../components/ScaleSetting.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Painter.module.css";
import {Status} from "../components/Status.tsx";

const handleEdit = () => {

}

export const Painter: FC = () => {
    const [isWorking, setIsWorking] = useState(false);

    return (
        <>
            <Header />
            <main className={Styles["painter__container"]}>
                <div className={`${Styles["painter__section"]} ${Styles["left"]}`}>
                    <ProgressBar/>
                    <div className={Styles["painter__display"]}></div>

                </div>
                <div className={`${Styles["painter__section"]} ${Styles["right"]}`}>
                    <div className={Styles["painter__topContainer"]}>
                        <Status />
                        <ScaleSetting/>
                    </div>
                    <div className={Styles["painter__buttonContainer"]}>
                        <button className={"btn"}>{isWorking ? "Pause" : "Start"}<Icon variant={IconVariant.PLAY_PAUSE}/></button>
                        <button className={"btn"} onClick={handleEdit}>Edit<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"}>Cancel<Icon variant={IconVariant.CROSS}/></button>
                    </div>
                </div>
            </main>
        </>
    )
}