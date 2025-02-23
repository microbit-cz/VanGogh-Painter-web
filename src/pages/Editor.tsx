import { FC, useContext } from "react";
import { Header } from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import { Icon, IconVariant } from "../components/Icon.tsx";
import { Status } from "../components/Status.tsx";
import { useNavigate } from "react-router-dom";
import { PainterContext } from "../providers/PainterProvider.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import CanvasApp from "../SVGEditor/app.jsx"; // Ensure correct import

export const EditorPage: FC = () => {
    const { unprocessedSVG } = useContext(PainterContext);
    const navigate = useNavigate();

    const handleDone = () => {
        navigate("/Painter");
    };

    const handleCancel = () => {
        navigate("/Painter");
    };

    return (
        <>
            <Header />
            <main className={Styles["editor__container"]}>
                <CanvasApp svgData={unprocessedSVG?.outerHTML} />
                <div className={Styles["editor__menu"]}>
                    <Status />
                    <div className={Styles["editor__buttonContainer"]}>
                        <button className={"btn"} onClick={handleDone}>Done <Icon variant={IconVariant.EDIT} /></button>
                        <button className={"btn"} onClick={handleCancel}>Cancel <Icon variant={IconVariant.CROSS} /></button>
                    </div>
                </div>
            </main>
        </>
    );
};
