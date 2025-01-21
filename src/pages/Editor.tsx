import {FC} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import {Icon, IconVariant} from "../components/Icon.tsx";
import {Status} from "../components/Status.tsx";
import {useNavigate} from "react-router-dom";

export const EditorPage: FC = () => {
    const navigate = useNavigate();

    const handleDone = () => {
        navigate("/Painter");
    }

    const handleCancel = () => {
        navigate("/Painter");
    };

    return (
        <>
            <Header/>
            <main className={Styles["editor__container"]}>
                <iframe className={Styles["editor__svgEditor"]} src={"https://unpkg.com/svgedit@7.3.4/dist/editor/index.html"}></iframe>
                <div className={Styles["editor__menu"]}>
                    <Status/>
                    <div className={Styles["editor__buttonContainer"]}>
                        <button className={"btn"} onClick={handleDone}>Done<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"} onClick={handleCancel}>Cancel<Icon variant={IconVariant.CROSS}/></button>
                    </div>
                </div>
            </main>
        </>
    )
}