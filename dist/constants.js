"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__prefPath = exports.__appDataPath = exports.__userHome = exports.__plattform = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
exports.__plattform = process.platform;
exports.__userHome = os_1.homedir();
exports.__appDataPath = (exports.__plattform === "darwin") ? `${exports.__userHome}/.ngwebs/` : `${exports.__userHome}/ngwebs/`;
if (!fs_1.existsSync(exports.__appDataPath)) {
    fs_1.mkdirSync(exports.__appDataPath);
}
exports.__prefPath = `${exports.__appDataPath}prefs.json`;
//# sourceMappingURL=constants.js.map