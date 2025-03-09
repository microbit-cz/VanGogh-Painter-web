import {FC, useContext} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./Editor.module.css";
import {Icon, IconVariant} from "../components/Icon.tsx";
import {Status} from "../components/Status.tsx";
import {useNavigate} from "react-router-dom";
import {PainterContext} from "../providers/PainterProvider.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import CanvasApp from "../SVGEditor/app.jsx";
import {extractPathData} from "../utils.ts";

export const EditorPage: FC = () => {
    const {
        unprocessedSVG,
        setCurrentSVG,
        setUnprocessedSVG,
        setUnprocessedSVGstr,
        canvasRef
    } = useContext(PainterContext);
    const navigate = useNavigate();

    const handleDone = () => {
        handleSave();
        navigate("/Painter");
    };

    const handleCancel = () => {
        navigate("/Painter");
    };

    const handleSave = () => {
        if (canvasRef.current) {
            console.log(canvasRef.current);
            console.log("saving");
            const svg = canvasRef.current.toSVG({
                width: canvasRef.current?.width.toString() ?? "500",
                height: canvasRef.current?.height.toString() ?? "500",
                viewBox: {
                    width: canvasRef.current?.width ?? 500,
                    height: canvasRef.current?.height ?? 500,
                    x: 0,
                    y: 0
                }
            });
            const svgElement = new DOMParser().parseFromString(svg, "image/svg+xml").querySelector('svg');

            if (svgElement) {
                setUnprocessedSVG(svgElement);
                setUnprocessedSVGstr(svg);

                const pathDataList = extractPathData(svgElement);
                setCurrentSVG(pathDataList);
            }
        }
    };


    return (
        <>
            <Header/>
            <main className={Styles["editor__container"]}>
                <CanvasApp svgData={unprocessedSVG?.outerHTML}/>
                <div className={Styles["editor__menu"]}>
                    <Status/>
                    <div className={Styles["editor__buttonContainer"]}>
                        <button className={"btn"} onClick={handleDone}>Done <Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"} onClick={handleCancel}>Cancel <Icon variant={IconVariant.CROSS}/>
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
};
