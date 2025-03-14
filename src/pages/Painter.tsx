import {FC, useContext, useEffect, useRef, useState} from "react";
import {Header} from "../components/Header.tsx";
import {ScaleSetting} from "../components/ScaleSetting.tsx";
import {Icon, IconVariant} from "../components/Icon.tsx";
import Styles from "./Painter.module.css";
import {Status} from "../components/Status.tsx";
import {PainterContext} from "../providers/PainterProvider.tsx";
import {useNavigate} from "react-router-dom";
import {microbitStore} from "../stores/main.ts";
import {main} from "../converter";
import SVGPathCommander from "svg-path-commander";

interface Angle {
    val: string
    left: number
    top: number
    i: string
}

interface Line {
    pendown: string
    width: number
    rotate: string
    left: number
    top: number
    i: string
}

function calc(input: number[][]): [Angle[], Line[]] {

    const coords: number[] = [0, 0]
    let angle: number = 0
    let pendown: boolean = false

    const angles: Angle[] = [];
    const lines: Line[] = [];

    for (const x in input) {
        const cmd = input[x]
        switch (cmd[0]) {
            case 5:
                pendown = false
                break
            case 4:
                pendown = true
                break
            case 3:
                angle = (angle + cmd[1]) % 360
                angles.push({
                    val: 'R' + Math.round(cmd[1] * 10) / 10,
                    left: coords[0],
                    top: coords[1],
                    i: x
                })
                break
            case 2:
                angle = (angle - cmd[1]) % 360
                angles.push({
                    val: 'L' + Math.round(cmd[1] * 10) / 10,
                    left: coords[0],
                    top: coords[1],
                    i: x
                })
                break
            case 1: {
                lines.push({
                    pendown: pendown ? 'pendown' : 'penup',
                    rotate: 90 - angle + 'deg',
                    width: cmd[1],
                    left: coords[0],
                    top: coords[1],
                    i: x
                })
                const radAngle = (angle * Math.PI) / 180
                coords[0] += Math.sin(radAngle) * cmd[1]
                coords[1] += Math.cos(radAngle) * cmd[1]

                break
            }
        }
    }

    console.log("lines", lines)
    console.log("angles", angles)

    return [angles, lines];
}

function scaleSVGPath(path: string, width, targetWidth: number): string {
    console.log("path before", path);
    const scale = targetWidth / width;
    return new SVGPathCommander(path).transform({
        scale: [scale, scale],
    }).toString();
}


export const Painter: FC = () => {
    const {
        state,
        dispatch,
        currentSVG,
    } = useContext(PainterContext);
    const navigate = useNavigate();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [isIndicatorActive, setIsIndicatorActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lines, setLines] = useState([] as Line[]);
    const [angles, setAngles] = useState([] as Angle[]);
    const zoomRef = useRef(null as HTMLInputElement | null);
    const [zoom, setZoom] = useState(1);
    const [outputCommands, setOutputCommands] = useState<number[][]>([]);
    const displayRef = useRef<HTMLDivElement>(null);
    const [rulerWidth, setRulerWidth] = useState(300);
    const [rulerHeight, setRulerHeight] = useState(300);
    const {width} = useContext(PainterContext);

    useEffect(() => {
        const measure = () => {
            if (displayRef.current) {
                const rect = displayRef.current.getBoundingClientRect();
                const pxToMm = 25.4 / 96;
                // Divide rect dimensions by zoom to use the unscaled dimensions
                const effectiveWidthMm = Math.ceil((rect.width / zoom) * pxToMm);
                const effectiveHeightMm = Math.ceil((rect.height / zoom) * pxToMm);
                setRulerWidth(effectiveWidthMm);
                setRulerHeight(effectiveHeightMm);
            }
        };

        measure();
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("resize", measure);
        };
    }, [currentSVG, zoom]);

    const handleStartPause = () => {
        if (!currentSVG) return;
        sendArray();
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
                chunks.push(currentChunk + "\n");
                currentChunk = char;
            } else {
                currentChunk += char;
            }
        }

        // Add any remaining text as a chunk.
        if (currentChunk) {
            chunks.push(currentChunk + "\n");
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
            // Convert the output commands into a string form
            const matrixRows: string[] = [];
            outputCommands.forEach(cmd => {
                matrixRows.push(`[${cmd.join(",")}]`);
            });
            const matrixString = matrixRows.join(",");
            console.log("Sending matrix:", matrixString);

            // Split the matrix string into chunks if needed.
            const textChunks = splitTextByBytes(matrixString, 18);
            await services.uartService.sendText("meow\n");

            services.uartService.addEventListener("receiveText", (e: CustomEvent) => {
                const {detail} = e;
                if (detail.startsWith("%dr")) {
                    const drawn = detail.slice(3);
                    const x = (parseInt(drawn) / (outputCommands.length)) * 100;
                    console.log(`Drawing ${Math.round(x)}`);

                    document.querySelector(`div[data-index="${drawn - 1}"]`)?.classList.remove(Styles["dactive"]);
                    document.querySelector(`div[data-index="${drawn - 1}"]`)?.classList.add(Styles["dcomplete"]);
                    document.querySelector(`div[data-index="${drawn}"]`)?.classList.add(Styles["dactive"]);

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

            // Send all the chunks of text
            for (const chunk of textChunks) {
                console.log("Sending chunk:", chunk);
                await services.uartService.sendText(chunk);
            }

            // Signal the end of sending
            await services.uartService.sendText("#\n");
            console.log("Sent array:", outputCommands);
        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    const handleEdit = () => {
        if (!state.isPaused) {
            dispatch({type: 'PAUSE'});
        }
        navigate("/Editor");
    }

    const handleCancel = () => {
        dispatch({type: 'STOP'});
        setIsIndicatorActive(false);
        navigate("/Upload");
    };

    useEffect(() => {
        if (!currentSVG) return;

        // Size of A4 paper, with .5cm margin
        const svg = scaleSVGPath(currentSVG.join(" "), width, 269.4);
        console.log("scaled", svg);

        const cmds = main(svg);
        const generated = [...cmds, [4, 0]]; // Append the final command.

        setOutputCommands(generated);

        const [angles, lines] = calc(generated);

        setAngles(angles);
        setLines(lines);
    }, [currentSVG]);

    const handleScaleChange = (newScale: number) => {
        if (!currentSVG) return;

        // Size of A4 paper, with .5cm margin
        const svg = scaleSVGPath(currentSVG.join(" "), width, 269.4 * newScale);

        const cmds = main(svg);
        const generated = [...cmds, [4, 0]]; // Append the final command.

        setOutputCommands(generated);

        const [angles, lines] = calc(generated);

        setAngles(angles);
        setLines(lines);
    };

    return (
        <>
            <Header/>
            <main className={Styles["painter__container"]}>
                <div className={`${Styles["painter__section"]} ${Styles["left"]}`}>
                    <div className={Styles["painter__ProgressBarContainer"]}>
                        <progress
                            className={Styles["painter__bar"]}
                            value={progress}
                            max={100}
                        />
                    </div>
                    <div className={Styles["painter__displayContainer"]}>
                        <div className={Styles["painter__display"]} ref={displayRef}>
                            <div
                                ref={indicatorRef}
                                className={Styles["indicator"]}
                                style={{display: isIndicatorActive ? "block" : "none"}}
                            ></div>
                            {/* Horizontal ruler */}
                            <div
                                className={Styles["ruler-horizontal"]}
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: "top left"
                                }}
                            >
                                {Array.from({length: rulerWidth + 1}, (_, i) => (
                                    <div
                                        key={`ruler-h-${i}`}
                                        className={Styles["ruler-mark-h"]}
                                        style={{left: `${i}mm`}}
                                    >
                                        {i % 10 === 0 && (
                                            <span className={Styles["ruler-label-h"]}>{i}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Vertical ruler */}
                            <div
                                className={Styles["ruler-vertical"]}
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: "top left"
                                }}
                            >
                                {Array.from({length: rulerHeight + 1}, (_, i) => (
                                    <div
                                        key={`ruler-v-${i}`}
                                        className={Styles["ruler-mark-v"]}
                                        style={{top: `${i}mm`}}
                                    >
                                        {i % 10 === 0 && (
                                            <span className={Styles["ruler-label-v"]}>{i}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div
                                className={Styles["canvasinner"]}
                                style={{transform: `scale(${zoom})`}}
                            >
                                {angles.map((angled) => (
                                    <div
                                        key={`angled-${angled.i}`}
                                        className={Styles["angledot"]}
                                        style={{
                                            top: `${angled.top}mm`,
                                            left: `${angled.left}mm`,
                                            position: "absolute",
                                        }}
                                        data-index={angled.i}
                                    >
                                        <div
                                            key={`angle-${angled.i}`}
                                            className={Styles["angle"]}
                                            style={{
                                                top: `5mm`,
                                                left: `5mm`,
                                                position: "absolute",
                                            }}
                                        >
                                            {angled.val}&deg;
                                        </div>
                                    </div>
                                ))}
                                {lines.map((line) => (
                                    <div
                                        key={`line-${line.i}`}
                                        className={`${Styles["line"]} ${Styles[line.pendown]}`}
                                        style={{
                                            transform: `rotate(${line.rotate})`,
                                            width: `${line.width}mm`,
                                            top: `${line.top}mm`,
                                            left: `${line.left}mm`,
                                            position: "absolute",
                                        }}
                                        data-index={line.i}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${Styles["painter__section"]} ${Styles["right"]}`}>
                    <div className={Styles["painter__topContainer"]}>
                        <Status/>
                        <ScaleSetting onScaleChange={handleScaleChange}/>
                        <input
                            className={Styles["painter__zoom"]}
                            type="range"
                            min={0.5}
                            max={10}
                            step={0.1}
                            defaultValue={zoom}
                            ref={zoomRef}
                            onChange={(event) => {
                                setZoom(parseFloat(event.target.value));
                            }}
                        />
                    </div>
                    <div className={Styles["painter__buttonContainer"]}>
                        <button className="btn" onClick={handleStartPause}>
                            Start
                            <Icon variant={IconVariant.PLAY}/>
                        </button>
                        <button className="btn" onClick={handleEdit}>
                            Edit
                            <Icon variant={IconVariant.EDIT}/>
                        </button>
                        <button className="btn" onClick={handleCancel}>
                            Cancel
                            <Icon variant={IconVariant.CROSS}/>
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}