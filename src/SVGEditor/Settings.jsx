import React, { useState, useEffect } from "react";
import { Input } from "blocksin-system";

function Settings({ canvas }) {
    const [selectedObject, setSelectedObject] = useState(null);
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [diameter, setDiameter] = useState("");
    const [color, setColor] = useState("");
    const [radius, setRadius] = useState("");

    useEffect(() => {
        if (canvas) {
            canvas.on("selection:created", (event) => {
                handleObjectSelection(event.selected[0]);
            });

            canvas.on("selection:updated", (event) => {
                handleObjectSelection(event.selected[0]);
            });

            canvas.on("selection:cleared", () => {
                setSelectedObject(null);
                clearSettings();
            });

            canvas.on("object:modified", (event) => {
                handleObjectSelection(event.target);
            });

            canvas.on("object:scaling", (event) => {
                handleObjectSelection(event.target);
            });
        }
    }, [canvas]);

    const handleObjectSelection = (object) => {
        if (!object) {}

        setSelectedObject(object);

        if (object.type === "rect") {
            setWidth(Math.round(object.width * object.scaleX));
            setHeight(Math.round(object.height * object.scaleY));
            setColor(object.fill);
            setDiameter("");
        } else if (object.type === "circle") {
            setDiameter(Math.round(2 * object.radius * object.scaleX));
            setColor(object.fill);
            setWidth("");
            setHeight("");
        }
    };

    const clearSettings = () => {
        setWidth("");
        setHeight("");
        setDiameter("");
        setColor("");
    }

    const handleWidthChange = (e) => {
        const value = e.target.value.replace(/,/g, "")
        const intValue = parseInt(value, 10);

        setWidth(intValue);

        if (selectedObject && selectedObject.type === "rect" && intValue >= 0) {
            selectedObject.set({ width: intValue / selectedObject.scaleX });
            canvas.renderAll();
        }
    };

    const handleHeightChange = (e) => {
        const value = e.target.value.replace(/,/g, "");
        const intValue = parseInt(value, 10);

        setHeight(intValue);

        if (selectedObject && selectedObject.type === "rect" && intValue >= 0) {
            selectedObject.set({ height: intValue / selectedObject.scaleY });
            canvas.renderAll();
        }
    };
    const handleDiameterChange = (e) => {
        const value = e.target.value.replace(/,/g, "");
        const intValue = parseInt(value, 10);

        setDiameter(intValue);

        if (selectedObject && selectedObject.type === "circle" && intValue >= 0) {
            selectedObject.set({ radius: intValue / 2 / selectedObject.scaleX });
            canvas.renderAll();
        }
    };

    const handleRadiusChange = (e) => {
        const value = e.target.value.replace(/,/g, "");
        const intValue = parseInt(value, 10);

        setRadius(intValue);

        if (selectedObject && selectedObject.type === "triangle" && intValue >= 0) {
            selectedObject.set({ radius: intValue / selectedObject.scaleX });
            canvas.renderAll();
        }
    };

    return (
        <div className="Settings darkmode">
            {selectedObject && selectedObject.type === "rect" && (
                <>
                    <Input
                        fluid
                        label="Width"
                        value={width}
                        onChange={handleWidthChange}
                    />
                    <Input
                        label="Height"
                        value={height}
                        fluid
                        onChange={handleHeightChange}
                    />
                </>
            )}
            {selectedObject && selectedObject.type === "triangle" && (
                <>
                    <Input
                        fluid
                        label="Radius"
                        value={radius}
                        onChange={handleRadiusChange}
                    />
                </>
            )}
            {selectedObject && selectedObject.type === "circle" && (
                <>
                    <Input
                        fluid
                        label="Diameter"
                        value={diameter}
                        onChange={handleDiameterChange}
                    />
                </>
            )}
        </div>
    );
}

export default Settings;