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
    let anglesum = 0
    input.forEach((x) => {
        if (x[0] == 2) {
            anglesum += x[1]
        }
        if (x[0] == 3) {
            anglesum -= x[1]
        }
    })

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

    console.log(lines)
    console.log(angles)

    return [angles, lines];
}

function scaleSVGPath(path: string, targetWidth: number): string {
    // Parse the path into commands and their numeric arguments.
    const commandRegex =
        /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    const commands: { command: string; args: number[] }[] = [];
    for (const match of path.matchAll(commandRegex)) {
        const command = match[1];
        const argsStr = match[2].trim();
        const args = argsStr
            ? argsStr.split(/[\s,]+/).map((numStr) => parseFloat(numStr))
            : [];
        commands.push({command, args});
    }

    // Determine the bounding box (only horizontal bounds are used for
    // scaling, but vertical bounds are used for translation to keep the shape’s
    // relative position).
    let xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity;
    for (const {command, args} of commands) {
        switch (command.toUpperCase()) {
            case "M":
            case "L":
            case "T":
                // These commands use (x, y) pairs.
                for (let i = 0; i < args.length; i += 2) {
                    const x = args[i];
                    const y = args[i + 1];
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
                break;
            case "H":
                // H takes only x values.
                for (const x of args) {
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                }
                break;
            case "V":
                // V takes only y values.
                for (const y of args) {
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
                break;
            case "C":
                // Cubic Bezier: x1,y1, x2,y2, x,y per segment.
                for (let i = 0; i < args.length; i += 6) {
                    const x1 = args[i],
                        y1 = args[i + 1],
                        x2 = args[i + 2],
                        y2 = args[i + 3],
                        x = args[i + 4],
                        y = args[i + 5];
                    xMin = Math.min(xMin, x1, x2, x);
                    xMax = Math.max(xMax, x1, x2, x);
                    yMin = Math.min(yMin, y1, y2, y);
                    yMax = Math.max(yMax, y1, y2, y);
                }
                break;
            case "S":
            case "Q":
                // S and Q: x1,y1, x,y per segment.
                for (let i = 0; i < args.length; i += 4) {
                    const x1 = args[i],
                        y1 = args[i + 1],
                        x = args[i + 2],
                        y = args[i + 3];
                    xMin = Math.min(xMin, x1, x);
                    xMax = Math.max(xMax, x1, x);
                    yMin = Math.min(yMin, y1, y);
                    yMax = Math.max(yMax, y1, y);
                }
                break;
            case "A":
                // Arc: rx,ry,x-axis-rotation,large-arc-flag,sweep-flag,x,y
                for (let i = 0; i < args.length; i += 7) {
                    const x = args[i + 5],
                        y = args[i + 6];
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
                break;
            case "Z":
                break;
        }
    }

    const currentWidth = xMax - xMin;
    if (currentWidth === 0) {
        console.warn("SVG path has zero width.");
        return path;
    }

    const scale = targetWidth / currentWidth;

    // Rebuild the path using the scale factor.
    // We subtract xMin and yMin to translate the shape so that
    // the minimum coordinates are at (0, 0).
    const newCommands = commands.map(({command, args}) => {
        const newArgs: string[] = [];
        switch (command.toUpperCase()) {
            case "M":
            case "L":
            case "T": {
                for (let i = 0; i < args.length; i += 2) {
                    const x = (args[i] - xMin) * scale;
                    const y = (args[i + 1] - yMin) * scale;
                    newArgs.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
                }
                break;
            }
            case "H": {
                for (const xVal of args) {
                    const x = (xVal - xMin) * scale;
                    newArgs.push(x.toFixed(2));
                }
                break;
            }
            case "V": {
                for (const yVal of args) {
                    const y = (yVal - yMin) * scale;
                    newArgs.push(y.toFixed(2));
                }
                break;
            }
            case "C": {
                for (let i = 0; i < args.length; i += 6) {
                    const x1 = (args[i] - xMin) * scale;
                    const y1 = (args[i + 1] - yMin) * scale;
                    const x2 = (args[i + 2] - xMin) * scale;
                    const y2 = (args[i + 3] - yMin) * scale;
                    const x = (args[i + 4] - xMin) * scale;
                    const y = (args[i + 5] - yMin) * scale;
                    newArgs.push(
                        `${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(
                            2
                        )} ${x.toFixed(2)} ${y.toFixed(2)}`
                    );
                }
                break;
            }
            case "S":
            case "Q": {
                for (let i = 0; i < args.length; i += 4) {
                    const x1 = (args[i] - xMin) * scale;
                    const y1 = (args[i + 1] - yMin) * scale;
                    const x = (args[i + 2] - xMin) * scale;
                    const y = (args[i + 3] - yMin) * scale;
                    newArgs.push(
                        `${x1.toFixed(2)} ${y1.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`
                    );
                }
                break;
            }
            case "A": {
                for (let i = 0; i < args.length; i += 7) {
                    // rx and ry are scaled; x and y are translated.
                    const rx = args[i] * scale;
                    const ry = args[i + 1] * scale;
                    const xAxisRotation = args[i + 2];
                    const largeArcFlag = args[i + 3];
                    const sweepFlag = args[i + 4];
                    const x = (args[i + 5] - xMin) * scale;
                    const y = (args[i + 6] - yMin) * scale;
                    newArgs.push(
                        `${rx.toFixed(2)} ${ry.toFixed(2)} ${xAxisRotation.toFixed(
                            2
                        )} ${largeArcFlag} ${sweepFlag} ${x.toFixed(2)} ${y.toFixed(2)}`
                    );
                }
                break;
            }
            case "Z": {
                break;
            }
        }
        return command + (newArgs.length ? " " + newArgs.join(" ") : "");
    });
    return newCommands.join(" ");
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
    const rulerRef = useRef(null as HTMLDivElement | null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [pxPerCm, setPxPerCm] = useState(37.8); // Approximate default value

    // Measure pixels per centimeter by creating a hidden element.
    useEffect(() => {
        const cmDiv = document.createElement("div");
        cmDiv.style.width = "1cm";
        cmDiv.style.position = "absolute";
        cmDiv.style.visibility = "hidden";
        document.body.appendChild(cmDiv);
        const px = cmDiv.getBoundingClientRect().width;
        setPxPerCm(px);
        document.body.removeChild(cmDiv);
    }, []);

    // Update container width on mount and when window is resized
    useEffect(() => {
        const updateWidth = () => {
            if (rulerRef.current) {
                setContainerWidth(rulerRef.current.getBoundingClientRect().width);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Calculate number of full centimeters that fit in the container
    const numberOfCm = Math.floor(containerWidth / pxPerCm);

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
                    console.log(drawn - 1);
                    console.log(drawn);

                    document.querySelector(`div[data-index="${drawn - 1}"]`)?.classList.remove(Styles["dactive"]);
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

    useEffect(() => {
        if (!currentSVG) return;

        // Size of A4 paper, with .5cm margin
        const svg = scaleSVGPath(currentSVG.join(" "), 269.4);

        const cmds = main(svg);
        const generated = [...cmds, [4, 0]]; // Append the final command.

        setOutputCommands(generated);

        const [angles, lines] = calc(generated);

        setAngles(angles);
        setLines(lines);
    }, [currentSVG]);

    const handleScaleChange = (newScale: number) => {
        console.log("new scale", newScale);

        if (!currentSVG) return;

        // Size of A4 paper, with .5cm margin
        const svg = scaleSVGPath(currentSVG.join(" "), 269.4 * newScale);

        const cmds = main(svg);
        const generated = [...cmds, [4, 0]]; // Append the final command.

        setOutputCommands(generated);

        const [angles, lines] = calc(generated);

        setAngles(angles);
        setLines(lines);

        // if (unprocessedSVG) {
        //     const parser = new DOMParser();
        //     const svgDoc = parser.parseFromString(unprocessedSVG.outerHTML, "image/svg+xml");
        //     const svgElement = svgDoc.documentElement;
        //
        //     const viewBox = svgElement.getAttribute("viewBox");
        //     if (viewBox) {
        //         const [x, y, width, height] = viewBox.split(" ").map(Number);
        //         const scaledWidth = width / scale * newScale;
        //         const scaledHeight = height / scale * newScale;
        //         svgElement.setAttribute("viewBox", `${x} ${y} ${scaledWidth} ${scaledHeight}`);
        //     } else {
        //         const width = parseFloat(svgElement.getAttribute("width") || "0");
        //         const height = parseFloat(svgElement.getAttribute("height") || "0");
        //         svgElement.setAttribute("width", (width * newScale).toString());
        //         svgElement.setAttribute("height", (height * newScale).toString());
        //     }
        //
        //     const serializer = new XMLSerializer();
        //     const updatedSVG = serializer.serializeToString(svgElement);
        //     const svg = new DOMParser().parseFromString(updatedSVG, "image/svg+xml").querySelector('svg');
        //
        //     if (svg) {
        //         setUnprocessedSVG(svg);
        //         setUnprocessedSVGstr(updatedSVG);
        //
        //         const pathDataList = extractPathData(svg);
        //         setCurrentSVG(pathDataList);
        //     }
        // }
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
                        <div
                            ref={indicatorRef}
                            className={Styles["indicator"]}
                            style={{display: isIndicatorActive ? "block" : "none"}}
                        ></div>
                        <div className={Styles["painter__display"]}>
                            {/* Dynamic Ruler */}
                            <div className={Styles["ruler"]} ref={rulerRef}>
                                {Array.from({length: numberOfCm + 1}).map((_, i) => (
                                    <div
                                        key={`cm-${i}`}
                                        className={Styles["ruler__mark"]}
                                        style={{
                                            left: `${i * pxPerCm}px`,
                                            position: "absolute",
                                        }}
                                    >
                                        {i} cm
                                    </div>
                                ))}
                            </div>

                            <div
                                className={Styles["canvasinner"]}
                                style={{transform: `scale(${zoom / 10})`}}
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
                                    />
                                ))}
                                {angles.map((angle) => (
                                    <div
                                        key={`angle-${angle.i}`}
                                        className={Styles["angle"]}
                                        style={{
                                            top: `${angle.top}mm`,
                                            left: `${angle.left}mm`,
                                            position: "absolute",
                                        }}
                                    >
                                        {angle.val}&deg;
                                    </div>
                                ))}
                                {lines.map((line) => (
                                    <div
                                        key={`line-${line.i}`}
                                        className={`${Styles["line"]} ${Styles["pendown"]}`}
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
                            type="range"
                            min={0.1}
                            max={30}
                            defaultValue={zoom}
                            ref={zoomRef}
                            onChange={(event) => {
                                setZoom(parseInt(event.target.value));
                            }}
                        />
                    </div>
                    <div className={Styles["painter__buttonContainer"]}>
                        <button className="btn" onClick={handleStartPause}>
                            {!state.isPaused ? "Pause" : "Start"}
                            <Icon variant={IconVariant.PLAY_PAUSE}/>
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