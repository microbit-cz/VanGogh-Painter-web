import {Circle, Line, Rect, Triangle} from "fabric";
import {IconButton} from "blocksin-system";
import {CircleIcon, DownloadIcon, MinusIcon, SquareIcon, TriangleIcon} from "sebikostudio-icons";
import React from "react";

function AddElements({ canvas }) {
    const addRectangle = () => {
        if (canvas) {
            const rect = new Rect({
                top: 0,
                left: 0,
                width: 100,
                height: 60,
                fill: "",
                stroke: "black"
            });

            canvas.add(rect);
        }
    };

    const addTriangle = () => {
        if (canvas) {
            const triangle = new Triangle({
                top: 0,
                left: 0,
                width: 100,
                height: 100,
                fill: "",
                stroke: "black"
            });

            canvas.add(triangle);
        }
    }

    const addCircle = () => {
        if (canvas) {
            const circle = new Circle({
                top: 0,
                left: 0,
                radius: 50,
                fill: "",
                stroke: "black"
            });

            canvas.add(circle);
        }
    }

    const addLine = () => {
        if (canvas) {
            const line = new Line([0, 0, 100, 100], {
            stroke: "black"
            });

            canvas.add(line);
        }
    }

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
        <div>
            <IconButton onClick={addRectangle} variant="ghost" size="medium">
                <SquareIcon/>
            </IconButton>
            <IconButton onClick={addTriangle} variant="ghost" size="medium">
                <TriangleIcon/>
            </IconButton>
            <IconButton onClick={addCircle} variant="ghost" size="medium">
                <CircleIcon/>
            </IconButton>
            <IconButton onClick={addLine} variant="ghost" size="medium">
                <MinusIcon/>
            </IconButton>
            <IconButton onClick={exportSVG} variant="ghost" size="medium">
                <DownloadIcon/>
            </IconButton>
        </div>
    );
}

export default AddElements;