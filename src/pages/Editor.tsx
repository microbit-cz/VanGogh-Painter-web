import {FC} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import {Icon, IconVariant} from "../components/Icon.tsx";
import {Status} from "../components/Status.tsx";

export const EditorPage: FC = () => {

    return (
        <>
            <Header/>
            <main className={Styles["editor__container"]}>
                <iframe className={Styles["editor__svgEditor"]} src={"https://unpkg.com/svgedit@7.3.4/dist/editor/index.html"}></iframe>
                <div className={Styles["editor__menu"]}>
                    <Status/>
                    <div className={Styles["editor__buttonContainer"]}>
                        <button className={"btn"}>Done<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"}>Cancel<Icon variant={IconVariant.CROSS}/></button>
                    </div>
                </div>
            </main>
        </>
    )
}