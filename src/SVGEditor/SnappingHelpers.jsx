import { Line } from "fabric";

const snappingDistance = 10;

export const handleObjectMoving = (canvas, obj, guidelines, setGuidelines) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const left = obj.left;
    const top = obj.top;
    const right = left + obj.width * obj.scaleX;
    const bottom = top + obj.height * obj.scaleY;

    const centerX = left + (obj.width * obj.scaleX) / 2;
    const centerY = top + (obj.height * obj.scaleY) / 2;

    let newGuidelines = [];
    clearGuidelines(canvas);

    let snapped = false;

    if (Math.abs(left) < snappingDistance) {
        obj.set({ left: 0 });
        if (!guidelineExists(canvas, "vertical-left")) {
            const line = createVerticalGuideline(canvas, 0, "vertical-left");
            newGuidelines.push(line);
            canvas.add(line);
        }
        snapped = true;
    }

    if (Math.abs(top) < snappingDistance) {
        obj.set({ top: 0 });
        if (!guidelineExists(canvas, "horizontal-top")) {
            const line = createHorizontalGuideline(canvas, 0, "horizontal-top");
            newGuidelines.push(line);
            canvas.add(line);
        }
        snapped = true;
    }

    if (Math.abs(centerX - canvasWidth / 2) < snappingDistance) {
        obj.set({ left: canvasWidth / 2 - (obj.width * obj.scaleX) / 2 });
        if (!guidelineExists(canvas, "vertical-center")) {
            const line = createVerticalGuideline(
                canvas,
                canvasWidth / 2,
                "vertical-center"
            );
            newGuidelines.push(line);
            canvas.add(line);
        }
        snapped = true;
    }

    if (Math.abs(centerY - canvasHeight / 2) < snappingDistance) {
        obj.set({ top: canvasHeight / 2 - (obj.height * obj.scaleY) / 2 });
        if (!guidelineExists(canvas, "horizontal-center")) {
            const line = createHorizontalGuideline(
                canvas,
                canvasHeight / 2,
                "horizontal-center"
            );
            newGuidelines.push(line);
            canvas.add(line);
        }
        snapped = true;
    }

    if (!snapped) {
        clearGuidelines(canvas);
    } else {
        setGuidelines(newGuidelines);
    }

    canvas.renderAll();
};

export const createVerticalGuideline = (canvas, x, id) => {
    return new Line([x, 0, x, canvas.height], {
        id: id || "", // Ensure id is always a string
        stroke: "red",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
        opacity: 0.8,
    });
};

export const createHorizontalGuideline = (canvas, y, id) => {
    return new Line([0, y, canvas.width, y], {
        id: id || "", // Ensure id is always a string
        stroke: "red",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
        opacity: 0.8,
    });
};

export const clearGuidelines = (canvas) => {
    const objects = canvas.getObjects("line");
    objects.forEach((obj) => {
        // Ensure obj.id is defined before calling startsWith
        if (obj.id && (obj.id.startsWith("vertical-") || obj.id.startsWith("horizontal-"))) {
            canvas.remove(obj);
        }
    });
    canvas.renderAll();
};

const guidelineExists = (canvas, id) => {
    const objects = canvas.getObjects("line");
    return objects.some((obj) => obj.id === id); // Only compare if obj.id exists
};