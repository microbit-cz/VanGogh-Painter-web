//% color="#CC7722" icon="/f1fc" block="Van Gogh" blockId="vanGogh"
namespace vanGogh {
    // initialization of servos
    const _pen = PCAmotor.Servos.S1;
    const _left = PCAmotor.Steppers.STPM1;
    const _right = PCAmotor.Steppers.STPM2;
    // How much does the pen lower or raise
    const _minPenHeight = 1900;
    const _maxPenHeight = 1260;
    //shift speed in mm/ms
    const _spd = 0.0215;
    //rotation speed deg/ms
    const _degSpd = 0.0178;

    // Always start calibration with Distance Calibration then Rotation Calibration

    //% blockId=calibDist block="Calibrate distance"
    //% weight=79
    //% blockGap=50
    export function calibDist() {
        penUp();
        basic.pause(500);
        PCAmotor.StepperStart(_left);
        PCAmotor.StepperStart(_right);
        basic.pause(500);
        PCAmotor.MotorStopAll();
        penDown();
        basic.pause(500);
        PCAmotor.StepperStart(_left);
        PCAmotor.StepperStart(_right);
        basic.pause(5000);
        PCAmotor.MotorStopAll();
        penUp();
    }

    //% blockId=calibRot block="Calibrate rotation"
    //% weight=79
    //% blockGap=50
    export function calibRot() {
        penDown();
        fd(50);
        penUp();
        fd(50, false);
        penDown();
        PCAmotor.StepperStart(_left, false);
        PCAmotor.StepperStart(_right);
        basic.pause(5000);
        PCAmotor.MotorStopAll();
        fd(50);
        penUp();
        fd(50, false);
    }

    /**
     * Van Gogh move
     * @param dist is distance of run in mm; eg: 10
     * @param invert is direction forward or backward; eg: true
    */
    //% blockId=fd block="Van Gogh move |%dist| mm forward |%invert|"
    //% weight=92
    export function fd(dist: number, invert: boolean = true): void {
        PCAmotor.StepperStart(_left, invert);
        PCAmotor.StepperStart(_right, invert);
        basic.pause(calcDist(dist));
        PCAmotor.MotorStopAll();
    }

    /**
     * Van Gogh move with certain speed
     * @param dist is distance of run in mm; eg: 10
     * @param interval is indicates the frequency of stopping in ms; eg: 10
     * @param invert is direction forward or backward; eg: true
    */
    //% blockId=fdSpeed block="Van Gogh move |%dist| mm forward |%invert| with stopping |%interval|"
    //% weight=92
    export function fdSpeed(dist: number, invert: boolean = true, interval: number = 1000): void {
        for (let i = 0; i <= interval; i++) {
            fd(dist / interval, invert);
            PCAmotor.MotorStopAll();
            basic.pause(1);
        }
    }

    /**
     * Van Gogh rotate
     * @param deg is rotation in degrees; eg: 10
     * @param invert is direction of rotation; eg: true
    */
    //% blockId=re block="Van Gogh rotate |%deg|° clockwise |%invert|"
    //% weight=92
    export function re(deg: number, invert: boolean = true): void {
        PCAmotor.StepperStart(_left, invert);
        PCAmotor.StepperStart(_right, !invert);
        basic.pause(calcDeg(deg));
        PCAmotor.MotorStopAll();
    }

    // Calculate distance to time with calibrated run speed
    function calcDist(t: number): number {
        return t / _spd;
    }
    // VCalculate rotation to time with calibrated rotation speed
    function calcDeg(d: number): number {
        return d / _degSpd;
    }

    //% blockId=penUp block="Raise pen"
    //% weight=79
    //% blockGap=50
    export function penUp(): void {
        PCAmotor.GeekServo(_pen, _minPenHeight);
        basic.showArrow(ArrowNames.North);
    }

    //% blockId=penDown block="Launch pen"
    //% weight=79
    //% blockGap=50
    export function penDown(): void {
        PCAmotor.GeekServo(_pen, _maxPenHeight);
        basic.showArrow(ArrowNames.South);
    }

    /**
     * Van Gogh draw rectangle
     * @param a is length of side A; eg: 10
     * @param b is length of side B; eg: 10
    */
    //% blockId=rectangle block="Van Gogh draw rectangle of size |%a| mm side A and of size |%b| mm side B"
    //% weight=92
    export function rectangle(a: number, b: number): void {
        penDown();
        for (let i = 0; i < 4; i++) {
            re(90);
            fd(i % 2 == 0 ? a : b);
        }
        penUp();
    }

    /**
     * Van Gogh draw circle
     * @param d is diameter of circle; eg: 10
    */
    //% blockId=circle block="Van Gogh draw circle with diameter of |%d| mm"
    //% weight=92
    export function circle(d: number): void {
        const circumference = Math.PI * d;
        penUp();
        fd(d / 2);
        re(90);
        for (let i = 0; i < 60; i++) {
            penDown();
            fd(circumference / 60);
            re(6);
        }
        penUp();
    }
}