import * as fabric from "fabric";
import {Path, Point, TMat2D} from "fabric";

// Transform a point using the transformation matrix
export function transformPoint(point: number[], matrix: TMat2D) {
    return fabric.util.transformPoint({
        x: point[0],
        y: point[1]
    }, matrix);
}

// Create rectangle path using the transformation matrix
export function createRectPathFromMatrix(width: number, height: number, radius: number, matrix: TMat2D) {
    // Define the rectangle points in the object's coordinate system
    const halfW = width / 2;
    const halfH = height / 2;

    if (radius > 0) {
        // Handle rounded corners
        const points: {
            command: string;
            points: Point[]
        }[] = [];
        const r = Math.min(radius, halfW, halfH);

        // Top left corner
        points.push({
            command: '',
            points: [transformPoint([-halfW + r, -halfH], matrix)],
        });
        // Top edge to top right corner
        points.push({
            command: '',
            points: [transformPoint([halfW - r, -halfH], matrix)]
        });
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
        points.push({
            command: '',
            points: [transformPoint([halfW, halfH - r], matrix)]
        });
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
        points.push({
            command: '',
            points: [transformPoint([-halfW + r, halfH], matrix)]
        });
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
        points.push({
            command: '',
            points: [transformPoint([-halfW, -halfH + r], matrix)]
        });
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
        let pathData = `M ${points[0].points[0].x},${points[0].points[1].y} `;
        pathData += `L ${points[1].points[0].x},${points[1].points[1].y} `;
        pathData += `Q ${points[2].points[0].x},${points[2].points[0].y} ${points[2].points[1].x},${points[2].points[1].y} `;
        pathData += `L ${points[3].points[0].x},${points[3].points[1].y} `;
        pathData += `Q ${points[4].points[0].x},${points[4].points[0].y} ${points[4].points[1].x},${points[4].points[1].y} `;
        pathData += `L ${points[5].points[0].x},${points[5].points[1].y} `;
        pathData += `Q ${points[6].points[0].x},${points[6].points[0].y} ${points[6].points[1].x},${points[6].points[1].y} `;
        pathData += `L ${points[7].points[0].x},${points[7].points[1].y} `;
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
export function createCirclePathFromMatrix(radius: number, matrix: TMat2D) {
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
export function createTrianglePathFromMatrix(width: number, height: number, matrix: TMat2D) {
    const halfW = width / 2;
    const halfH = height / 2;

    // Define triangle points in object's coordinate system
    const top = transformPoint([0, -halfH], matrix);
    const right = transformPoint([halfW, halfH], matrix);
    const left = transformPoint([-halfW, halfH], matrix);

    return `M ${top.x},${top.y} L ${right.x},${right.y} L ${left.x},${left.y} Z`;
}

// Create line path using the transformation matrix
export function createLinePathFromMatrix(points: number[], matrix: TMat2D) {
    // Points are in format [x1, y1, x2, y2]
    // Need to convert to coordinate system centered at the line's center
    const centerX = (points[0] + points[2]) / 2;
    const centerY = (points[1] + points[3]) / 2;

    const p1 = transformPoint([points[0] - centerX, points[1] - centerY], matrix);
    const p2 = transformPoint([points[2] - centerX, points[3] - centerY], matrix);

    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y}`;
}

// Transform an existing path using the matrix
export function transformPath(pathData: {
        command: string;
        x?: number;
        y?: number;
        x1?: number;
        y1?: number;
        x2?: number;
        y2?: number;
    }[],
    matrix: TMat2D) {
    if (!pathData) return null;

    // Clone the path data
    const newPath = [];

    // Transform each point in the path
    for (let i = 0; i < pathData.length; i++) {
        const item = Object.assign({}, pathData[i]);

        if (item.command === 'M' || item.command === 'L' || item.command === 'Z') {
            if (item.x !== undefined && item.y !== undefined) {
                const point = transformPoint([item.x, item.y], matrix);
                item.x = point.x;
                item.y = point.y;
            }
        } else if (item.command === 'Q') {
            if (item.x !== undefined && item.y !== undefined) {
                const point = transformPoint([item.x, item.y], matrix);
                item.x = point.x;
                item.y = point.y;
            }
            if (item.x1 !== undefined && item.y1 !== undefined) {
                const point = transformPoint([item.x1, item.y1], matrix);
                item.x1 = point.x;
                item.y1 = point.y;
            }
        } else if (item.command === 'C') {
            if (item.x !== undefined && item.y !== undefined) {
                const point = transformPoint([item.x, item.y], matrix);
                item.x = point.x;
                item.y = point.y;
            }
            if (item.x1 !== undefined && item.y1 !== undefined) {
                const point = transformPoint([item.x1, item.y1], matrix);
                item.x1 = point.x;
                item.y1 = point.y;
            }
            if (item.x2 !== undefined && item.y2 !== undefined) {
                const point = transformPoint([item.x2, item.y2], matrix);
                item.x2 = point.x;
                item.y2 = point.y;
            }
        }

        newPath.push(item);
    }

    return newPath;
}