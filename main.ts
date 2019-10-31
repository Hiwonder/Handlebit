/*
handlebit package
*/
//% weight=10 icon="\uf013" color=#2896ff
namespace handlebit {

    export enum Colors {
        //% blockId="Red" block="Red"
        Red = 0x01,
        //% blockId="Green" block="Green"
        Green = 0x02,
        //% blockId="Blue" block="Blue"
        Blue = 0x03,
    }

    export enum HandleButton {
        //% block="B1"
        B1 = EventBusValue.MES_DPAD_BUTTON_2_DOWN,
        //% block="B2"
        B2 = EventBusValue.MES_DPAD_BUTTON_3_DOWN,
        //% block="Left joystick"
        JOYSTICK1 = EventBusValue.MES_DPAD_BUTTON_B_DOWN,
        //% block="Right joystick"
        JOYSTICK2 = EventBusValue.MES_DPAD_BUTTON_C_DOWN
    }

    export enum HandleSensorValue {
        //% block="Left joystick X"
        JOYSTICK_X1,
        //% block="Left joystick Y"
        JOYSTICK_Y1,
        //% block="Right joystick X"
        JOYSTICK_X2,
        //% block="Right joystick Y"
        JOYSTICK_Y2
    }

    export enum ultrasonicPort {
        //% block="Port 1"
        port1 = 0x01
    }

    export enum colorSensorPort {
        //% block="Port 2"
        port2 = 0x02
    }
	
    export enum ShakeState {
        //% block="ON"
        ON,
        //% block="OFF"
        OFF
    }

  export  enum HandleLights {
        //% block="Light 1"
        Light1 = 0x00,
        //% block="Light 2"
        Light2 = 0x01,
        //% block="All"
        All = 0x02
    }
	
    export enum handle_Colors {
        //% block="Red"
        Red = 0x01,
        //% block="Green"
        Green = 0x02,
        //% block="Blue"
        Blue = 0x03,
        //% block="Black"
        Black = 0x04,
        //% block="White"
        White = 0x05,
        //% block="None"
        None = 0x06
    }

    export enum HandleFanPort {
        //% block="Port 1"
        port1 = 0x01
    }

    export enum HandleKnobPort {
        //% block="Port 1"
        port1 = 0x01
    }

    let lhRGBLight: HandleRGBLight.LHRGBLight;
    let R_F: number;
    let r_f: number;

    let g_f: number;
    let G_F: number;

    let b_f: number;
    let B_F: number;

    let JoystickX1: number = -1;
    let JoystickX2: number = -1;
    let JoystickY1: number = -1;
    let JoystickY2: number = -1;
    let UltrasonicValue: number = -1;
    let Knob: number = -1;
    let handleCmd: string = "";

    /**
       * Handlebit board initialization, please execute at boot time
      */
    //% weight=100 blockId=handlebitInit block="Initialize Handlebit"
    export function handlebitInit() {
        initRGBLight();
        initColorSensor();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);
        control.waitMicros(50);
        let buf = pins.createBuffer(4);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x02;
        buf[3] = 0x5A;//cmd type
        serial.writeBuffer(buf);
        basic.forever(() => {
            getHandleCmd();
        });
    }

    /**
     * Initialize RGB
     */
    function initRGBLight() {
        if (!lhRGBLight) {
            lhRGBLight = HandleRGBLight.create(DigitalPin.P15, 2, HandleRGBPixelMode.RGB);
        }
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="handle_setBrightness" block="set brightness %brightness"
    //% weight=97
    export function handle_setBrightness(brightness: number): void {
        lhRGBLight.setBrightness(brightness);
    }

    /**
     * Set the color of the colored lights.
     */
    //% weight=98 blockId=setPixelRGB block="Set|%lightoffset|color to %rgb"
    export function handle_setPixelRGB(lightoffset: HandleLights, rgb: HandleRGBColors) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=96 blockId=setPixelRGBArgs block="Set|%lightoffset|color to %rgb,color range from 1 to 9"
    //% rgb.min=1 rgb.max=9
    export function handle_setPixelRGBArgs(lightoffset: HandleLights, rgb: number) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=94 blockId=qdee_showLight block="Show light"
    export function handle_showLight() {
        lhRGBLight.show();
    }
    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=92 blockGap=50 blockId=clearLight block="Clear light"
    export function clearLight() {
        lhRGBLight.clear();
    }


    const APDS9960_I2C_ADDR = 0x39;
    const APDS9960_ID_1 = 0xA8;
    const APDS9960_ID_2 = 0x9C;
    /* APDS-9960 register addresses */
    const APDS9960_ENABLE = 0x80;
    const APDS9960_ATIME = 0x81;
    const APDS9960_WTIME = 0x83;
    const APDS9960_AILTL = 0x84;
    const APDS9960_AILTH = 0x85;
    const APDS9960_AIHTL = 0x86;
    const APDS9960_AIHTH = 0x87;
    const APDS9960_PERS = 0x8C;
    const APDS9960_CONFIG1 = 0x8D;
    const APDS9960_PPULSE = 0x8E;
    const APDS9960_CONTROL = 0x8F;
    const APDS9960_CONFIG2 = 0x90;
    const APDS9960_ID = 0x92;
    const APDS9960_STATUS = 0x93;
    const APDS9960_CDATAL = 0x94;
    const APDS9960_CDATAH = 0x95;
    const APDS9960_RDATAL = 0x96;
    const APDS9960_RDATAH = 0x97;
    const APDS9960_GDATAL = 0x98;
    const APDS9960_GDATAH = 0x99;
    const APDS9960_BDATAL = 0x9A;
    const APDS9960_BDATAH = 0x9B;
    const APDS9960_POFFSET_UR = 0x9D;
    const APDS9960_POFFSET_DL = 0x9E;
    const APDS9960_CONFIG3 = 0x9F;
    const APDS9960_GCONF4 = 0xAB;
    const APDS9960_AICLEAR = 0xE7;


    /* LED Drive values */
    const LED_DRIVE_100MA = 0;

    /* ALS Gain (AGAIN) values */
    const AGAIN_4X = 1;

    /* Default values */
    const DEFAULT_ATIME = 219;    // 103ms
    const DEFAULT_WTIME = 246;    // 27ms
    const DEFAULT_PROX_PPULSE = 0x87;    // 16us, 8 pulses
    const DEFAULT_POFFSET_UR = 0;       // 0 offset
    const DEFAULT_POFFSET_DL = 0;       // 0 offset      
    const DEFAULT_CONFIG1 = 0x60;    // No 12x wait (WTIME) factor
    const DEFAULT_AILT = 0xFFFF;  // Force interrupt for calibration
    const DEFAULT_AIHT = 0;
    const DEFAULT_PERS = 0x11;    // 2 consecutive prox or ALS for int.
    const DEFAULT_CONFIG2 = 0x01;    // No saturation interrupts or LED boost  
    const DEFAULT_CONFIG3 = 0;       // Enable all photodiodes, no SAI
    const DEFAULT_LDRIVE = LED_DRIVE_100MA;
    const DEFAULT_AGAIN = AGAIN_4X;

    const OFF = 0;
    const POWER = 0;
    const AMBIENT_LIGHT = 1;
    const ALL = 7;

    const red_wb = 2130;
    const green_wb = 3500;
    const blue_wb = 4620;

    function i2cwrite(reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(APDS9960_I2C_ADDR, buf);
    }

    function i2cread(reg: number): number {
        pins.i2cWriteNumber(APDS9960_I2C_ADDR, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(APDS9960_I2C_ADDR, NumberFormat.UInt8BE);
        return val;
    }


    function InitColor(): boolean {
        let id = i2cread(APDS9960_ID);
        //  serial.writeLine("id:")
        //  serial.writeNumber(id); 
        // if (!(id == APDS9960_ID_1 || id == APDS9960_ID_2)) {
        //     return false;
        // }
        //  serial.writeLine("set mode:")
        setMode(ALL, OFF);
        i2cwrite(APDS9960_ATIME, DEFAULT_ATIME);
        i2cwrite(APDS9960_WTIME, DEFAULT_WTIME);
        i2cwrite(APDS9960_PPULSE, DEFAULT_PROX_PPULSE);
        i2cwrite(APDS9960_POFFSET_UR, DEFAULT_POFFSET_UR);
        i2cwrite(APDS9960_POFFSET_DL, DEFAULT_POFFSET_DL);
        i2cwrite(APDS9960_CONFIG1, DEFAULT_CONFIG1);
        setLEDDrive(DEFAULT_LDRIVE);
        setAmbientLightGain(DEFAULT_AGAIN);
        setLightIntLowThreshold(DEFAULT_AILT);
        setLightIntHighThreshold(DEFAULT_AIHT);
        i2cwrite(APDS9960_PERS, DEFAULT_PERS);
        i2cwrite(APDS9960_CONFIG2, DEFAULT_CONFIG2);
        i2cwrite(APDS9960_CONFIG3, DEFAULT_CONFIG3);
        return true;
    }

    function setLEDDrive(drive: number) {
        let val = i2cread(APDS9960_CONTROL);
        /* Set bits in register to given value */
        drive &= 0b00000011;
        drive = drive << 6;
        val &= 0b00111111;
        val |= drive;
        i2cwrite(APDS9960_CONTROL, val);
    }

    function setLightIntLowThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        i2cwrite(APDS9960_AILTL, val_low);
        i2cwrite(APDS9960_AILTH, val_high);
    }

    function setLightIntHighThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        i2cwrite(APDS9960_AIHTL, val_low);
        i2cwrite(APDS9960_AIHTH, val_high);
    }


    function rgb2hue(r: number, g: number, b: number): number {
        let max = Math.max(r, Math.max(g, b))
        let min = Math.min(r, Math.min(g, b))
        let c = max - min;
        let hue = 0;
        let segment = 0;
        let shift = 0;
        if (c == 0)
            return 0;
        if ((r > g) && (r > b)) {
            segment = (60.0 * (g - b)) / c;
            if (segment < 0)
                hue = segment + 360;
        }
        else if ((g > b) && (g > r)) {
            segment = (60.0 * (b - r)) / c;
            hue = segment + 120;
        }
        else if ((b > g) && (b > r)) {
            segment = (60.0 * (r - g)) / c;
            hue = segment + 240;
        }
        return hue;
    }

    function setMode(mode: number, enable: number) {
        let reg_val = getMode();
        /* Change bit(s) in ENABLE register */
        enable = enable & 0x01;
        if (mode >= 0 && mode <= 6) {
            if (enable > 0) {
                reg_val |= (1 << mode);
            }
            else {
                //reg_val &= ~(1 << mode);
                reg_val &= (0xff - (1 << mode));
            }
        }
        else if (mode == ALL) {
            if (enable > 0) {
                reg_val = 0x7F;
            }
            else {
                reg_val = 0x00;
            }
        }
        i2cwrite(APDS9960_ENABLE, reg_val);
    }

    function getMode(): number {
        let enable_value = i2cread(APDS9960_ENABLE);
        return enable_value;
    }

    function enableLightSensor(interrupts: boolean) {
        setAmbientLightGain(DEFAULT_AGAIN);
        if (interrupts) {
            setAmbientLightIntEnable(1);
        }
        else {
            setAmbientLightIntEnable(0);
        }
        enablePower();
        setMode(AMBIENT_LIGHT, 1);
    }

    function setAmbientLightGain(drive: number) {
        let val = i2cread(APDS9960_CONTROL);
        /* Set bits in register to given value */
        drive &= 0b00000011;
        val &= 0b11111100;
        val |= drive;
        i2cwrite(APDS9960_CONTROL, val);
    }

    function getAmbientLightGain(): number {
        let val = i2cread(APDS9960_CONTROL);
        val &= 0b00000011;
        return val;
    }

    function enablePower() {
        setMode(POWER, 1);
    }

    function setAmbientLightIntEnable(enable: number) {
        let val = i2cread(APDS9960_ENABLE);
        /* Set bits in register to given value */
        enable &= 0b00000001;
        enable = enable << 4;
        val &= 0b11101111;
        val |= enable;
        i2cwrite(APDS9960_ENABLE, val);
    }

    function readAmbientLight(): number {
        let val = i2cread(APDS9960_CDATAL);
        let val_byte = i2cread(APDS9960_CDATAH);
        val = val + val_byte * 256;
        return val;
    }


    /**
     * Initialize the color sensor,please execute at boot time
     */
    //% weight=90 blockId=handle_init_colorSensor block="Initialize color sensor port at %port"
    export function startbit_init_colorSensor(port: colorSensorPort) {
        InitColor();
        enableLightSensor(true);
        control.waitMicros(100);
    }

    /**
	 *  Color sensor return the color.
	 */
    //% weight=88 blockGap=50 blockId=handle_checkCurrentColor block="Current color %color"
    export function startbit_checkCurrentColor(color: handle_Colors): boolean {
        let c = i2cread(APDS9960_CDATAL) + i2cread(APDS9960_CDATAH) * 256;
        let r = i2cread(APDS9960_RDATAL) + i2cread(APDS9960_RDATAH) * 256;
        let g = i2cread(APDS9960_GDATAL) + i2cread(APDS9960_GDATAH) * 256;
        let b = i2cread(APDS9960_BDATAL) + i2cread(APDS9960_BDATAH) * 256;

        // serial.writeNumber(c);
        // serial.writeLine("->ccc");
        // serial.writeNumber(r);
        // serial.writeLine("->red");
        // serial.writeNumber(g);
        // serial.writeLine("->green");
        // serial.writeNumber(b);
        // serial.writeLine("->blue");

        if (r > red_wb)
            r = red_wb;
        if (g > green_wb)
            g = green_wb;
        if (b > blue_wb)
            b = blue_wb;

        r = Math.round(mapRGB(r, 0, red_wb, 0, 255));
        g = Math.round(mapRGB(g, 0, green_wb, 0, 255));
        b = Math.round(mapRGB(b, 0, blue_wb, 0, 255));
        // serial.writeNumber(r);
        // serial.writeLine("->rred");
        // serial.writeNumber(g);
        // serial.writeLine("->ggreen");
        // serial.writeNumber(b);
        // serial.writeLine("->bblue");
         let hsv = rgb2hue(r, g, b);
        // serial.writeNumber(hsv);
        // serial.writeLine("->hsv");
        let t = handle_Colors.None;
        if (c > 2200 && r > 65 && g > 65 && b > 65) {
            t = handle_Colors.White;
        }
        else if (c > 800) {
            if (hsv < 8 || hsv > 350)
                t = handle_Colors.Red;
            else if (hsv > 60 && hsv < 170) {
                t = handle_Colors.Green;
            }
            else if (hsv > 210 && hsv < 230) {
                t = handle_Colors.Blue;
            }
        }
        else if (c > 200 && r > 10 && g > 7 && b > 7 && r < 16.5 && g < 15 && b < 14) {
            t = handle_Colors.Black;
        }
        return (color == t);
    }

    function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }


    /**
     * Get the handle command.
     */
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        let startIndex: number = 0;
        if (cnt == 0)
            return;
        for (let i = 0; i < cnt; i++) {
            let index = findIndexof(handleCmd, "$", startIndex);
            if (index != -1) {
                let cmd: string = handleCmd.substr(startIndex, index - startIndex);
                if (cmd.charAt(0).compare("K") == 0 && cmd.length < 9) {
                    for (let j = 0; j < cmd.length - 1; j++) {
                        let args: string = cmd.substr(1 + j, 1);
                        let argsInt: number = strToNumber(args);
                        if (argsInt == -1) {
                            handleCmd = "";
                            return;
                        }
                        switch (argsInt) {
                            case 1:
                                control.raiseEvent(EventBusSource.MES_DPAD_CONTROLLER_ID, HandleButton.B1);
                                break;

                            case 3:
                                control.raiseEvent(EventBusSource.MES_DPAD_CONTROLLER_ID, HandleButton.B2);
                                break;

                            case 5:
                                control.raiseEvent(EventBusSource.MES_DPAD_CONTROLLER_ID, HandleButton.JOYSTICK1);
                                break;

                            case 7:
                                control.raiseEvent(EventBusSource.MES_DPAD_CONTROLLER_ID, HandleButton.JOYSTICK2);
                                break;

                            default:
                                break;
                        }
                    }
                }
                else if (cmd.charAt(0).compare("J") == 0 && cmd.length == 9) {
                    let args: string = cmd.substr(1, 2);
                    let argsInt: number = strToNumber(args);
                    if (argsInt == -1) {
                        handleCmd = "";
                        return;
                    }
                    JoystickX1 = 255 - argsInt;

                    args = cmd.substr(3, 2);
                    argsInt = strToNumber(args);
                    if (argsInt == -1) {
                        handleCmd = "";
                        return;
                    }
                    JoystickY1 = argsInt;

                    args = cmd.substr(5, 2);
                    argsInt = strToNumber(args);
                    if (argsInt == -1) {
                        handleCmd = "";
                        return;
                    }
                    JoystickX2 = 255 - argsInt;

                    args = cmd.substr(7, 2);
                    argsInt = strToNumber(args);
                    if (argsInt == -1) {
                        handleCmd = "";
                        return;
                    }
                    JoystickY2 = argsInt;
                }
                startIndex = index + 1;
            }

        }
        if (cnt > 0) {
            handleCmd = "";
        }
    }

    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }

    function countChar(src: string, strFind: string): number {
        let cnt: number = 0;
        for (let i = 0; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                cnt++;
            }
        }
        return cnt;
    }

    /**
     * Do something when a button is pushed down and released again.
     * @param button the button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% weight=86 blockId=onHandleButtonPressed block="on button|%button|pressed"
    export function onHandleButtonPressed(button: HandleButton, body: Action) {
        control.onEvent(EventBusSource.MES_DPAD_CONTROLLER_ID, button, body);
    }

    /**
     * Returns the handle sensor value.
     */
    //% weight=84 blockGap=50 blockId=handle_getHandleSensorValue block="handle|%type|sensor value"
    export function handle_getHandleSensorValue(type: HandleSensorValue): number {
        let value: number = 0;
        switch (type) {
            case HandleSensorValue.JOYSTICK_X1: value = JoystickX1; break;
            case HandleSensorValue.JOYSTICK_Y1: value = JoystickY1; break;
            case HandleSensorValue.JOYSTICK_X2: value = JoystickX2; break;
            case HandleSensorValue.JOYSTICK_Y2: value = JoystickY2; break;
        }
        return value;
    }

    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    let distanceBak = 0;
    /**
    * Get the distance of ultrasonic detection to the obstacle 
    */
    //% weight=82 blockId=handlebit_ultrasonic  block="Ultrasonic|port %port|distance(cm)"
    export function handlebit_ultrasonic(port: ultrasonicPort): number {
        let echoPin: DigitalPin = DigitalPin.P2;
        let trigPin: DigitalPin = DigitalPin.P1;

        pins.setPull(echoPin, PinPullMode.PullNone);
        pins.setPull(trigPin, PinPullMode.PullNone);
        pins.digitalWritePin(trigPin, 0);
        control.waitMicros(5);
        pins.digitalWritePin(trigPin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trigPin, 0);

        let d = pins.pulseIn(echoPin, PulseValue.High, 15000);
        let distance = d;
        // filter timeout spikes
        if (distance == 0 || distance >= 13920) {
            distance = distanceBak;
        }
        else
            distanceBak = d;
        return Math.round(distance * 10 / 6 / 58);
    }


    /**
    * Set the fan speed
    */
    //% weight=80 blockId=handle_setFanSpeed  block="Set fan |port %port|and |speed %speed|"
    //% speed.min=-100 speed.max=100   
    export function handle_setFanSpeed(port: HandleFanPort, speed: number) {
        let value: number;
        if (port == HandleFanPort.port1) {
            if (speed >= 0) {
                value = mapRGB(speed, 0, 100, 0, 1023);
                pins.analogWritePin(AnalogPin.P2, value);
                pins.analogWritePin(AnalogPin.P1, 0);
            }
            else if (speed < 0) {
                value = mapRGB(-1 * speed, 0, 100, 0, 1023);
                pins.analogWritePin(AnalogPin.P1, value);
                pins.analogWritePin(AnalogPin.P2, 0);
            }
        }
    }

    /**
     * Get the knob value
     */
    //% weight=78 blockId=handle_getKnobValue block="Get knob |port %port| value(0~100)"
    export function handle_getKnobValue(port: HandleKnobPort): number {
        let knobValue: number;
        serial.writeNumber(0);
        switch (port) {
            case HandleKnobPort.port1:
                knobValue = pins.analogReadPin(AnalogPin.P1);
                break;
        }
        knobValue = mapRGB(knobValue, 0, 1023, 0, 100);
        return knobValue;
    }

    /**
     *  The Melody of Little star   
     */
    //% weight=76 blockId=littleStarMelody block="Little star melody"
    export function littleStarMelody(): string[] {
        return ["C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4"];
    }

    /**
    * Shake
    *@param state is boolean, eg: true
    */
    //% weight=74 blockId=handle_shake  block="handle shake|%state"  
    export function handle_shake(state: ShakeState) {
        if (state == ShakeState.ON)
            pins.digitalWritePin(DigitalPin.P16, 1);
        else
            pins.digitalWritePin(DigitalPin.P16, 0);
    }
}
