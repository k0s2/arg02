// --------------------------------------------------
// noise
// --------------------------------------------------

const OVERLAY_ID = "glitch-effect-overlay";

// CSS読み込み
const STYLE_ID = "glitch-effect-style";

if (!document.getElementById(STYLE_ID)) {
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = new URL("../style/noise.css", import.meta.url).href;
    document.head.appendChild(link);
}

const main = document.querySelector("main");

if (!main) {
    console.warn("Glitch target <main> not found.");
}

const overlay = document.createElement("div");
overlay.id = OVERLAY_ID;
overlay.innerHTML = `
    <div class="noise"></div>
    <div class="chromatic"></div>
    <div class="vignette"></div>
    <div class="scanline"></div>
`;

main?.appendChild(overlay);

function activate(className) {
    overlay.className = `active ${className}`;
}

export function startNoise() {
    activate("noise-active");
}

export function startChromaticAberration() {
    activate("chromatic-active");
}

export function startVignette() {
    activate("vignette-active");
}

export function startGlitch() {
    activate("glitch-active");
}

export function stopGlitch() {
    overlay.className = "";
}