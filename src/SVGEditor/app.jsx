import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import "./styles.scss";
import AddElements from "./AddElements";
import Settings from "./Settings";
import CanvasSettings from "./CanvasSettings";
import { handleObjectMoving, clearGuidelines } from "./SnappingHelpers.jsx";

function CanvasApp() {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [guidelines, setGuidelines] = useState([]);

    // Sample SVG string (you can replace this with your own SVG)
    const sampleSVG = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
        </svg>
    `;

    useEffect(() => {
        if (canvasRef.current) {
            const initCanvas = new Canvas(canvasRef.current, {
                width: 500,
                height: 500,
            });

            initCanvas.backgroundColor = "#fff";
            initCanvas.renderAll();

            setCanvas(initCanvas);

            initCanvas.on("object:moving", (event) =>
                handleObjectMoving(initCanvas, event.target, guidelines, setGuidelines)
            );

            initCanvas.on("object:modified", () =>
                clearGuidelines(initCanvas, guidelines, setGuidelines)
            );

            // Automatically load the SVG when the component mounts
            initCanvas.loadSVGFromString(sampleSVG, (objects, options) => {
                const obj = fabric.util.groupSVGElements(objects, options);
                initCanvas.add(obj);
                initCanvas.renderAll();
            });

            return () => {
                initCanvas.dispose();
            };
        }
    }, []);

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
                <button onClick={exportSVG}>Export SVG</button>
            </div>
            <canvas id="canvas" ref={canvasRef} />
            <div>
                <Settings canvas={canvas} />
                <CanvasSettings canvas={canvas} />
            </div>
        </div>
    );
}

export default CanvasApp;
