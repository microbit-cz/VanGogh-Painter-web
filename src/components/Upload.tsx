import { Icon, IconVariant } from "./Icon.tsx";
import Styles from "./Upload.module.css";
import { FC, useContext } from "react";
import { PainterContext } from "../providers/PainterProvider.tsx";
import { useNavigate } from "react-router-dom";
import {shapeToPath, ShapeTypes} from "svg-path-commander";

export const Upload: FC = () => {
    const { setCurrentSVG, currentSVG } = useContext(PainterContext);
    const navigate = useNavigate();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file?.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = handleFileLoad;
            reader.onerror = () => console.error('Error reading the SVG file');
            reader.readAsText(file);
            navigate("/Painter");
        }
    };

    const handleFileLoad = (e: ProgressEvent<FileReader>) => {
        try {
            const svgContent = e.target?.result as string;
            const svgElement = new DOMParser().parseFromString(svgContent, "image/svg+xml").querySelector('svg');

            if (svgElement) {
                const pathDataList = extractPathData(svgElement);
                setCurrentSVG(pathDataList);
                console.log('SVG file uploaded:', pathDataList);
            } else {
                console.error('No SVG element found in the uploaded file');
            }
        } catch (error) {
            console.error('Error processing SVG:', error);
        }
    };

    const extractPathData = (svgElement: SVGSVGElement): string[] => {
        const pathData: string[] = [];

        // Convert all shapes to paths and extract 'd' attributes
        const shapes = svgElement.querySelectorAll('rect, circle, ellipse, line, polyline, polygon');
        shapes.forEach(shape => {
            const svgShape = shape as unknown as ShapeTypes; // Explicitly cast to ShapeTypes
            const path = shapeToPath(svgShape);
            if (path) {
                const d = path.getAttribute('d');
                if (d) {
                    pathData.push(d);
                }
            }
        });

        return pathData;
    };

    const triggerFileInput = () => {
        const inputElement = document.querySelector(`.${Styles["upload__fileContainer__input"]}`) as HTMLInputElement | null;
        inputElement?.click();
    };

    return (
        <div className={Styles["upload__container"]} onClick={triggerFileInput}>
            <p className={Styles["upload__title"]}>Click or drag here to upload SVG file</p>
            <Icon variant={IconVariant.UPLOAD} size={15} />
            <input className={Styles["upload__fileContainer__input"]} type="file" accept="image/svg+xml" onChange={handleFileUpload} />
        </div>
    );
};
