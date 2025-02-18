import {Circle, Rect} from "fabric";
import {IconButton} from "blocksin-system";
import {CircleIcon, SquareIcon} from "sebikostudio-icons";
import React from "react";

function AddElements({ canvas }) {
    const addRectangle = () => {
        if (canvas) {
            const rect = new Rect({
                top: 100,
                left: 50,
                width: 100,
                height: 60,
                fill: "#D84D42",
            });

            canvas.add(rect);
        }
    };

    const addCircle = () => {
        if (canvas) {
            const circle = new Circle({
                top: 100,
                left: 50,
                radius: 50,
                fill: "#42D8A4",
            });

            canvas.add(circle);
        }
    }

    return (
        <div>
            <IconButton onClick={addRectangle} variant="ghost" size="medium">
                <SquareIcon/>
            </IconButton>
            <IconButton onClick={addCircle} variant="ghost" size="medium">
                <CircleIcon/>
            </IconButton>
        </div>
    );
}

export default AddElements;