import {FC, useContext, useEffect} from "react";
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
import {convertObjects} from "../SVGEditor/converter.ts";

export const EditorPage: FC = () => {
    const {
        unprocessedSVG,
        setCurrentSVG,
        setUnprocessedSVG,
        setUnprocessedSVGstr,
        canvasRef,
        canvas,
        setCanvas,
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

            const objects = canvasRef.current.getObjects();

            // Generate the path data from the canvas objects
            const path = convertObjects(objects);

            // Create an SVG element with a <path> that uses the generated path data
            const svgNamespace = "http://www.w3.org/2000/svg";
            const svgElement = document.createElementNS(svgNamespace, "svg");

            // Create the path element with the "d" attribute set to the generated path data
            const pathElement = document.createElementNS(svgNamespace, "path");
            pathElement.setAttribute("d", path);

            // Append the path element to the SVG
            svgElement.appendChild(pathElement);

            // Existing code for handling another svgElement (if present)
            if (svgElement) {
                setUnprocessedSVG(svgElement);
                setUnprocessedSVGstr(svgElement.outerHTML);

                const pathDataList = extractPathData(svgElement);
                setCurrentSVG(pathDataList);
            }

            setCanvas(canvasRef.current.toJSON());
        }
    };

    useEffect(() => {
        if (!canvas || !canvasRef.current) return;
        canvasRef.current.loadFromJSON(canvas);
    }, [canvas, canvasRef]);

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
