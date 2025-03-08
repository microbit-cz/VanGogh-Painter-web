//SVG -> Turtle Graphics Converter
//
//cs:
// Podporuje následující SVG commandy: (velké písmeno = absolutní souřadnice, malé písmeno = relativní souřadnice)
//
// - M,m - přesuň se na souřadnice                   - zvedne tužku, otočí se a dojede na souřadnice        - parametry: x,y (abs/rel)
// - L,l - udělej čáru na souřadnice                 - položí tužku, otočí se a dojede na souřadnice        - parametry: x,y (abs/rel)
// - Z,z - dojeď zpět na start (0,0)                 - položí tužku, otočí se a dojede na souřadnice 0,0    - bez parametrů (bez rozdílu abs/rel)
// - H,h - udělej horizontální čáru na souřadnici x  - položí tužku, otočí se a dojede na souřadnici x      - parametry: x (abs/rel)
// - V,v - udělej vertikální čáru na souřadnici y    - položí tužku, otočí se a dojede na souřadnici y      - parametry: y (abs/rel)
// - C,c - udělej beziérovu křivku 4. úrovně          - položí tužku, rozdělí křivku a vytvoří čáry          - parametry P0,P1,P2,P3 (x,y) (abs/rel)
// - Q,q - udělej beziérovu křivku 3. úrovně          - položí tužku, rozdělí křivku a vytvoří čáry          - parametry P0,P1,P2 (x,y) (abs/rel)
// - A,a; S,s; T,t;
//en:
// Supports the following SVG commands: (uppercase = absolute coordinates, lowercase = relative coordinates)
//
// - M,m - move to the coordinates               - pick up the pen, turn and move to the coordinates        - parameters: x,y (abs/rel)
// - L,l - line to the coordinates               - place down the pen, turn and move to the coordinates     - parameters: x,y (abs/rel)
// - Z,z - line back to start (0,0)              - place down the pen, turn and move to the coordinates 0,0 - no parameters (no diff abs/rel)
// - H,h - horizontal line to x                  - place down the pen, turn and move to the coordinate x    - parameters: x (abs/rel)
// - V,v - vertical line to y y                  - place down the pen, turn and move to the coordinate y    - parameters: y (abs/rel)
// - C,c - cubic bezier curve (base 4)           - place down the pen, split the curve and create lines     - parameters P0,P1,P2,P3 (x,y) (abs/rel)
// - Q,q - quadratic bezier curve (base 3)           - place down the pen, split the curve and create lines     - parameters P0,P1,P2 (x,y) (abs/rel)

/**
 * Calculates the length of hypotenuse and one angle of a triangle.
 * @param a The length of the triangle's first side.
 * @param b The length of the triangle's second side.
 * @returns An object containing the length of the hypotenuse and the angle in degrees.
 */
function calcRightTriangle(a, b) {
    const c = Math.sqrt(a * a + b * b);
    // Fix: Negate b to account for Y-axis flip
    // Use atan2 for more reliable angle calculation in all quadrants
    let deg = (Math.atan2(a, b) * 180 / Math.PI);
    // Normalize to 0-360 range
    if (deg < 0) deg += 360;
    return {c, deg}
}

/**
 * Checks if letter is a valid SVG command key
 * @param letter currently scanned letter - SVG command key candidate
 * @param valid the array of valid SVG command keys
 * @returns Boolean - true if it is a SVG command key
 */
function isValid(letter, valid) {
    // If the letter is a number, space or comma, return false (letter is not valid start of SVG command)
    if (/^\d$/.test(letter) || letter == " " || letter == ",")
        return false;
    // If the letter is a SVG command key, return true
    return (letter in valid) ? true : false;
}
/**
 * Writes a rotate (L,R) turtle command to the specified output, based on the value of the input
 * @param deltaAngle Angle in degrees
 * @param output Output array to write to
 */
function deltaWrite(deltaAngle, output) {
    if (deltaAngle < 0) {
        output.push([2, -deltaAngle]);
    }
    else if (deltaAngle <= 180) {
        output.push([3, deltaAngle]);
    }
    else if (deltaAngle > 180) {
        output.push([2, 360 - deltaAngle]);
    }
}
/**
 * Makes a line or moves the pen to the next position, writes the command to the output
 * @param pen Current pen - Stores information about current angle and position
 * @param coords Final position of the pen.
 * @param draw Make a line (true) or just move (false)
 * @param output Output for the command
 */
function draw(pen, coords, draw, output) {
    if (draw && !pen.down) {
        output.push([4, 0]);
        pen.down = true;
    }
    else if (!draw && pen.down) {
        output.push([5, 0]);
        pen.down = false;
    }
    let triangle = calcRightTriangle(coords[0], coords[1]);
    //When c = 0, deg becomes = 0° and changes the bearing
    if (triangle.c == 0)
        return;
    let deltaAngle = triangle.deg - pen.bearing;
    deltaWrite(deltaAngle, output);
    if (triangle.c > 0)
        output.push([1, triangle.c]);
    pen.bearing = triangle.deg;
}
// How many points will generate on each curve. More points = more accurate final path, but more diffucult for turtle and bigger output. Default: 6
let accuracy = 8;
/**
 * Calculates the cubic bezier curve a converts it to a list of connected points
 * @param P0 First control point (the curve starts here)
 * @param P1 Second control point
 * @param P2 Third control point
 * @param P3 Last control point (the curve ends here)
 * @returns List of coordinates
 */
function cubicBezier(P0, P1, P2, P3) {
    let res = [];
    for (let t = (1 / accuracy); t <= 1; t += (1 / accuracy)) {
        let bezout = [];
        for (let i = 0; i < P0.length; i++) {
            bezout[i] = Math.round(((1 - t) * (1 - t) * (1 - t) * P0[i] + 3 * (1 - t) * (1 - t) * t * P1[i] + 3 * (1 - t) * t * t * P2[i] + t * t * t * P3[i]) * 1000) / 1000;
        }
        res.push(bezout);
    }
    return res;
}

/**
 * Calculates the quadratic bezier curve a converts it to a list of connected points
 * @param P0 First control point (the curve starts here)
 * @param P1 Second control point
 * @param P2 Last control point (the curve ends here)
 * @returns List of coordinates
 */
function quadBezier(P0, P1, P2) {
    let res = [];
    for (let t = (1 / accuracy); t <= 1; t += (1 / accuracy)) {
        let bezout = [];
        for (let i = 0; i < P0.length; i++) {
            bezout[i] = Math.round(((P0[i] - 2 * P1[i] + P2[i]) * t * t + (2 * P1[i] - 2 * P0[i]) * t + P0[i]) * 1000) / 1000;
        }
        res.push(bezout);
    }
    return res;
}
/**
 *
 * @param rx
 * @param ry
 * @param xAxisRotation
 * @param largeArcFlag
 * @param sweepFlag
 * @param x
 * @param y
 * @returns
 */
function ellipticalArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y, currentX, currentY) {
    // Convert rotation angle from degrees to radians
    let phi = xAxisRotation * (Math.PI / 180);
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);

    // Calculate the midpoint differences
    let dx2 = (currentX - x) / 2;
    let dy2 = (currentY - y) / 2;

    // Rotate the coordinates to the new coordinate system
    let x1p = cosPhi * dx2 + sinPhi * dy2;
    let y1p = -sinPhi * dx2 + cosPhi * dy2;

    // Ensure radii are positive
    rx = Math.abs(rx);
    ry = Math.abs(ry);

    // Calculate lambda to check if the ellipse needs to be scaled
    let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }

    // Calculate the squares of radii and coordinates in the rotated system
    let rx2 = rx * rx;
    let ry2 = ry * ry;
    let x1p2 = x1p * x1p;
    let y1p2 = y1p * y1p;

    // Calculate the factor to determine the center point of the ellipse
    let factor = Math.sqrt(((rx2 * ry2) - (rx2 * y1p2) - (ry2 * x1p2)) / ((rx2 * y1p2) + (ry2 * x1p2)));

    // Adjust factor based on the flags
    if (largeArcFlag === sweepFlag) {
        factor = -factor;
    }

    // Calculate the center of the ellipse in the new coordinate system
    let cxp = factor * (rx * y1p) / ry;
    let cyp = factor * -(ry * x1p) / rx;

    // Rotate the center back to the original coordinate system
    let cx = cosPhi * cxp - sinPhi * cyp + (currentX + x) / 2;
    let cy = sinPhi * cxp + cosPhi * cyp + (currentY + y) / 2;

    // Calculate the start and end angles for the arc
    let startAngle = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
    let endAngle = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);

    // Adjust end angle based on the sweep flag
    if (sweepFlag === 0 && endAngle > startAngle) {
        endAngle -= 2 * Math.PI;
    } else if (sweepFlag === 1 && endAngle < startAngle) {
        endAngle += 2 * Math.PI;
    }

    // Generate points along the arc
    let res = [];
    let deltaAngle = endAngle - startAngle;
    for (let i = 0; i < accuracy + Math.round(accuracy / 10); i++) {
        let t = i / accuracy;
        let angle = startAngle + t * deltaAngle;

        // Calculate the x and y coordinates of the point on the arc
        let xPoint = cosPhi * rx * Math.cos(angle) - sinPhi * ry * Math.sin(angle) + cx;
        let yPoint = sinPhi * rx * Math.cos(angle) + cosPhi * ry * Math.sin(angle) + cy;

        // Add the point to the result array
        res.push([xPoint, yPoint]);
    }

    return res; // Return the array of points representing the arc
}

function separatePathByM(pathString) {
    // Split on both "M" and "m" since a new subpath begins with them.
    return pathString
        .split(/(?=[Mm])/)
        .map((seg) => seg.trim())
        .filter((seg) => seg.length > 0);
}

function tokenizePath(segment) {
    // Replace commas with spaces to simplify splitting numbers.
    const cleaned = segment.replace(/,/g, " ");
    const regex = /[MmLlHhVvZz]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g;
    const tokens = cleaned.match(regex);
    return tokens ? tokens : [];
}

function computeSegmentCoordinates(segment) {
    const tokens = tokenizePath(segment);
    if (tokens.length === 0) {
        throw new Error("Empty segment");
    }
    let currX = 0,
        currY = 0;
    let start = null;
    let currentCmd = "";
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];
        if (/[MmLlHhVvZz]/.test(token)) {
            currentCmd = token;
            i++;
            if (currentCmd === "Z" || currentCmd === "z") {
                // Closepath: return to starting point.
                if (start) {
                    currX = start.x;
                    currY = start.y;
                }
                continue;
            }
        }
        switch (currentCmd) {
            case "M":
            case "m": {
                if (i + 1 >= tokens.length) {
                    throw new Error("Not enough parameters for M command");
                }
                const x = parseFloat(tokens[i++]);
                const y = parseFloat(tokens[i++]);
                if (!start) {
                    // The first moveto is always treated as absolute.
                    currX = x;
                    currY = y;
                    start = { x: currX, y: currY };
                } else {
                    if (currentCmd === "m") {
                        currX += x;
                        currY += y;
                    } else {
                        currX = x;
                        currY = y;
                    }
                }
                // Implicit lineto if extra coordinates follow.
                currentCmd = currentCmd === "M" ? "L" : "l";
                break;
            }
            case "L":
            case "l": {
                if (i + 1 >= tokens.length) {
                    throw new Error("Not enough parameters for L command");
                }
                const x = parseFloat(tokens[i++]);
                const y = parseFloat(tokens[i++]);
                if (currentCmd === "l") {
                    currX += x;
                    currY += y;
                } else {
                    currX = x;
                    currY = y;
                }
                break;
            }
            case "H":
            case "h": {
                if (i >= tokens.length) {
                    throw new Error("Not enough parameters for H command");
                }
                const x = parseFloat(tokens[i++]);
                if (currentCmd === "h") {
                    currX += x;
                } else {
                    currX = x;
                }
                break;
            }
            case "V":
            case "v": {
                if (i >= tokens.length) {
                    throw new Error("Not enough parameters for V command");
                }
                const y = parseFloat(tokens[i++]);
                if (currentCmd === "v") {
                    currY += y;
                } else {
                    currY = y;
                }
                break;
            }
            default: {
                throw new Error("Unsupported command: " + currentCmd);
            }
        }
    }
    if (!start) {
        throw new Error("No starting point found in segment");
    }
    return { start, end: { x: currX, y: currY } };
}

function parseSegment(segment) {
    const { start, end } = computeSegmentCoordinates(segment);
    return { segment, start, end };
}

function distanceBetween(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function rearrangeSegments(segments) {
    if (segments.length === 0) return [];
    const remaining = segments.slice();
    const arranged = [];

    let current = remaining.shift();
    arranged.push(current);

    while (remaining.length > 0) {
        let closestIndex = 0;
        let minDist = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const d = distanceBetween(current.end, remaining[i].start);
            if (d < minDist) {
                minDist = d;
                closestIndex = i;
            }
        }
        current = remaining.splice(closestIndex, 1)[0];
        arranged.push(current);
    }
    return arranged;
}

function optimizeSvgPath(pathString) {
    // 1. Separate the path into segments based on moveto commands.
    const segmentsStr = separatePathByM(pathString);

    // 2. Parse each segment to compute its actual start and end coordinates.
    const segments = segmentsStr.map(parseSegment);

    // 3. Rearrange the segments using a nearest-neighbor approach.
    const orderedSegments = rearrangeSegments(segments);

    // 4. Rebuild the path string.
    return orderedSegments.map((seg) => seg.segment).join(" ");
}

function normalizeSVGPath(path) {
    // Regular expression to match command letters and numbers.
    const regex = /[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g;
    let tokens = [];
    let match;
    while ((match = regex.exec(path)) !== null) {
        tokens.push(match[0]);
    }
    if (tokens.length === 0) return path;

    // Parse tokens into an array of { command, params } objects.
    const commands = [];
    const isCommand = (t) => /^[a-zA-Z]$/.test(t);
    let i = 0;
    while (i < tokens.length) {
        let token = tokens[i];
        if (isCommand(token)) {
            const command = token;
            i++;
            const params = [];
            // Gather all following numeric tokens until the next command.
            while (i < tokens.length && !isCommand(tokens[i])) {
                params.push(parseFloat(tokens[i]));
                i++;
            }
            commands.push({ command, params });
        } else {
            // In case of malformed string.
            i++;
        }
    }

    // Ensure the first command is an absolute "M".
    if (
        commands.length === 0 ||
        commands[0].command !== "M" ||
        commands[0].params.length < 2
    ) {
        console.warn("Path does not begin with a valid absolute M command.");
        return path;
    }

    // The first M command defines an offset.
    const offsetX = commands[0].params[0];
    const offsetY = commands[0].params[1];

    // Adjust the first command.
    // In SVG, extra coordinate pairs in a moveto are treated as L commands.
    // We subtract the offset from all coordinate pairs.
    for (let j = 0; j < commands[0].params.length; j += 2) {
        commands[0].params[j] -= offsetX;
        commands[0].params[j + 1] -= offsetY;
    }

    // For all other commands, if they use absolute coordinates (uppercase),
    // subtract the offset appropriately.
    for (let k = 1; k < commands.length; k++) {
        const { command, params } = commands[k];
        if (command !== command.toUpperCase()) {
            continue; // Skip relative commands.
        }
        switch (command) {
            case "M":
            case "L":
            case "T":
                for (let j = 0; j < params.length; j += 2) {
                    params[j] -= offsetX;
                    params[j + 1] -= offsetY;
                }
                break;
            case "H":
                for (let j = 0; j < params.length; j++) {
                    params[j] -= offsetX;
                }
                break;
            case "V":
                for (let j = 0; j < params.length; j++) {
                    params[j] -= offsetY;
                }
                break;
            case "C":
                // Groups of 6 numbers: x1,y1, x2,y2, x,y.
                for (let j = 0; j < params.length; j += 6) {
                    params[j] -= offsetX;
                    params[j + 1] -= offsetY;
                    params[j + 2] -= offsetX;
                    params[j + 3] -= offsetY;
                    params[j + 4] -= offsetX;
                    params[j + 5] -= offsetY;
                }
                break;
            case "S":
            case "Q":
                // Groups of 4 numbers: (for Q: x1,y1, x,y; for S: x2,y2, x,y).
                for (let j = 0; j < params.length; j += 4) {
                    params[j] -= offsetX;
                    params[j + 1] -= offsetY;
                    params[j + 2] -= offsetX;
                    params[j + 3] -= offsetY;
                }
                break;
            case "A":
                // Groups of 7: rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y.
                // Only the final x and y get offset.
                for (let j = 0; j < params.length; j += 7) {
                    params[j + 5] -= offsetX;
                    params[j + 6] -= offsetY;
                }
                break;
            // Z (or z) has no parameters.
            default:
                break;
        }
    }

    // Rebuild the path string.
    const newPath = commands
        .map(({ command, params }) => {
            let segment = command;
            if (params.length > 0) {
                segment += " " + params.join(" ");
            }
            return segment;
        })
        .join(" ");
    return newPath.trim();
}

//Calls the algorith. Normally it would be called on user request (input)
/**
 * The main algorithm
 * @param path SVG path input
 * @param isAngle;
 */
export function main(path) {
    // Apply optimization that preserves command sequence
    console.log("Original path:", path);
    const optimizedPath = optimizeSvgPath(path);
    console.log("Optimized path:", optimizedPath);

    // Continue with the existing conversion logic using optimizedPath
    let valid = {
        M: 2,
        m: 2,
        L: 2,
        l: 2,
        H: 1,
        h: 1,
        V: 1,
        v: 1,
        C: 6,
        c: 6,
        S: 4,
        s: 4,
        Q: 4,
        q: 4,
        T: 2,
        t: 2,
        A: 7,
        a: 7,
        Z: 0,
        z: 0,
        G: 1,
        E: 1
    };

    // The final array of parsed Commands
    let commands = [];
    //Stores info about the current command, adds to final array it when new command key is found
    let currentCommand = { name: "", args: [] };
    //Stores info about current command argument, adds to command when next argument is found
    let currentArg = "";
    //Stores info about previous argument sign (+,-)
    let prevSign = true;

    // scale and angle for scaling the image
    let angle = -1;
    let scale = 1;

    let prevControlPoint = null;
    // Breaks the path to signle letters and iterates throught them

    for (let _i = 0, path_1 = optimizedPath; _i < path_1.length; _i++) {
        let letter = path_1[_i];

        switch (true) {
            case isValid(letter, valid): case (letter === " "): case (letter === ","):
                if (currentArg) { //parses current argument
                    currentCommand.args.push(prevSign ? parseFloat(currentArg * scale) : -parseFloat(currentArg * scale));
                }

                switch (true) {
                    case isValid(letter, valid):
                        if (currentCommand.name) {
                            switch (currentCommand.name) { //special commands for scaling and angle
                                case "E":
                                    scale = currentCommand.args[0];
                                    break;
                                case "G":
                                    angle = currentCommand.args[0];
                                    break;
                                default:
                                    commands.push(currentCommand);
                                    break;
                            }
                        }

                        currentCommand = { name: letter, args: [] };
                    case (letter === " "): case (letter === ","): //unwanted characters - we want to ignore them
                        if (currentCommand.args.length >= valid[currentCommand.name]) {
                            commands.push(currentCommand);
                            if (letter === "-") {
                                currentCommand = { name: currentCommand.name, args: [] };
                            }
                        }
                }

                prevSign = true;
                currentArg = "";
                break;
            case (letter === "-"):
                // If we have a current argument, finish it and create a new one
                if (currentArg) {
                    currentCommand.args.push(prevSign ? parseFloat(currentArg * scale) : -parseFloat(currentArg * scale));

                    // Check if we need to push the current command
                    if (currentCommand.args.length >= valid[currentCommand.name]) {
                        commands.push(currentCommand);
                        currentCommand = { name: currentCommand.name, args: [] };
                    }

                    prevSign = false; // Next number will be negative
                    currentArg = "";
                } else {
                    // If we don't have a current argument, just mark the next one as negative
                    prevSign = false;
                }
                break;
            default:
                currentArg += letter;
                break;
        }
    }
    //Saves the last argument and command when all the letters are parsed
    if (currentArg) {
        currentCommand.args.push(prevSign ? parseFloat(currentArg * scale) : -parseFloat(currentArg * scale));
    }

    if (currentCommand.name) { //patch for Z command
        commands.push(currentCommand);
    }

    commands = [...new Set(commands)]
    //Initializes output array
    let output = [];
    //Initializes the pen for storing current info
    let pen = {
        coords: [0, 0],
        bearing: 0,
        down: false
    };

    commands.forEach(function (command) {
        let args = command.args;
        let relArgs;
        let isHorizontal;
        let isUpperCase;
        let relArg;
        let deg;
        let reflection;
        let curve;

        switch (command.name) {
            case "L": case "M": case "l": case "m": //move and line
                relArgs = (command.name === "L" || command.name === "M") ? [args[0] - pen.coords[0], args[1] - pen.coords[1]] : [args[0], args[1]];
                pen.coords = (command.name === "L" || command.name === "M") ? [args[0], args[1]] : [pen.coords[0] + args[0], pen.coords[1] + args[1]];
                command.name === "L" || command.name === "l" ? draw(pen, relArgs, true, output) : draw(pen, relArgs, false, output);
                break;
            case "H": case "h": case "V": case "v": //
                isHorizontal = (command.name == "H" || command.name == "h");
                isUpperCase = (command.name == "H" || command.name == "V");
                relArg = isUpperCase ? args[0] - (isHorizontal ? pen.coords[0] : pen.coords[1]) : args[0];
                isHorizontal ? pen.coords[0] = isUpperCase ? args[0] : args[0] + pen.coords[0] : pen.coords[1] = isUpperCase ? args[0] : args[0] + pen.coords[1];

                if (!pen.down) {
                    output.push([4, 0]);
                    pen.down = true;
                } else if (relArg === 0) {
                    return;
                }

                isHorizontal ? deg = relArg < 0 ? -90 : 90 : deg = relArg < 0 ? 180 : 0;
                deltaWrite(deg - pen.bearing, output);
                output.push([1, Math.abs(relArg)]);
                pen.bearing = deg;
                break;
            case "C": case "c": case "q": case "Q": case "A": case "a": case "S": case "s": case "T": case "t":
                switch (command.name) {
                    case "C":
                        curve = cubicBezier(pen.coords, [args[0], args[1]], [args[2], args[3]], [args[4], args[5]]);
                        break;
                    case "c":
                        curve = cubicBezier(pen.coords, [pen.coords[0] + args[0], pen.coords[1] + args[1]], [pen.coords[0] + args[2], pen.coords[1] + args[3]], [pen.coords[0] + args[4], pen.coords[1] + args[5]]);
                        break;
                    case "Q":
                        curve = quadBezier(pen.coords, [args[0], args[1]], [args[2], args[3]]);
                        break;
                    case "q":
                        curve = quadBezier(pen.coords, [pen.coords[0] + args[0], pen.coords[1] + args[1]], [pen.coords[0] + args[2], pen.coords[1] + args[3]]);
                        break;
                    case "A":
                        curve = ellipticalArc(args[0], args[1], args[2], args[3], args[4], args[5], args[6], pen.coords[0], pen.coords[1]);
                        break;
                    case "a":
                        curve = ellipticalArc(args[0], args[1], args[2], args[3], args[4], args[5], args[6], pen.coords[0] + args[0], pen.coords[1] + args[1]);
                        break;
                    case "S":
                        reflection = prevControlPoint ? [2 * pen.coords[0] - prevControlPoint[0], 2 * pen.coords[1] - prevControlPoint[1]] : [pen.coords[0], pen.coords[1]];
                        curve = cubicBezier(pen.coords, reflection, [args[0], args[1]], [args[2], args[3]]);
                        prevControlPoint = [args[0], args[1]];
                        break;
                    case "s":
                        reflection = prevControlPoint ? [2 * pen.coords[0] - prevControlPoint[0], 2 * pen.coords[1] - prevControlPoint[1]] : [pen.coords[0], pen.coords[1]];
                        curve = cubicBezier(pen.coords, reflection, [pen.coords[0] + args[0], pen.coords[1] + args[1]], [pen.coords[0] + args[2], pen.coords[1] + args[3]]);
                        prevControlPoint = [pen.coords[0] + args[0], pen.coords[1] + args[1]];
                        break;
                    case "T":
                        reflection = prevControlPoint ? [2 * pen.coords[0] - prevControlPoint[0], 2 * pen.coords[1] - prevControlPoint[1]] : pen.coords;
                        curve = quadBezier(pen.coords, reflection, [args[0], args[1]]);
                        prevControlPoint = reflection;
                        break;
                    case "t":
                        reflection = prevControlPoint ? [2 * pen.coords[0] - prevControlPoint[0], 2 * pen.coords[1] - prevControlPoint[1]] : pen.coords;
                        curve = quadBezier(pen.coords, reflection, [pen.coords[0] + args[0], pen.coords[1] + args[1]]);
                        prevControlPoint = reflection;
                        break;
                }

                for (let i = 0; i < curve.length; i++) { //loops through the points and draws them
                    let xy = curve[i];
                    let xyNew = xy.map(function(dim, index) {
                        return dim - pen.coords[index];
                    });
                    pen.coords = xy;
                    draw(pen, xyNew, true, output);
                }
                break;
            case "Z": case "z":
                draw(pen, [0, 0], true, output); //returns to 0, 0
        }
    });

    if (angle !== -1) {
        output.unshift([3, angle])
    }

    return output;
}

const optimized = normalizeSVGPath(optimizeSvgPath("M -498.2474 394.983 L -337.0474 394.983 M -337.0474 394.983 L -337.0474 383.643 M -337.0474 383.643 L -281.4874 383.643 M -281.4874 383.643 L -281.4874 394.983 M -281.4874 394.983 L 40.9026 394.983 M 40.9026 394.983 L 40.9026 383.643 M 40.9026 383.643 L 96.4626 383.643 M 96.4626 383.643 L 96.4626 394.983 M 96.4626 394.983 L 418.8526 394.983 M 418.8526 394.983 L 418.8526 383.643 M 418.8526 383.643 L 474.4126 383.643 M 474.4126 383.643 L 474.4126 394.983 M 474.4126 394.983 L 635.6126 394.983 M 635.6126 394.983 L 635.6126 749.123 M 635.6126 749.123 L 623.7026 749.123 M 623.7026 749.123 L 623.7026 772.934 M 56.7726 534.823 L 80.5826 534.823 M 623.7026 772.934 L 635.6126 772.934 M 635.6126 772.934 L 635.6126 814.509 M 635.6126 814.509 L -498.2474 394.983 M 56.7726 534.823 L 56.7726 558.635 M 56.7726 558.635 L 80.5826 558.635 M 80.5826 534.823 L 80.5826 558.635"));
console.log("\n")
console.log(optimized);
console.log(main(optimized));