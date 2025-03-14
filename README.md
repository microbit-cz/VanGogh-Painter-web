[Čeština](README.cs.md)

# VanGogh Painter
This is a web application that cooperates with the [VanGogh Painter](https://github.com/microbit-cz/Vangogh-painter) robot to draw vector graphics using the `d` attribute in the `<path>` element. It can also converts other SVG elements (`<rect>`, `<circle>`, `<ellipse>`, etc.) to paths.

## Usage
- Connection to the robot is unfortunately not compatible with Windows 10, because of the system soon losing support. Therefore, it would not make sense to implement this feature in the long term.
1. Open the [web application](https://van-gogh-painter-web.vercel.app/) or run locally through the command line(`npm run dev` in the root directory of the project).
2. Pair the micro:bit to the computer.
3. Click on the "Connect" button and select the micro:bit from the list.
4. Click on the 'Upload' section and select the SVG file of your choice.
5. Make sure the paths are correctly sized using the canvas ruler and scale settings.
6. Click on the 'Start' button to start the drawing process.

## Other Features
- Simple **SVG editor** to add some simple shapes or download the SVG file.
- Zoom in/out on the canvas using the slider under the scale settings.