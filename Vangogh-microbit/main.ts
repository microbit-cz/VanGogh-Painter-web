function drawTurtle(cmds: number[][]) {
    bluetooth.uartWriteString("%dsta")
    console.log("drawing" + cmds)
    for (let i = 0; i < cmds.length; i++) {
        bluetooth.uartWriteString("%dr" + i)
        console.log(cmds[i])
        if (cmds[i][0] == 1) {
            //forwards
            vanGogh.fd(cmds[i][1])
        } else if (cmds[i][0] == 2) {
            //left
            vanGogh.re(cmds[i][1], false)
        } else if (cmds[i][0] == 3) {
            //right
            vanGogh.re(cmds[i][1], true)
        } else if (cmds[i][0] == 4) {
            vanGogh.penDown()
        } else if (cmds[i][0] == 5) {
            //penup
            vanGogh.penUp()
        }
    }
    vanGogh.penUp()
    bluetooth.uartWriteString("%dend")
}
let cmds: number[][] = [[3]]
vanGogh.penDown()
vanGogh.penUp()
bluetooth.startUartService();
console.log("started");


function stringToNumberMatrix(input: string): number[][] {
    const matrix: number[][] = [];
    // Split the string by the substring "],["
    const rows = input.split("],[");
    for (let row of rows) {
        row = row.trim();
        // Remove any leading '[' from the first chunk
        if (row[0] === "[") {
            row = row.slice(1, row.length);
        }
        // Remove any trailing ']' from the last chunk
        if (row[row.length - 1] === "]") {
            row = row.slice(0, row.length - 1);
        }
        // Split by comma and convert to numbers
        const numbers = row
            .split(",")
            .map((value) => parseFloat(value.trim()))
            .filter((num) => !isNaN(num));
        matrix.push(numbers);
    }
    return matrix;
}

let receivedData = "";

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    const received = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine));
    //console.log("Received: " + received);
    if (received === "#") {
        console.log("received all data");
        cmds = stringToNumberMatrix(receivedData);
        drawTurtle(cmds);
        receivedData = "";
    } else {
        receivedData += received;
    }
})

bluetooth.onBluetoothConnected(function () {
    music.playTone(Note.A4, 100)
})
bluetooth.onBluetoothDisconnected(function () {
    music.playTone(Note.C3, 100)
})