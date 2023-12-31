var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.querySelector("canvas#canvas");
const ctx = canvas.getContext("2d");
const qSel = function (elm) { return document.querySelector(elm); };
class DVDObject {
    constructor(imgData, beginX, beginY) {
        this.imgURL = imgData;
        this.posX = beginX;
        this.posY = beginY;
        this.directionX = 1;
        this.directionY = 1;
    }
    update(x, y) {
        this.posX = x;
        this.posY = y;
    }
}
HTMLElement.prototype.replace = function (data, prefix = "$_") {
    const alternate_prefix = "id_dlr_";
    const _this = () => this;
    for (const i in data) {
        const old = _this().innerHTML;
        const span = () => _this().querySelector(`span.reactive#${alternate_prefix}${encodeURIComponent(i)}`);
        if (span() == null)
            _this().innerHTML =
                old.replace(`${prefix}${i}`, `
                <span class="reactive" id="${alternate_prefix}${encodeURIComponent(i)}"></span>`);
        span().innerText = data[i];
    }
};
const ELM_FILE_INPUT = qSel("input#fileInput");
const ELM_NUM_OF_DVD = qSel("input#numOfDVD");
const ELM_VELOCITY_X = qSel("input#velocityX");
const ELM_VELOCITY_Y = qSel("input#velocityY");
const RELOAD_BUTTON = qSel("button#reload");
const RESET_COUNTER_BUTTON = qSel("button#resetCounter");
const RESET_FILE_INPUT_BUTTON = qSel("button#resetFileInput");
const OVERLAY_DIALOG = qSel("#overlay");
const DEFAULT_CONFIG = {
    imgURL: "./img/default.png",
    velocityX: 144,
    velocityY: 144,
    numOfDVD: 1,
};
var config = {
    beginX: 1,
    beginY: 1,
    velocityX: DEFAULT_CONFIG.velocityX,
    velocityY: DEFAULT_CONFIG.velocityY,
    numOfDVD: DEFAULT_CONFIG.numOfDVD,
    imgURL: DEFAULT_CONFIG.imgURL,
    canvasWidth: 0,
    canvasHeight: 0,
    img: new Image(),
    resizeDelay: 100,
    overlayHideDelay: 3000,
};
var dvd = [];
var lastFrameTime = 0;
var animationFrame = 0;
var totalFrameTime = 0;
var totalFrameCount = 0;
var outOfFocus = false;
var resizeTimeout;
var mouseMoveTimeout;
var amountOfBounces = 0;
var amountOfCornerBounces = 0;
var hoveringOverlayDialog = false;
function handleFileSelect(elm) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = elm.files[0];
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
            }
            if (!file.type.startsWith('image/')) {
                reject({
                    "message": "File must be an image",
                    "data": null
                });
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileData = event.target.result;
                const blob = new Blob([fileData], { type: file.type });
                const blobUrl = URL.createObjectURL(blob);
                resolve(blobUrl);
            };
            reader.onerror = (event) => {
                reject({
                    "message": "Unknown error while reading the file",
                    "data": event.target.error
                });
            };
            reader.readAsArrayBuffer(file);
        });
    });
}
function randomNum(a, b) {
    if (a > b) {
        [a, b] = [b, a];
    }
    const min = Math.ceil(a);
    const max = Math.floor(b);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createDVD() {
    dvd.splice(0, dvd.length);
    for (var i = 0; i < config.numOfDVD; i++) {
        const beginX = i == 0 ? config.beginX : randomNum(config.beginX, config.beginX + config.canvasWidth - config.img.width);
        const beginY = i == 0 ? config.beginY : randomNum(config.beginY, config.beginY + config.canvasHeight - config.img.height);
        dvd.push(new DVDObject(config.imgURL, beginX, beginY));
    }
}
function draw(timestamp) {
    totalFrameCount++;
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    totalFrameTime += delta;
    if (totalFrameTime >= 1000) {
        OVERLAY_DIALOG.querySelector("#display_info").replace({
            "fps": totalFrameCount.toString()
        });
        totalFrameCount = 0;
        totalFrameTime = 0;
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    for (const i of dvd) {
        var bounce = 0;
        if (i.posX + config.img.width >= config.canvasWidth) {
            i.directionX = -1;
            bounce++;
        }
        if (i.posY + config.img.height >= config.canvasHeight) {
            i.directionY = -1;
            bounce++;
        }
        if (i.posX <= 0) {
            i.directionX = 1;
            bounce++;
        }
        if (i.posY <= 0) {
            i.directionY = 1;
            bounce++;
        }
        if (bounce > 1) {
            amountOfCornerBounces++;
        }
        amountOfBounces += bounce;
        ctx.drawImage(config.img, i.posX, i.posY);
        i.update(i.posX + config.velocityX * delta / 1000 * i.directionX, i.posY + config.velocityY * delta / 1000 * i.directionY);
    }
    OVERLAY_DIALOG.querySelector("#display_info").replace({
        amount_of_bounces: amountOfBounces.toString(),
        amount_of_corner_bounces: amountOfCornerBounces.toString()
    });
    if (!outOfFocus)
        animationFrame = requestAnimationFrame(draw);
}
function configReset() {
    ELM_FILE_INPUT.value = "";
    ELM_NUM_OF_DVD.value = DEFAULT_CONFIG.numOfDVD.toString();
    ELM_VELOCITY_X.value = DEFAULT_CONFIG.velocityX.toString();
    ELM_VELOCITY_Y.value = DEFAULT_CONFIG.velocityY.toString();
}
function configApply() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const IMG = yield handleFileSelect(ELM_FILE_INPUT);
            if (IMG != null) {
                config.imgURL = IMG;
            }
            else {
                config.imgURL = "./img/default.png";
            }
            config.numOfDVD = Number(ELM_NUM_OF_DVD.value);
            config.velocityX = Number(ELM_VELOCITY_X.value);
            config.velocityY = Number(ELM_VELOCITY_Y.value);
            reload();
        }
        catch (error) {
            if (error["message"] != undefined) {
                alert(error["message"]);
            }
            else {
                alert("Something has gone wrong, crash data has been sent to the Devtools");
                console.log(error);
            }
        }
    });
}
function numberInputChecker(event) {
    const inputValue = event.target.value;
    const onlyNumbers = /^\d*$/.test(inputValue);
    console.log(onlyNumbers);
    if (!onlyNumbers || inputValue == "") {
        event.target.value = '1';
    }
}
function reload() {
    cancelAnimationFrame(animationFrame);
    const img = new Image();
    img.onload = () => {
        config.img = img;
        createDVD();
        animationFrame = requestAnimationFrame(draw);
    };
    img.src = config.imgURL;
}
function resize() {
    config.canvasWidth = window.innerWidth;
    config.canvasHeight = window.innerHeight;
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;
}
function timeoutForMouseMove() {
    mouseMoveTimeout = setTimeout(() => {
        OVERLAY_DIALOG.classList.add("hide");
        document.body.style.cursor = "none";
    }, config.overlayHideDelay);
}
ELM_NUM_OF_DVD.addEventListener("input", numberInputChecker);
ELM_VELOCITY_X.addEventListener("input", numberInputChecker);
ELM_VELOCITY_Y.addEventListener("input", numberInputChecker);
RELOAD_BUTTON.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield configApply(); }));
RESET_FILE_INPUT_BUTTON.addEventListener("click", () => { ELM_FILE_INPUT.value = ""; });
RESET_COUNTER_BUTTON.addEventListener("click", () => {
    amountOfBounces = 0;
    amountOfCornerBounces = 0;
});
OVERLAY_DIALOG.addEventListener("mouseenter", () => {
    hoveringOverlayDialog = true;
    clearTimeout(mouseMoveTimeout);
    OVERLAY_DIALOG.classList.remove("hide");
    document.body.style.cursor = "default";
});
OVERLAY_DIALOG.addEventListener("mouseleave", () => {
    hoveringOverlayDialog = false;
    timeoutForMouseMove();
});
onload = () => {
    configReset();
    resize();
    reload();
    timeoutForMouseMove();
};
onresize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resize();
        reload();
    }, config.resizeDelay);
};
onblur = () => outOfFocus = true;
onfocus = () => {
    if (outOfFocus) {
        outOfFocus = false;
        lastFrameTime = performance.now();
        animationFrame = requestAnimationFrame(draw);
    }
};
onmousemove = () => {
    if (hoveringOverlayDialog)
        return;
    clearTimeout(mouseMoveTimeout);
    timeoutForMouseMove();
    OVERLAY_DIALOG.classList.remove("hide");
    document.body.style.cursor = "default";
};
//# sourceMappingURL=script.js.map