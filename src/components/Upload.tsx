import { Icon, IconVariant } from "./Icon.tsx";
import Styles from "./Upload.module.css";
import { FC, useContext, DragEvent } from "react";
import { PainterContext } from "../providers/PainterProvider.tsx";
import { useNavigate } from "react-router-dom";
import { extractPathData } from "../utils.ts";

export const Upload: FC = () => {
    const { setCurrentSVG, setUnprocessedSVG, setUnprocessedSVGstr } = useContext(PainterContext);
    const navigate = useNavigate();

    const handleFileUpload = (file: File) => {
        if (file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = handleFileLoad; // Set the onload handler to process the file
            reader.onerror = () => console.error('Error reading the SVG file');
            reader.readAsText(file); // Read the file as text
            navigate("/Painter"); // Navigate to the Painter page
        }
    };

    const handleFileLoad = (e: ProgressEvent<FileReader>) => {
        try {
            const svgContent = e.target?.result as string; // Get the SVG content as a string
            const svgElement = new DOMParser()
                .parseFromString(svgContent, "image/svg+xml")
                .querySelector("svg");

            if (svgElement) {
                // Save the unprocessed SVG content
                setUnprocessedSVG(svgElement); // Store the SVG content in unprocessedSVG
                setUnprocessedSVGstr(svgContent); // Store the SVG content as a string
                console.log("SVG file uploaded:", svgElement);

                // Use the modified svgElement as the flattened SVG
                const pathDataList = extractPathData(svgElement);
                setCurrentSVG(pathDataList); // Set the current SVG path data
            } else {
                console.error("No SVG element found in the uploaded file");
            }
        } catch (error) {
            console.error("Error processing SVG:", error);
        }
    };

    const triggerFileInput = () => {
        const inputElement = document.querySelector(`.${Styles["upload__fileContainer__input"]}`) as HTMLInputElement | null;
        inputElement?.click();
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <div
            className={Styles["upload__container"]}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <p className={Styles["upload__title"]}>Click or drag here to upload SVG file</p>
            <Icon variant={IconVariant.UPLOAD} size={15} />
            <input
                className={Styles["upload__fileContainer__input"]}
                type="file"
                accept="image/svg+xml"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFileUpload(file);
                    }
                }}
            />
        </div>
    );
};