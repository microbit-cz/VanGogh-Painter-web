import React, {useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import "./styles.scss";
import AddElements from "./AddElements";
import Settings from "./Settings";
import CanvasSettings from "./CanvasSettings";
import {handleObjectMoving, clearGuidelines} from "./SnappingHelpers.jsx";
import {loadSVGFromString, util} from "fabric";
import {useNavigate} from "react-router-dom";

function CanvasApp({svgData}) {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [guidelines, setGuidelines] = useState([]);
    const navigate = useNavigate();
    const [lock, setLock] = useState(false); // Used to lock the useEffect during init

    useEffect(() => {
        if (!canvasRef.current || canvas || lock) return; // Ensure the ref is available
        setLock(true);
        if (!svgData) {
            navigate("/");
        }

        const initCanvas = new fabric.Canvas(canvasRef.current, {
            width: 500,
            height: 500,
            backgroundColor: "#fff",
        })

        setCanvas(initCanvas);

        loadSVGFromString(svgData).then((loadedSvg) => {
            const group = util.groupSVGElements(loadedSvg.objects, loadedSvg.options);
            group.scaleToHeight(500);
            group.scaleToWidth(500);
            initCanvas.add(group);
            initCanvas.renderAll();
        })

        initCanvas.on("object:moving", (event) =>
            handleObjectMoving(initCanvas, event.target, guidelines, setGuidelines)
        );

        initCanvas.on("object:modified", () =>
            clearGuidelines(initCanvas, guidelines, setGuidelines)
        );

        setLock(false);

        return () => {
            initCanvas.dispose();
            setCanvas(null);
        };
    }, []); // Run only once on mount

    const exportSVG = () => {
        if (canvas) {
            const svg = canvas.toSVG();
            const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
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
                <AddElements canvas={canvas}/>
            </div>
            <canvas id="canvas" ref={canvasRef}/>
            <div>
                <Settings canvas={canvas}/>
                <CanvasSettings canvas={canvas}/>
                <button onClick={exportSVG}>Export SVG</button>
            </div>
        </div>
    );
}

export default CanvasApp;
