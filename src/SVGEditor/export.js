import * as fabric from 'fabric';

// Process objects recursively (to handle groups)
export function processObjects(objects, targetCanvas, parentMatrix) {
    objects.forEach(obj => {
        if (obj.type === 'group') {
            // For groups, we need to handle transformations carefully

            // Get the group's matrix
            const groupMatrix = obj.calcTransformMatrix();

            // If there's a parent matrix, combine them
            const finalGroupMatrix = parentMatrix ?
                fabric.util.multiplyTransformMatrices(parentMatrix, groupMatrix) :
                groupMatrix;

            // Process all objects in the group using the group's matrix as their parent
            processObjects(obj.getObjects(), targetCanvas, finalGroupMatrix);
        } else {
            // For individual objects, we need to:
            // 1. Get the object's transform without any group transformations
            const localMatrix = [
                obj.scaleX, 0, 0, obj.scaleY,
                obj.left + (obj.width * obj.scaleX * 0.5),
                obj.top + (obj.height * obj.scaleY * 0.5)
            ];

            // 2. If we have a parent matrix (from groups), apply it after the local transform
            const finalMatrix = parentMatrix ?
                fabric.util.multiplyTransformMatrices(parentMatrix, localMatrix) :
                obj.calcTransformMatrix();

            // Now convert the object to a path with this transformation
            convertObjectToPath(obj, finalMatrix, targetCanvas);
        }
    });
}

// Multiply two matrices
function multiplyMatrices(a, b) {
    return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4],
        a[1] * b[4] + a[3] * b[5] + a[5]
    ];
}

// Convert an object to a path with all transformations applied
function convertObjectToPath(obj, matrix, targetCanvas) {
    // Set up the basic styling properties
    const options = {
        fill: obj.fill || "",
        stroke: obj.stroke || "",
        strokeWidth: obj.strokeWidth || 0,
        opacity: obj.opacity || 1,
        // Reset all transformation properties
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        angle: 0,
        originX: 'center',
        originY: 'center'
    };

    let pathData;

    try {
        if (obj.type === 'rect') {
            pathData = createRectPathFromMatrix(obj.width, obj.height, obj.rx || 0, matrix);
        } else if (obj.type === 'circle') {
            pathData = createCirclePathFromMatrix(obj.radius, matrix);
        } else if (obj.type === 'triangle') {
            pathData = createTrianglePathFromMatrix(obj.width, obj.height, matrix);
        } else if (obj.type === 'line') {
            pathData = createLinePathFromMatrix([obj.x1, obj.y1, obj.x2, obj.y2], matrix);
        } else if (obj.type === 'path') {
            // For paths, a more direct approach is needed
            if (typeof obj.path === 'string') {
                // If it's a path string, create a temporary path object
                const tempPath = new fabric.Path(obj.path);
                // Apply the transform matrix
                const transformed = applyTransformToPath(tempPath.path, matrix);
                pathData = transformed;
            } else if (Array.isArray(obj.path)) {
                // If it's already a path array, transform it directly
                pathData = applyTransformToPath(obj.path, matrix);
            }
        } else {
            console.warn("Unsupported object type:", obj.type);
            return;
        }

        if (pathData) {
            const pathObj = new fabric.Path(pathData, options);
            targetCanvas.add(pathObj);
        }
    } catch (err) {
        console.error("Error processing object:", err);
    }
}

// Helper function to apply a transform matrix to a path
function applyTransformToPath(path, matrix) {
    if (!Array.isArray(path)) return path;

    const result = [];

    for (let i = 0; i < path.length; i++) {
        const command = path[i];
        const cmd = Array.isArray(command) ? command[0] : command.command;

        if (cmd === 'M' || cmd === 'L') {
            if (Array.isArray(command)) {
                const point = transformPoint({x: command[1], y: command[2]}, matrix);
                result.push([cmd, point.x, point.y]);
            } else {
                const point = transformPoint({x: command.x, y: command.y}, matrix);
                result.push({command: cmd, x: point.x, y: point.y});
            }
        } else if (cmd === 'C') {
            if (Array.isArray(command)) {
                const p1 = transformPoint({x: command[1], y: command[2]}, matrix);
                const p2 = transformPoint({x: command[3], y: command[4]}, matrix);
                const p3 = transformPoint({x: command[5], y: command[6]}, matrix);
                result.push([cmd, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
            } else {
                const p1 = transformPoint({x: command.x1, y: command.y1}, matrix);
                const p2 = transformPoint({x: command.x2, y: command.y2}, matrix);
                const p3 = transformPoint({x: command.x, y: command.y}, matrix);
                result.push({command: cmd, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x: p3.x, y: p3.y});
            }
        } else if (cmd === 'Q') {
            if (Array.isArray(command)) {
                const p1 = transformPoint({x: command[1], y: command[2]}, matrix);
                const p2 = transformPoint({x: command[3], y: command[4]}, matrix);
                result.push([cmd, p1.x, p1.y, p2.x, p2.y]);
            } else {
                const p1 = transformPoint({x: command.x1, y: command.y1}, matrix);
                const p2 = transformPoint({x: command.x, y: command.y}, matrix);
                result.push({command: cmd, x1: p1.x, y1: p1.y, x: p2.x, y: p2.y});
            }
        } else if (cmd === 'Z') {
            if (Array.isArray(command)) {
                result.push(['Z']);
            } else {
                result.push({command: 'Z'});
            }
        }
    }

    return result;
}


// Transform a point using the transformation matrix
function transformPoint(point, matrix) {
    return fabric.util.transformPoint({
        x: point.x || point[0],
        y: point.y || point[1]
    }, matrix);
}

// Create rectangle path using the transformation matrix
function createRectPathFromMatrix(width, height, radius, matrix) {
    // Define the rectangle points in the object's coordinate system
    const halfW = width / 2;
    const halfH = height / 2;

    if (radius > 0) {
        // Handle rounded corners
        const points = [];
        const r = Math.min(radius, halfW, halfH);

        // Top left corner
        points.push(transformPoint([-halfW + r, -halfH], matrix));
        // Top edge to top right corner
        points.push(transformPoint([halfW - r, -halfH], matrix));
        // Top right corner arc
        const trStart = transformPoint([halfW, -halfH + r], matrix);
        points.push({
            command: 'Q',
            points: [
                transformPoint([halfW, -halfH], matrix),
                trStart
            ]
        });
        // Right edge to bottom right corner
        points.push(transformPoint([halfW, halfH - r], matrix));
        // Bottom right corner arc
        const brStart = transformPoint([halfW - r, halfH], matrix);
        points.push({
            command: 'Q',
            points: [
                transformPoint([halfW, halfH], matrix),
                brStart
            ]
        });
        // Bottom edge to bottom left corner
        points.push(transformPoint([-halfW + r, halfH], matrix));
        // Bottom left corner arc
        const blStart = transformPoint([-halfW, halfH - r], matrix);
        points.push({
            command: 'Q',
            points: [
                transformPoint([-halfW, halfH], matrix),
                blStart
            ]
        });
        // Left edge to top left corner
        points.push(transformPoint([-halfW, -halfH + r], matrix));
        // Top left corner arc
        const tlStart = transformPoint([-halfW + r, -halfH], matrix);
        points.push({
            command: 'Q',
            points: [
                transformPoint([-halfW, -halfH], matrix),
                tlStart
            ]
        });

        // Construct the path string
        let pathData = `M ${points[0].x},${points[0].y} `;
        pathData += `L ${points[1].x},${points[1].y} `;
        pathData += `Q ${points[2].points[0].x},${points[2].points[0].y} ${points[2].points[1].x},${points[2].points[1].y} `;
        pathData += `L ${points[3].x},${points[3].y} `;
        pathData += `Q ${points[4].points[0].x},${points[4].points[0].y} ${points[4].points[1].x},${points[4].points[1].y} `;
        pathData += `L ${points[5].x},${points[5].y} `;
        pathData += `Q ${points[6].points[0].x},${points[6].points[0].y} ${points[6].points[1].x},${points[6].points[1].y} `;
        pathData += `L ${points[7].x},${points[7].y} `;
        pathData += `Q ${points[8].points[0].x},${points[8].points[0].y} ${points[8].points[1].x},${points[8].points[1].y} `;
        pathData += 'Z';

        return pathData;
    } else {
        // Simple rectangle
        const tl = transformPoint([-halfW, -halfH], matrix);
        const tr = transformPoint([halfW, -halfH], matrix);
        const br = transformPoint([halfW, halfH], matrix);
        const bl = transformPoint([-halfW, halfH], matrix);

        return `M ${tl.x},${tl.y} L ${tr.x},${tr.y} L ${br.x},${br.y} L ${bl.x},${bl.y} Z`;
    }
}

// Create circle path using the transformation matrix
function createCirclePathFromMatrix(radius, matrix) {
    // For circles, we need to approximate with Bezier curves
    // We'll use 4 quadratic bezier curves to create the circle

    const center = transformPoint([0, 0], matrix);

    // Calculate control points for the circle based on the transformed radius
    // We'll create 4 arcs to form the circle
    const top = transformPoint([0, -radius], matrix);
    const right = transformPoint([radius, 0], matrix);
    const bottom = transformPoint([0, radius], matrix);
    const left = transformPoint([-radius, 0], matrix);

    // Calculate the control points for bezier curves
    // Magic number: 0.552284749831 is (4/3)*tan(π/8)
    const control = 0.552284749831 * radius;

    const topRight = transformPoint([control, -radius], matrix);
    const rightTop = transformPoint([radius, -control], matrix);

    const rightBottom = transformPoint([radius, control], matrix);
    const bottomRight = transformPoint([control, radius], matrix);

    const bottomLeft = transformPoint([-control, radius], matrix);
    const leftBottom = transformPoint([-radius, control], matrix);

    const leftTop = transformPoint([-radius, -control], matrix);
    const topLeft = transformPoint([-control, -radius], matrix);

    // Construct the path
    return `M ${top.x},${top.y} 
          C ${topRight.x},${topRight.y} ${rightTop.x},${rightTop.y} ${right.x},${right.y}
          C ${rightBottom.x},${rightBottom.y} ${bottomRight.x},${bottomRight.y} ${bottom.x},${bottom.y}
          C ${bottomLeft.x},${bottomLeft.y} ${leftBottom.x},${leftBottom.y} ${left.x},${left.y}
          C ${leftTop.x},${leftTop.y} ${topLeft.x},${topLeft.y} ${top.x},${top.y}
          Z`;
}

// Create triangle path using the transformation matrix
function createTrianglePathFromMatrix(width, height, matrix) {
    const halfW = width / 2;
    const halfH = height / 2;

    // Define triangle points in object's coordinate system
    const top = transformPoint([0, -halfH], matrix);
    const right = transformPoint([halfW, halfH], matrix);
    const left = transformPoint([-halfW, halfH], matrix);

    return `M ${top.x},${top.y} L ${right.x},${right.y} L ${left.x},${left.y} Z`;
}

// Create line path using the transformation matrix
function createLinePathFromMatrix(points, matrix) {
    // Points are in format [x1, y1, x2, y2]
    // Need to convert to coordinate system centered at the line's center
    const centerX = (points[0] + points[2]) / 2;
    const centerY = (points[1] + points[3]) / 2;

    const p1 = transformPoint([points[0] - centerX, points[1] - centerY], matrix);
    const p2 = transformPoint([points[2] - centerX, points[3] - centerY], matrix);

    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y}`;
}

// Transform an existing path using the matrix
function transformPath(pathData, matrix) {
    if (!pathData) return null;

    try {
        // Create a temporary path object
        const tempPath = new fabric.Path(pathData);

        // Apply the transformation matrix
        tempPath.transform(matrix);

        // Return the transformed path data
        return tempPath.path;
    } catch (err) {
        console.error("Error transforming path:", err);
        return pathData; // Return original if transformation fails
    }
}