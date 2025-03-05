import {FC, useContext, useRef, useState} from "react";
import {Header} from "../components/Header.tsx";
import {ScaleSetting} from "../components/ScaleSetting.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Painter.module.css";
import {Status} from "../components/Status.tsx";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {useNavigate} from "react-router-dom";
import {main} from "../converter.ts";
import {microbitStore} from "../stores/main.ts";
import {extractPathData} from "../utils.ts";

export const Painter: FC = () => {
    const {state, dispatch, unprocessedSVG, currentSVG, setUnprocessedSVG, setUnprocessedSVGstr, setCurrentSVG} = useContext(PainterContext);
    const navigate = useNavigate();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [isIndicatorActive, setIsIndicatorActive] = useState(false);
    //const [progress, setProgress] = useState(0);
    const [scale, setScale] = useState(1);

    const handleStartPause = () => {
        if (!currentSVG) return;
        if (!state.isPaused) {
            dispatch({type: 'PAUSE'});
        } else {
            sendArray();
            dispatch({type: 'RESUME'});
        }
    };

    function splitTextByBytes(text: string, maxBytes: number = 500): string[] {
        const encoder = new TextEncoder();
        const chunks: string[] = [];
        let currentChunk = "";

        for (const char of text) {
            // Calculate the bytes for the current chunk and the next character.
            const currentBytes = encoder.encode(currentChunk).length;
            const charBytes = encoder.encode(char).length;

            // If adding this character exceeds the maxBytes, create a new chunk.
            if (currentBytes + charBytes > maxBytes) {
                chunks.push(currentChunk+"\n");
                currentChunk = char;
            } else {
                currentChunk += char;
            }
        }

        // Add any remaining text as a chunk.
        if (currentChunk) {
            chunks.push(currentChunk+"\n");
        }

        return chunks;
    }

    const sendArray = async () => {
        const services = microbitStore.get("services");
        if (!currentSVG || !services || !services.uartService) {
            console.error("Micro:bit not connected.");
            return;
        }
        try {
            const output = main(currentSVG.join(""));
            // Generate a flat array of 6 numbers
            const matrixRows: string[] = [];

            // Group the numbers into pairs: [a,b]
            for (let i = 0; i < output.length; i++) {
                matrixRows.push(`[${output[i].join(",")}]`);
            }
            // Join all rows with a comma to produce:
            // [num,num],[num,num],...
            const matrixString = matrixRows.join(",");
            console.log("Sending matrix:", matrixString);

            // Split the matrix string into chunks (if needed)
            const textChunks = splitTextByBytes(matrixString, 18);
            await services.uartService.sendText("meow\n");

            for (const chunk of textChunks) {
                console.log("Sending chunk:", chunk);
                await services.uartService.sendText(chunk);
            }

            await services.uartService.sendText("#\n");
            console.log("Sent array:", output);
        } catch (error) {
            console.error("Error sending data:", error);
        }
    };
/*
    const sendout = async (input: OutputCommand[]) => {
        const service = microbitStore.get("services");

        let textOut = '['
        input.forEach((x) => (textOut += `[${x[0]}, ${x[1]}],`))
        textOut += '[4,0]]'
        console.log("text out", textOut);
        if (service && service.uartService) {
            service.uartService.addEventListener("receiveText", (e: CustomEvent) => {
                const {detail} = e;
                if (detail.startsWith("%dr")) {
                    const x = (parseInt(detail.slice(3)) / (input.length + 2)) * 100;
                    console.log(`Drawing ${Math.round(x)}`);
                    console.log(detail.slice(3) - 1);
                    console.log(detail.slice(3));
                    setProgress(x);
                }

                switch (detail) {
                    case "%rsta":
                        console.log("Uploading");
                        break;
                    case "%rend":
                        console.log("Uploaded");
                        break;
                    case "%dsta":
                        console.log("Drawing");
                        setProgress(0);
                        break;
                    case "%dend":
                        console.log("Finished");
                        setProgress(100);
                        break;
                }
            });
            const sendText = '%' + textOut + '%';
            console.log("send text", sendText);
            // const itCnt = Math.ceil(sendText.length / 14)
            for (let i = 0; i < sendText.length; i += 14) {
                console.log("sending to microbit", sendText.slice(i, i + 14) + '$')
                await service.uartService.sendText(sendText.slice(i, i + 14) + '$')
            }
        } else {
            console.log(service);
            console.error("Failed to find service");
        }
    }*/

    const handleEdit = () => {
        if (!state.isPaused) {
            dispatch({type: 'PAUSE'});
        }
        navigate("/Editor");
    }

    const handleCancel = () => {
        dispatch({type: 'STOP'});
        setIsIndicatorActive(false);
    };

    const handleScaleChange = (newScale: number) => {
        setScale(newScale);

        if (unprocessedSVG) {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(unprocessedSVG.outerHTML, "image/svg+xml");
            const svgElement = svgDoc.documentElement;

            const viewBox = svgElement.getAttribute("viewBox");
            if (viewBox) {
                const [x, y, width, height] = viewBox.split(" ").map(Number);
                const scaledWidth = width / scale * newScale;
                const scaledHeight = height / scale * newScale;
                svgElement.setAttribute("viewBox", `${x} ${y} ${scaledWidth} ${scaledHeight}`);
            } else {
                const width = parseFloat(svgElement.getAttribute("width") || "0");
                const height = parseFloat(svgElement.getAttribute("height") || "0");
                svgElement.setAttribute("width", (width * newScale).toString());
                svgElement.setAttribute("height", (height * newScale).toString());
            }

            const serializer = new XMLSerializer();
            const updatedSVG = serializer.serializeToString(svgElement);
            const svg = new DOMParser().parseFromString(updatedSVG, "image/svg+xml").querySelector('svg');

            if (svg) {
                setUnprocessedSVG(svg);
                setUnprocessedSVGstr(updatedSVG);

                const pathDataList = extractPathData(svg);
                setCurrentSVG(pathDataList);
            }
        }
    };

    return (
        <>
            <Header/>
            <main className={Styles["painter__container"]}>
                <div className={`${Styles["painter__section"]} ${Styles["left"]}`}>
                    <div className={Styles["painter__ProgressBarContainer"]}>
                        <progress className={Styles["painter__bar"]} max={100}/>
                    </div>
                    <div className={Styles["painter__displayContainer"]}>
                        <div ref={indicatorRef} className={Styles["indicator"]}
                             style={{display: isIndicatorActive ? 'block' : 'none'}}></div>
                        <div className={Styles["painter__display"]}>
                            <div dangerouslySetInnerHTML={{__html: unprocessedSVG?.outerHTML ?? ""}}></div>
                        </div>
                    </div>
                </div>
                <div className={`${Styles["painter__section"]} ${Styles["right"]}`}>
                    <div className={Styles["painter__topContainer"]}>
                        <Status/>
                        <ScaleSetting onScaleChange={handleScaleChange}/>
                    </div>
                    <div className={Styles["painter__buttonContainer"]}>
                        <button className={"btn"} onClick={handleStartPause}>{!state.isPaused ? "Pause" : "Start"}<Icon
                            variant={IconVariant.PLAY_PAUSE}/></button>
                        <button className={"btn"} onClick={handleEdit}>Edit<Icon variant={IconVariant.EDIT}/></button>
                        <button className={"btn"} onClick={handleCancel}>Cancel<Icon variant={IconVariant.CROSS}/>
                        </button>
                    </div>
                </div>
            </main>
        </>
    )
}