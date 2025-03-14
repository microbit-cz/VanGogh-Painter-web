import React, {useContext, useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import "./styles.scss";
import AddElements from "./AddElements";
import Settings from "./Settings";
import CanvasSettings from "./CanvasSettings";
import {handleObjectMoving, clearGuidelines} from "./SnappingHelpers.jsx";
import {loadSVGFromString, util} from "fabric";
import {useNavigate} from "react-router-dom";
import {PainterContext} from "../providers/PainterProvider.tsx";

function CanvasApp({svgData, save}) {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [guidelines, setGuidelines] = useState([]);
    const navigate = useNavigate();
    const [lock, setLock] = useState(false); // Used to lock the useEffect during init
    const {canvasRef: globalCanvasRef} = useContext(PainterContext);

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
        globalCanvasRef.current = initCanvas;

        loadSVGFromString(svgData).then((loadedSvg) => {
            const group = util.groupSVGElements(loadedSvg.objects, loadedSvg.options);
            // group.scaleToHeight(500);
            // group.scaleToWidth(500);
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


    return (
        <div className="App">
            <div className="Toolbar darkmode">
                <AddElements canvas={canvas}/>
            </div>
            <canvas id="canvas" ref={canvasRef}/>
            <div className="container">
                <CanvasSettings canvas={canvas}/>
                <Settings canvas={canvas}/>
            </div>
        </div>
    );
}

export default CanvasApp;
