import {Circle, FabricObject, Group, Line, Path, Rect, /*TMat2D, */Triangle} from "fabric";

// The modified convertObjects function using calcTransformMatrix which returns a TMat2D.
export function convertObjects(objects: FabricObject[]): string {
    let path = "";

    objects.forEach((object) => {
        console.log(object);
        console.log(object.type);
        if (object.isType("group")) {
            const obj = object as Group;
            // When not using transformSVGPath, make sure to format group objects correctly
            path += convertObjects(obj.getObjects());
        } else if (object.isType("path")) {
            const obj = object as Path;
            // Format the path data properly, not just joining with spaces
            // Each path item needs to be properly formatted
            //const matrix = obj.calcTransformMatrix();
            if (Array.isArray(obj.path)) {
                let pathStr = "";
                obj.path.forEach(item => {
                    if (Array.isArray(item)) {
                        // Command with parameters
                        pathStr += item[0] + " " + item.slice(1).join(" ") + " ";
                    } else {
                        // Single command (like 'Z')
                        pathStr += item + " ";
                    }
                });
                // path += svgpath(pathStr.trim()).matrix(matrix).toString();
                path += pathStr.trim();
            } else {
                // path += svgpath(obj.path).matrix(matrix).toString();
                path += obj.path;
            }
        } else if (object.isType("rect")) {
            const obj = object as Rect;
            const x = obj.left;
            const y = obj.top;
            const width = obj.width;
            const height = obj.height;
            path += `M ${x} ${y} L ${x+width} ${y} L ${x+width} ${y+height} L ${x} ${y+height} Z`;
        } else if (object.isType("circle")) {
            const obj = object as Circle;
            const cx = obj.left + obj.radius;
            const cy = obj.top + obj.radius;
            const r = obj.radius;
            path += `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;
        } else if (object.isType("triangle")) {
            const obj = object as Triangle;
            const x1 = obj.left;
            const y1 = obj.top + obj.height;
            const x2 = obj.left + obj.width;
            const y2 = obj.top + obj.height;
            const x3 = obj.left + obj.width / 2;
            const y3 = obj.top;
            path += `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
        } else if (object.isType("line")) {
            const obj = object as Line;
            const x1 = obj.left + obj.x1;
            const y1 = obj.top + obj.y1;
            const x2 = obj.left + obj.x2;
            const y2 = obj.top + obj.y2;
            path += `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        path += " ";
    });

    return path.trimEnd();
}


/**
 * Applies the full affine transformation to an absolute point.
 */
/*
function transformPointAbs(
    x: number,
    y: number,
    m: TMat2D
): [number, number] {
    const tx = m[0] * x + m[2] * y + m[4];
    const ty = m[1] * x + m[3] * y + m[5];

    return [tx, ty];
}
*/
/*
 * @param path - The input SVG path string.
 * @param matrix - The 2×3 affine transformation matrix.
 * @returns The transformed SVG path string.
 */
/*
function transformSVGPath(path: string, matrix: TMat2D): string {
    if (!path) return "";

    // Normalize the path string: ensure spaces after commands and commas
    path = path
        .replace(/([MLHVCSQTAZmlhvcsqtaz])/g, " $1 ")
        .replace(/,/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    // Split the path into command segments
    const segments = path.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
    let transformedPath = "";

    // Current position
    let currentX = 0;
    let currentY = 0;

    // Start position of subpath (for Z command)
    let subpathStartX = 0;
    let subpathStartY = 0;

    // Previous control points for smooth curves
    let prevControlX: number | null = null;
    let prevControlY: number | null = null;

    for (const segment of segments) {
        if (!segment.trim()) continue;

        const command = segment.trim()[0];
        const paramsStr = segment.trim().substring(1).trim();
        const params = paramsStr.split(/\s+/).filter(p => p !== "");

        switch (command) {
            case "M": // Move to (absolute)
                for (let i = 0; i < params.length; i += 2) {
                    const x = parseFloat(params[i]);
                    const y = parseFloat(params[i + 1]);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    if (i === 0) {
                        transformedPath += `M ${tx} ${ty}`;
                        subpathStartX = tx;
                        subpathStartY = ty;
                    } else {
                        transformedPath += ` L ${tx} ${ty}`;
                    }

                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "m": // Move to (relative)
                for (let i = 0; i < params.length; i += 2) {
                    const x = currentX + parseFloat(params[i]);
                    const y = currentY + parseFloat(params[i + 1]);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    if (i === 0) {
                        transformedPath += ` M ${tx} ${ty}`;
                        subpathStartX = tx;
                        subpathStartY = ty;
                    } else {
                        transformedPath += ` L ${tx} ${ty}`;
                    }

                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "L": // Line to (absolute)
                for (let i = 0; i < params.length; i += 2) {
                    const x = parseFloat(params[i]);
                    const y = parseFloat(params[i + 1]);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "l": // Line to (relative)
                for (let i = 0; i < params.length; i += 2) {
                    const x = currentX + parseFloat(params[i]);
                    const y = currentY + parseFloat(params[i + 1]);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "H": // Horizontal line to (absolute)
                for (let i = 0; i < params.length; i++) {
                    const x = parseFloat(params[i]);
                    const [tx, ty] = transformPointAbs(x, currentY, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "h": // Horizontal line to (relative)
                for (let i = 0; i < params.length; i++) {
                    const x = currentX + parseFloat(params[i]);
                    const [tx, ty] = transformPointAbs(x, currentY, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "V": // Vertical line to (absolute)
                for (let i = 0; i < params.length; i++) {
                    const y = parseFloat(params[i]);
                    const [tx, ty] = transformPointAbs(currentX, y, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "v": // Vertical line to (relative)
                for (let i = 0; i < params.length; i++) {
                    const y = currentY + parseFloat(params[i]);
                    const [tx, ty] = transformPointAbs(currentX, y, matrix);

                    transformedPath += ` L ${tx} ${ty}`;
                    currentX = tx;
                    currentY = ty;
                }
                break;

            case "C": // Cubic Bézier curve (absolute)
                for (let i = 0; i < params.length; i += 6) {
                    const x1 = parseFloat(params[i]);
                    const y1 = parseFloat(params[i + 1]);
                    const x2 = parseFloat(params[i + 2]);
                    const y2 = parseFloat(params[i + 3]);
                    const x = parseFloat(params[i + 4]);
                    const y = parseFloat(params[i + 5]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx2, ty2] = transformPointAbs(x2, y2, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` C ${tx1} ${ty1}, ${tx2} ${ty2}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx2;
                    prevControlY = ty2;
                }
                break;

            case "c": // Cubic Bézier curve (relative)
                for (let i = 0; i < params.length; i += 6) {
                    const x1 = currentX + parseFloat(params[i]);
                    const y1 = currentY + parseFloat(params[i + 1]);
                    const x2 = currentX + parseFloat(params[i + 2]);
                    const y2 = currentY + parseFloat(params[i + 3]);
                    const x = currentX + parseFloat(params[i + 4]);
                    const y = currentY + parseFloat(params[i + 5]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx2, ty2] = transformPointAbs(x2, y2, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` C ${tx1} ${ty1}, ${tx2} ${ty2}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx2;
                    prevControlY = ty2;
                }
                break;

            case "S": // Smooth cubic Bézier curve (absolute)
                for (let i = 0; i < params.length; i += 4) {
                    // Reflect previous control point
                    let x1, y1;
                    if (prevControlX !== null && prevControlY !== null) {
                        x1 = 2 * currentX - prevControlX;
                        y1 = 2 * currentY - prevControlY;
                    } else {
                        x1 = currentX;
                        y1 = currentY;
                    }

                    const x2 = parseFloat(params[i]);
                    const y2 = parseFloat(params[i + 1]);
                    const x = parseFloat(params[i + 2]);
                    const y = parseFloat(params[i + 3]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx2, ty2] = transformPointAbs(x2, y2, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` C ${tx1} ${ty1}, ${tx2} ${ty2}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx2;
                    prevControlY = ty2;
                }
                break;

            case "s": // Smooth cubic Bézier curve (relative)
                for (let i = 0; i < params.length; i += 4) {
                    // Reflect previous control point
                    let x1, y1;
                    if (prevControlX !== null && prevControlY !== null) {
                        x1 = 2 * currentX - prevControlX;
                        y1 = 2 * currentY - prevControlY;
                    } else {
                        x1 = currentX;
                        y1 = currentY;
                    }

                    const x2 = currentX + parseFloat(params[i]);
                    const y2 = currentY + parseFloat(params[i + 1]);
                    const x = currentX + parseFloat(params[i + 2]);
                    const y = currentY + parseFloat(params[i + 3]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx2, ty2] = transformPointAbs(x2, y2, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` C ${tx1} ${ty1}, ${tx2} ${ty2}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx2;
                    prevControlY = ty2;
                }
                break;

            case "Q": // Quadratic Bézier curve (absolute)
                for (let i = 0; i < params.length; i += 4) {
                    const x1 = parseFloat(params[i]);
                    const y1 = parseFloat(params[i + 1]);
                    const x = parseFloat(params[i + 2]);
                    const y = parseFloat(params[i + 3]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` Q ${tx1} ${ty1}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx1;
                    prevControlY = ty1;
                }
                break;

            case "q": // Quadratic Bézier curve (relative)
                for (let i = 0; i < params.length; i += 4) {
                    const x1 = currentX + parseFloat(params[i]);
                    const y1 = currentY + parseFloat(params[i + 1]);
                    const x = currentX + parseFloat(params[i + 2]);
                    const y = currentY + parseFloat(params[i + 3]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` Q ${tx1} ${ty1}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx1;
                    prevControlY = ty1;
                }
                break;

            case "T": // Smooth quadratic Bézier curve (absolute)
                for (let i = 0; i < params.length; i += 2) {
                    // Reflect previous control point
                    let x1, y1;
                    if (prevControlX !== null && prevControlY !== null) {
                        x1 = 2 * currentX - prevControlX;
                        y1 = 2 * currentY - prevControlY;
                    } else {
                        x1 = currentX;
                        y1 = currentY;
                    }

                    const x = parseFloat(params[i]);
                    const y = parseFloat(params[i + 1]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` Q ${tx1} ${ty1}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx1;
                    prevControlY = ty1;
                }
                break;

            case "t": // Smooth quadratic Bézier curve (relative)
                for (let i = 0; i < params.length; i += 2) {
                    // Reflect previous control point
                    let x1, y1;
                    if (prevControlX !== null && prevControlY !== null) {
                        x1 = 2 * currentX - prevControlX;
                        y1 = 2 * currentY - prevControlY;
                    } else {
                        x1 = currentX;
                        y1 = currentY;
                    }

                    const x = currentX + parseFloat(params[i]);
                    const y = currentY + parseFloat(params[i + 1]);

                    const [tx1, ty1] = transformPointAbs(x1, y1, matrix);
                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` Q ${tx1} ${ty1}, ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = tx1;
                    prevControlY = ty1;
                }
                break;

            case "A": // Elliptical arc (absolute)
                for (let i = 0; i < params.length; i += 7) {
                    // For arc commands, we only transform the end point correctly
                    // A proper transformation would require decomposing the matrix
                    // and recalculating the arc parameters
                    const rx = parseFloat(params[i]);
                    const ry = parseFloat(params[i + 1]);
                    const xAxisRotation = parseFloat(params[i + 2]);
                    const largeArcFlag = parseInt(params[i + 3]);
                    const sweepFlag = parseInt(params[i + 4]);
                    const x = parseFloat(params[i + 5]);
                    const y = parseFloat(params[i + 6]);

                    // Calculate scale factors from the matrix
                    const scaleX = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]);
                    const scaleY = Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]);

                    // Scale the radii
                    const transformedRx = rx * scaleX;
                    const transformedRy = ry * scaleY;

                    // Calculate the new rotation angle
                    // This is a simplification and might not be accurate for all transformations
                    const transformedXAxisRotation =
                        xAxisRotation + Math.atan2(matrix[1], matrix[0]) * (180 / Math.PI);

                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` A ${transformedRx} ${transformedRy} ${transformedXAxisRotation} ${largeArcFlag} ${sweepFlag} ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = null;
                    prevControlY = null;
                }
                break;

            case "a": // Elliptical arc (relative)
                for (let i = 0; i < params.length; i += 7) {
                    const rx = parseFloat(params[i]);
                    const ry = parseFloat(params[i + 1]);
                    const xAxisRotation = parseFloat(params[i + 2]);
                    const largeArcFlag = parseInt(params[i + 3]);
                    const sweepFlag = parseInt(params[i + 4]);
                    const x = currentX + parseFloat(params[i + 5]);
                    const y = currentY + parseFloat(params[i + 6]);

                    // Calculate scale factors from the matrix
                    const scaleX = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]);
                    const scaleY = Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]);

                    // Scale the radii
                    const transformedRx = rx * scaleX;
                    const transformedRy = ry * scaleY;

                    // Calculate the new rotation angle
                    const transformedXAxisRotation =
                        xAxisRotation + Math.atan2(matrix[1], matrix[0]) * (180 / Math.PI);

                    const [tx, ty] = transformPointAbs(x, y, matrix);

                    transformedPath += ` A ${transformedRx} ${transformedRy} ${transformedXAxisRotation} ${largeArcFlag} ${sweepFlag} ${tx} ${ty}`;

                    currentX = tx;
                    currentY = ty;
                    prevControlX = null;
                    prevControlY = null;
                }
                break;

            case "Z":
            case "z":
                transformedPath += " Z";
                currentX = subpathStartX;
                currentY = subpathStartY;
                prevControlX = null;
                prevControlY = null;
                break;
        }
    }

    return transformedPath.trim();
}
*/