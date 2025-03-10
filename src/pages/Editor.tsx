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
import {Canvas, TSVGExportOptions} from "fabric";

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

            const canvas = canvasRef.current;

            const tempCanvas = new Canvas(document.createElement("canvas"));
            canvasRef.current.getObjects().forEach(obj => {
                if (obj.isType("rect", "circle", "line", "triangle")) {
                    // TODO: predelat podle kodu z test stranky script.js:72
                    const path = convertToPath(obj);
                    if (path) {
                        tempCanvas.add(path);
                    }
                } else {
                    tempCanvas.add(obj);
                }
            });

            const svgOptions: TSVGExportOptions = {
                suppressPreamble: false,
                viewBox: {
                    x: 0,
                    y: 0,
                    width: canvas.width,
                    height: canvas.height
                },
                width: canvas.width.toString(),
                height: canvas.height.toString(),
            };

            const svgData = tempCanvas.toSVG(svgOptions);
            console.log(svgData);

            const svgElement = new DOMParser().parseFromString(svgData, "image/svg+xml").querySelector('svg');

            if (svgElement) {
                setUnprocessedSVG(svgElement);
                setUnprocessedSVGstr(svgData);

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
