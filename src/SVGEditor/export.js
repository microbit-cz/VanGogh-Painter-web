import * as fabric from "fabric";

export function convertToPath(obj) {
    if (obj.type === "rect") {
        const path = createRectPath(
            obj.left,
            obj.top,
            obj.width,
            obj.height,
            obj.rx || 0,
            obj.angle || 0
        );
        return new fabric.Path(path, {
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
            left: obj.left,
            top: obj.top,
            angle: obj.angle,
            originX: obj.originX,
            originY: obj.originY,
        });
    } else if (obj.type === "circle") {
        const path = createCirclePath(
            obj.left + obj.radius,
            obj.top + obj.radius,
            obj.radius
        );
        return new fabric.Path(path, {
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
            left: obj.left,
            top: obj.top,
            angle: obj.angle,
            originX: obj.originX,
            originY: obj.originY,
        });
    } else if (obj.type === "line") {
        // For a fabric.Line, x1, y1, x2, y2 are defined in the object's own space,
        // while obj.left and obj.top are the center coordinates.
        // Compute local endpoints relative to the center.
        const centerX = (obj.x1 + obj.x2) / 2;
        const centerY = (obj.y1 + obj.y2) / 2;
        const localP1x = obj.x1 - centerX;
        const localP1y = obj.y1 - centerY;
        const localP2x = obj.x2 - centerX;
        const localP2y = obj.y2 - centerY;
        const path = createLinePath(localP1x, localP1y, localP2x, localP2y);
        return new fabric.Path(path, {
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
            fill: "",
            // Set the new path's position and angle to match the original line.
            left: obj.left,
            top: obj.top,
            angle: obj.angle,
            originX: "center",
            originY: "center",
        });
    } else if (obj.type === "triangle") {
        const path = createTrianglePath(
            obj.left,
            obj.top,
            obj.width,
            obj.height
        );
        return new fabric.Path(path, {
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
            left: obj.left,
            top: obj.top,
            angle: obj.angle,
            originX: obj.originX,
            originY: obj.originY,
        });
    }
    return null;
}

// Create SVG path for rectangle
function createRectPath(left, top, width, height, radius, angle) {
    let path;
    if (radius > 0) {
        path = `M ${left + radius} ${top}
L ${left + width - radius} ${top}
Q ${left + width} ${top} ${left + width} ${top + radius}
L ${left + width} ${top + height - radius}
Q ${left + width} ${top + height} ${left + width - radius} ${
            top + height
        }
L ${left + radius} ${top + height}
Q ${left} ${top + height} ${left} ${top + height - radius}
L ${left} ${top + radius}
Q ${left} ${top} ${left + radius} ${top}
Z`;
    } else {
        path = `M ${left} ${top}
L ${left + width} ${top}
L ${left + width} ${top + height}
L ${left} ${top + height}
Z`;
    }
    return path;
}

// Create SVG path for circle
function createCirclePath(cx, cy, r) {
    return `M ${cx} ${cy - r}
A ${r} ${r} 0 0 1 ${cx + r} ${cy}
A ${r} ${r} 0 0 1 ${cx} ${cy + r}
A ${r} ${r} 0 0 1 ${cx - r} ${cy}
A ${r} ${r} 0 0 1 ${cx} ${cy - r}
Z`;
}

// Create SVG path for line
function createLinePath(x1, y1, x2, y2) {
    return `M ${x1} ${y1}
L ${x2} ${y2}`;
}

// Create SVG path for triangle
function createTrianglePath(left, top, width, height) {
    const path = `M ${left + width / 2} ${top}
L ${left + width} ${top + height}
L ${left} ${top + height}
Z`;
    return path;
}