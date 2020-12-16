import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";

export const __plattform = process.platform;
export const __userHome = homedir();
export const __appDataPath= (__plattform === "darwin") ? `${__userHome}/.ngwebs/` : `${__userHome}/ngwebs/`;
if (!existsSync(__appDataPath)) {
    mkdirSync(__appDataPath);
}
export const __prefPath = `${__appDataPath}prefs.json` 

