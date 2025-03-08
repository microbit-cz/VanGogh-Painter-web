import { shapeToPath, ShapeTypes } from "svg-path-commander";

export const extractPathData = (svgElement: SVGSVGElement): string[] => {
    const pathData: string[] = [];

    // Process "path" elements that are not within a <symbol>
    const paths = svgElement.querySelectorAll("path");
    paths.forEach((path) => {
        if (path.closest("symbol")) {
            return; // Skip if inside a <symbol> element
        }
        const d = path.getAttribute("d");
        if (d) {
            pathData.push(d);
        }
    });

    // Process shapes (rect, circle, ellipse, line, polyline, polygon) that are not within a <symbol>
    const shapes = svgElement.querySelectorAll(
        "rect, circle, ellipse, line, polyline, polygon"
    );
    shapes.forEach((shape) => {
        if (shape.closest("symbol")) {
            return; // Skip if inside a <symbol> element
        }
        const svgShape = shape as unknown as ShapeTypes; // Explicitly cast to ShapeTypes
        const path = shapeToPath(svgShape);
        if (path) {
            const d = path.getAttribute("d");
            if (d) {
                pathData.push(d);
            }
        }
    });

    return pathData;
};
