import {FC, useContext} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import {Icon, IconVariant} from "../components/Icon.tsx";
import {Status} from "../components/Status.tsx";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {useNavigate} from "react-router-dom";

export const EditorPage: FC = () => {
    const { setCurrentSVG } = useContext(PainterContext);
    const navigate = useNavigate();

    const iframe = document.querySelector(`.${Styles["editor__svgEditor"]}`) as HTMLIFrameElement;
    const svgContent = iframe.contentDocument?.documentElement.outerHTML;
/*
    const handleDownload = () => {
        const blob = new Blob([svgContent!], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
*/
    const handleDone = () => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent!, "image/svg+xml");
        const paths = Array.from(svgDoc.getElementsByTagName('path')).map(path => path.outerHTML);
        setCurrentSVG(paths);
        console.log(paths);
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