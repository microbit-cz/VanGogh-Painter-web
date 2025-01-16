import {FC} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import {Icon, IconVariant} from "../components/Icon.tsx";
import {Status} from "../components/Status.tsx";


export const EditorPage: FC = () => {

    return (
        <>
            <Header/>
            <main>
                <div className={Styles["editor__svgEditor"]}></div>
                <div>
                <Status/>
                    <div>
                        <button className={"btn"}>Done<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"}>Cancel<Icon variant={IconVariant.CROSS}/></button>
                    </div>
                </div>
            </main>
        </>
    )
}