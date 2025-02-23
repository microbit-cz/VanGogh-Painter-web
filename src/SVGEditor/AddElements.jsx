import {Circle, Line, Rect, Triangle} from "fabric";
import {IconButton} from "blocksin-system";
import {CircleIcon, MinusIcon, SquareIcon, TriangleIcon} from "sebikostudio-icons";
import React from "react";

function AddElements({ canvas }) {
    const addRectangle = () => {
        if (canvas) {
            const rect = new Rect({
                top: 100,
                left: 50,
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
                top: 100,
                left: 50,
                radius: 50,
                fill: "",
                stroke: "black"
            });

            canvas.add(triangle);
        }
    }

    const addCircle = () => {
        if (canvas) {
            const circle = new Circle({
                top: 100,
                left: 50,
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
        </div>
    );
}

export default AddElements;