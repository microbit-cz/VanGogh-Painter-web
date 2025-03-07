// import {shapeToPath, ShapeTypes} from "svg-path-commander";

export const extractPathData = (svgElement: SVGSVGElement): string[] => {
    const pathData: string[] = [];

    const paths = svgElement.querySelectorAll("path");
    paths.forEach(path => {
        const d = path.getAttribute("d");
        if (d) {
            pathData.push(d);
        }
    });

    // Skip shapes, only use paths
    // Convert all shapes to paths and extract 'd' attributes
    // const shapes = svgElement.querySelectorAll('rect, circle, ellipse, line, polyline, polygon');
    // shapes.forEach(shape => {
    //     const svgShape = shape as unknown as ShapeTypes; // Explicitly cast to ShapeTypes
    //     const path = shapeToPath(svgShape);
    //     if (path) {
    //         const d = path.getAttribute('d');
    //         if (d) {
    //             pathData.push(d);
    //         }
    //     }
    // });

    return pathData;
};
