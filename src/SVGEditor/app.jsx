import React, { useContext, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import "./styles.scss";
import AddElements from "./AddElements";
import Settings from "./Settings";
import CanvasSettings from "./CanvasSettings";
import { handleObjectMoving, clearGuidelines } from "./SnappingHelpers.jsx";
import { PainterContext } from "../providers/PainterProvider.js";

function CanvasApp() {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [guidelines, setGuidelines] = useState([]);
    const { currentSVG, unprocessedSVGstr } = useContext(PainterContext);

    useEffect(() => {
        if (!canvasRef.current) return; // Ensure the ref is available

        const initCanvas = new fabric.Canvas(canvasRef.current, {
            width: 500,
            height: 500,
            backgroundColor: "#fff",
        });

        setCanvas(initCanvas);

        initCanvas.on("object:moving", (event) =>
            handleObjectMoving(initCanvas, event.target, guidelines, setGuidelines)
        );

        initCanvas.on("object:modified", () =>
            clearGuidelines(initCanvas, guidelines, setGuidelines)
        );

        return () => {
            initCanvas.dispose(); // Cleanup on unmount
            setCanvas(null); // Reset state
        };
    }, []); // Run only once on mount

    useEffect(() => {
        if (canvas && currentSVG) {
            fabric.loadSVGFromString(unprocessedSVGstr, (objects, options) => {
                const obj = fabric.util.groupSVGElements(objects, options);
                canvas.add(obj);
                canvas.renderAll();
            });
        }
    }, [canvas, currentSVG]); // Re-run when `canvas` or `currentSVG` changes

    const exportSVG = () => {
        if (canvas) {
            const svg = canvas.toSVG();
            const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "canvas.svg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="App">
            <div className="Toolbar darkmode">
                <AddElements canvas={canvas} />
            </div>
            <canvas id="canvas" ref={canvasRef} />
            <div>
                <Settings canvas={canvas} />
                <CanvasSettings canvas={canvas} />
                <button onClick={exportSVG}>Export SVG</button>
            </div>
        </div>
    );
}

export default CanvasApp;
