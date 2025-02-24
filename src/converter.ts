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

interface TrianglePath {
    c: number,
    deg: number
}
interface Pen {
    coords: number[],
    bearing: number,
    down: boolean
}
interface Command {
    name: string,
    args: number[]
}

export type OutputCommand = [number, number];

/**
 * Calculates the length of hypotenuse and one angle of a triangle.
 * @param a The length of the triangle's first side.
 * @param b The length of the triangle's second side.
 * @returns An object containing the length of the hypotenuse and the angle in degrees.
 */
function calcRightTriangle(a: number, b: number) : TrianglePath {
    const c : number = Math.sqrt(a * a + b * b);
    let deg : number = (Math.atan(a / b) * 180 / Math.PI)
    if (b < 0) {
        deg += 180
    }
    return { c, deg }
}
/**
 * Checks if letter is a valid SVG command key
 * @param letter currently scanned letter - SVG command key candidate
 * @param valid the array of valid SVG command keys
 * @returns Boolean - true if it is a SVG command key
 */

function isValid(letter : string, valid: Record<string, number>) : boolean {
    // If the letter is a number, space or comma, return false (letter is not valid start of SVG command)
    if (/^\d$/.test(letter) || letter == " " || letter == ",") return false
    // If the letter is a SVG command key, return true
    return (letter in valid)
}

/**
 * Writes a rotate (L,R) turtle command to the specified output, based on the value of the input
 * @param deltaAngle Angle in degrees
 * @param output Output array to write to
 */

function deltaWrite (deltaAngle: number, output: OutputCommand[]) {
    if (deltaAngle < 0) {
        output.push([2, -deltaAngle])
    } else if (deltaAngle <= 180) {
        output.push([3, deltaAngle])
    } else if (deltaAngle > 180) {
        output.push([2, 360 - deltaAngle])
    }
}

/**
 * Makes a line or moves the pen to the next position, writes the command to the output
 * @param pen Current pen - Stores information about current angle and position
 * @param coords Final position of the pen.
 * @param draw Make a line (true) or just move (false)
 * @param output Output for the command
 */
function draw(pen : Pen, coords : number[], draw: boolean, output: OutputCommand[]) : void {
    if (draw && !pen.down) {
        output.push([4,0]);
        pen.down = true;
    } else if (!draw && pen.down) {
        output.push([5,0]);
        pen.down = false;
    }
    const triangle = calcRightTriangle(coords[0], coords[1]);
    //When c = 0, deg becomes = 0° and changes the bearing
    if (triangle.c == 0) return
    const deltaAngle = triangle.deg - pen.bearing
    deltaWrite(deltaAngle, output)
    if (triangle.c > 0) output.push([1 ,triangle.c])
    pen.bearing = triangle.deg
}

// How many points will generate on each curve. More points = more accurate final path, but more diffucult for turtle and bigger output. Default: 6
const accuracy = 6

/**
 * Calculates the cubic bezier curve a converts it to a list of connected points
 * @param P0 First control point (the curve starts here)
 * @param P1 Second control point
 * @param P2 Third control point
 * @param P3 Last control point (the curve ends here)
 * @returns List of coordinates
 */

function cubicBezier(P0: number[], P1: number[], P2: number[], P3: number[]) {
    const res : number[][] = []
    for (let t = (1/accuracy); t <= 1; t+=(1/accuracy)) {
        const bezout : number[] = []
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
function quadBezier(P0: number[], P1: number[], P2: number[]) {
    const res : number[][] = []
    for (let t = (1/accuracy); t <= 1; t+=(1/accuracy)) {
        const bezout : number[] = []
        for (let i = 0; i < P0.length; i++) {
            bezout[i] = Math.round(((P0[i] - 2*P1[i] + P2[i]) * t*t + (2*P1[i] - 2*P0[i]) * t + P0[i])*1000)/1000;
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
function ellipticalArc(rx: number, ry: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, x:number, y:number) {

    const res : number[][] = []
    // Convert degrees to radians for rotation
    const startAngle = (Math.PI / 180) * xAxisRotation;

    // Calculate the start and end angles of the elliptical arc
    const endAngle = startAngle + (largeArcFlag === sweepFlag ? 1 : -1) * Math.PI;

    // Calculate the angle increment for each point
    const angleIncrement = (endAngle - startAngle) / 3;

    // Calculate the points on the elliptical arc
    for (let i = 0; i <= 3; i++) {
        const angle = startAngle + i * angleIncrement;
        const pointX = x + rx * Math.cos(angle);
        const pointY = y + ry * Math.sin(angle);
        res.push([pointX, pointY]);
    }

    return res;
}


//Calls the algorith. Normally it would be called on user request (input)
//main("M140 20C73 20 20 74 20 140c0 135 136 170 228 303 88-132 229-173 229-303 0-66-54-120-120-120-48 0-90 28-109 69-19-41-60-69-108-69z")
main("M100 100H200 V200 H100 V100")

/**
 * The main algorithm
 * @param path SVG path input
 */
export function main(path:string) : OutputCommand[] {

    // SVG path to be converted
    //let path = "M140 20C73 20 20 74 20 140c0 135 136 170 228 303 88-132 229-173 229-303 0-66-54-120-120-120-48 0-90 28-109 69-19-41-60-69-108-69z"
    //path="M1 655.5C4.40454 571.597 13.0018 445.795 27.9985 326.5M248.5 655.5C242.561 564.008 231.98 441.107 217.401 326.5M27.9985 326.5C46.0385 182.996 73.3389 48.9083 112 8.49984C156.522 -38.0341 192.7 132.329 217.401 326.5M27.9985 326.5H217.401M348 655.5V332M348 8.49984V332M348 332H529M529 332V8.49984M529 332V655.5"
    //path="M1 0.5V308.5H366V654H1V454M366 654V962.5"
    //path="M1 0.5V308.5H366V654H1V454"
    //path="M1 655.5C4.40454 571.597 13.0018 445.795 27.9985 326.5M248.5 655.5C242.561 564.008 231.98 441.107 217.401 326.5M27.9985 326.5C46.0385 182.996 73.3389 48.9083 112 8.49984C156.522 -38.0341 192.7 132.329 217.401 326.5M27.9985 326.5H217.401M348 655.5V332M348 8.49984V332M348 332H529M529 332V8.49984M529 332V655.5M983 8.49984C983 8.49984 983 510 983 561.5C983 613 980 655.5 910 655.5C840 655.5 838.485 547.897 859 453.5M740 8.49984C740 8.49984 637 167 629 332C621 497 678 671 740 655.5C802 640 818.5 470 818.5 332C818.5 194 740 8.49984 740 8.49984Z"
    //path="M353.5 0V94M353.5 180.5V150M353.5 150C367 171 400.5 183.5 417 180.5C433.5 177.5 459.766 170.048 457 127C454.234 83.9519 439 69.5 417 66C395 62.5 374.65 76.2057 353.5 94M353.5 150V94M515.5 176.5V66H573M618.5 66C618.5 66 616.5 138 618.5 162.5C620.5 187 673.5 201.5 708.5 151M708.5 151V66M708.5 151C708.5 261 675.5 265 618.5 236M0.5 3.49902V179.999C60.3657 178.847 136.5 179.999 134 88.999C131.5 -2.00096 68.8605 4.25665 0.5 3.49902ZM241 66C205 66 188.5 88.999 188.5 127C188.5 165.001 213 183.5 241 183.5C269 183.5 294.5 168.5 294.5 127C294.5 85.5 277 66 241 66Z"
    //path="M4 8 10 1 13 0 12 3 5 9C6 10 6 11 7 10 7 11 8 12 7 12 7 13 6.3333 12.6667 6 13 5 12 5 11 4 10Q3.5 9.9 3.5 10.5T2 11.8 1 11 2.5 9.5 3 9C2 8 1 8 0 7 .3333 6.6667 0 6 1 6 1 5 2 6 3 6 2 7 3 7 4 8M10 1 10 3 12 3 10.2 2.8 10 1"
    // Valid SVG command keys
    const valid = {
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
        z: 0
    }
    const valida = [
        [ 'M', 2 ], [ 'm', 2 ],
        [ 'L', 2 ], [ 'l', 2 ],
        [ 'H', 1 ], [ 'h', 1 ],
        [ 'V', 1 ], [ 'v', 1 ],
        [ 'C', 6 ], [ 'c', 6 ],
        [ 'S', 4 ], [ 's', 4 ],
        [ 'Q', 4 ], [ 'q', 4 ],
        [ 'T', 2 ], [ 't', 2 ],
        [ 'A', 7 ], [ 'a', 7 ],
        [ 'Z', 0 ], [ 'z', 0 ]
    ]
    // The final array of parsed Commands
    const commands : Command[] = []

    //Stores info about the current command, adds to final array it when new command key is found
    let currentCommand: Command = {name: "", args: []}

    //Stores info about current command argument, adds to command when next argument is found
    let currentArg: string = ""

    //Stores info about previous argument sign (+,-)
    let prevSign = true

    // Breaks the path to signle letters and iterates throught them
    for (const letter of path) {

        // If the letter is a SVG command key, write previous args and the command (if exists) to output array, and reset current command
        if (isValid(letter, valid)) {
            if(currentArg) currentCommand.args.push(prevSign ? parseFloat(currentArg) : -parseFloat(currentArg))
            currentArg = ""
            prevSign = true
            if (currentCommand.name) commands.push(currentCommand)

            // Initiate new command
            currentCommand = {name: letter, args: []}

            // If the letter is a space, write previous argument to the current command instance and reset current argument
        } else if (letter == " ") {
            if (currentArg) currentCommand.args.push(prevSign ? parseFloat(currentArg) : -parseFloat(currentArg))

            // Checks for reperating command arguments - more than default arg length means more commands consecutively
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            if (currentCommand.args.length >= valid[currentCommand.name]) {
                commands.push(currentCommand)
                currentCommand = {name: currentCommand.name, args: []}
            }

            prevSign = true
            currentArg = ""

            // Same as previous but with negative values
        } else if (letter == "-") {
            if (currentArg) currentCommand.args.push(prevSign ? parseFloat(currentArg) : -parseFloat(currentArg))
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            if (currentCommand.args.length >= valid[currentCommand.name]) {
                commands.push(currentCommand)
                currentCommand = {name: currentCommand.name, args: []}
            }
            prevSign = false
            currentArg = ""

            // If it is a number, dot, or anything else, write it to the current argument and to be parsed to number
        } else {
            currentArg += letter
        }
    }

    //Saves the last argument and command when all the letters are parsed
    if (currentArg) currentCommand.args.push(prevSign ? parseFloat(currentArg) : - parseFloat(currentArg))
    if (currentCommand.name) commands.push(currentCommand)

    //Initializes output array

    const output : OutputCommand[] = []

    //Initializes the pen for storing current info
    const pen : Pen = {
        coords: [0, 0],
        bearing: 0,
        down: false
    }

    //Iterates throught every command
    commands.forEach(command => {

        // For shortening the code :D
        const args : number[] = command.args

        //Does the action and calculations for every possible parsed command

        if (command.name == "L") {

            //Calculates the relative coordinates for calculating the tringle (hypot, atan)
            const relArgs = [args[0] - pen.coords[0], args[1] - pen.coords[1]]

            //Set the new pen coordinates
            pen.coords = [args[0], args[1]]

            draw(pen, relArgs, true, output)

        } else if (command.name == "M") {

            const relArgs = [args[0] - pen.coords[0], args[1] - pen.coords[1]]

            pen.coords = [args[0], args[1]]

            draw(pen, relArgs, false, output)

        } else if (command.name == "H" || command.name == "h") {

            //Calculates the relative X coordinate
            const relArg = command.name == "H" ? args[0] - pen.coords[0] : args[0]
            if (relArg == 0) return
            pen.coords[0] = command.name == "h" ? args[0] + pen.coords[0] : args[0]

            if (!pen.down) {
                output.push([4, 0]);
                pen.down = true;
            }

            // Absoulute pen rotation will be horizontal
            const deg = relArg < 0 ? -90 : 90

            // Calculates relative angle
            const deltaAngle = deg - pen.bearing

            // Turns by relative angle
            deltaWrite(deltaAngle, output)

            // Go forwards by relative length
            /*if (relArg > 0)*/ output.push([1, Math.abs(relArg)])

            // Changes the pen rotation
            pen.bearing = deg

        } else if (command.name == "V" || command.name == "v") {

            const relArg = command.name == "V" ? args[0] - pen.coords[1] : args[0]
            if (relArg == 0) return
            pen.coords[1] =  command.name == "v" ? args[0] + pen.coords[1] : args[0]

            if (!pen.down) {
                output.push([4, 0]);
                pen.down = true;
            }
            const deg = relArg < 0 ? 180 : 0

            const deltaAngle = deg - pen.bearing
            deltaWrite(deltaAngle, output)

            /*if (relArg > 0)*/ output.push([1, Math.abs(relArg)])

            pen.bearing = deg

        } else if (command.name == "Z" || command.name == "z") {

            // Get back to 0,0
            const relArgs = [0, 0]

            draw(pen, relArgs, true, output)

        } else if (command.name == "l") {
            // Calculates absolute coordinates
            pen.coords = [pen.coords[0] + args[0], pen.coords[0] + args[1]]

            draw(pen, args, true, output)

        } else if (command.name == "m") {
            pen.coords = [pen.coords[0] + args[0], pen.coords[0] + args[1]]

            /*if (pen.down) {
                output.push([5, 0]);
                pen.down = false;
            }
            const triangle = calcRightTriangle(args[0], args[1]);

            const deltaAngle = triangle.deg - pen.bearing
            deltaWrite(deltaAngle, output)
            output.push([1, triangle.c])

            pen.bearing = triangle.deg*/

            draw(pen, args, true, output)
        } else if (command.name == "C" || command.name == "c") {
            // Calculates points on the curve
            const curve = command.name === "C" ? cubicBezier(pen.coords, [args[0], args[1]], [args[2], args[3]], [args[4], args[5]]) : cubicBezier(pen.coords, [pen.coords[0] + args[0], pen.coords[1] + args[1]], [pen.coords[0] + args[2], pen.coords[1] + args[3]], [pen.coords[0] + args[4], pen.coords[1] + args[5]])

            // Draws between generated points
            for (const xy of curve) {
                const xyNew = xy.map((dim, index) => {
                    return dim - pen.coords[index]
                })
                pen.coords = xy
                console.log(xyNew);

                draw(pen, xyNew, true, output)
            }
        } else if (command.name == "Q" || command.name == "q") {
            // Calculates points on the curve
            const curve = command.name === "Q" ? quadBezier(pen.coords, [args[0], args[1]], [args[2], args[3]]) : quadBezier(pen.coords, [pen.coords[0] + args[0], pen.coords[1] + args[1]], [pen.coords[0] + args[2], pen.coords[1] + args[3]])

            for (const xy of curve) {
                const xyNew = xy.map((dim, index) => {
                    return dim - pen.coords[index]
                })
                pen.coords = xy
                console.log(xyNew);

                draw(pen, xyNew, true, output)
            }
        }

    })
    let textOut = "[\n"
    output.forEach(x => textOut += `[${x[0]}, ${x[1]}],`)
    textOut += "[4,0]\n]"
    console.log(textOut)
    return output


    /*output.map(cmd => '\x1b[31m' + cmd.join(" ") + '\x1b[0m').join("\n")
    const textOutput = output.map((cmd, index) => {
        const cmdn = cmd.shift()
        return "\x1b[90m" + (index.toString() + ":").padStart(3, " ") + ' \x1b[31m' + cmdn.padEnd("8") + '\x1b[36m' + cmd.join("") + '\x1b[0m'
    }).join("\n")
    console.log(textOutput);

    console.log("\x1b[4mDone in \x1b[32m" + (Date.now() - startTime) + " ms\x1b[0m");

    /*output.forEach(cmd => {
        if (turtle) {
            if (cmd[0] == 5, 0) turtle.penUp()
            if (cmd[0] == "d") turtle.penDown()
            if (cmd[0] == 2) turtle.left(cmd[1])
            if (cmd[0] == 3) turtle.right(cmd[1])
            if (cmd[0] == 1) turtle.forward(cmd[1])
        }
    })*/
}