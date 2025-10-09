import { Color } from "three";
import { PRESET_HEX } from "../services/lamp.service";

export function colorPresetActivated(color: Color, customColor: Color): boolean {
    let hex = `#${color.getHexString()}`;
    return (hex === PRESET_HEX.blue || 
            hex === PRESET_HEX.green ||
            hex === PRESET_HEX.red ||
            hex === PRESET_HEX.yellow || 
            color.getHexString() === customColor.getHexString());
  }