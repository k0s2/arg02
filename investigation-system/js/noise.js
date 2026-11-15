(() => {
    const STYLE_ID = "glitch-effect-style";
    const OVERLAY_ID = "glitch-effect-overlay";

    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(OVERLAY_ID)?.remove();

    const main = document.querySelector("main");

    if (!main) {
        console.warn("Glitch target <main> not found.");
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
        #${OVERLAY_ID} {
            position: absolute;
            inset: 0;
            z-index: 999;
            pointer-events: none;
            opacity: 0;
            overflow: hidden;
        }

        /* ノイズ */
        #${OVERLAY_ID} .noise {
            position: absolute;
            inset: 2px;
            opacity: 0;
            background-image:
                repeating-radial-gradient(
                    circle at 17% 32%,
                    rgba(255,255,255,.8) 0 1px,
                    transparent 1px 3px
                ),
                repeating-radial-gradient(
                    circle at 73% 68%,
                    rgba(0,0,0,.8) 0 1px,
                    transparent 1px 4px
                );
            background-size: 7px 7px, 9px 9px;
            animation: glitch-noise .12s steps(2) infinite;
        }

        /* 色収差 */
        #${OVERLAY_ID} .chromatic {
            position: absolute;
            inset: 0;
            opacity: 0;
            mix-blend-mode: screen;
        }

        #${OVERLAY_ID} .chromatic::before,
        #${OVERLAY_ID} .chromatic::after {
            content: "";
            position: absolute;
            inset: 0;
            opacity: 0;
        }

        #${OVERLAY_ID} .chromatic::before {
            background: repeating-linear-gradient(
                90deg,
                transparent 0 4px,
                rgba(255, 0, 0, .16) 5px,
                transparent 6px 10px
            );
            animation: chromatic-red .3s steps(2) infinite;
        }

        #${OVERLAY_ID} .chromatic::after {
            background: repeating-linear-gradient(
                90deg,
                transparent 0 6px,
                rgba(0, 180, 255, .16) 7px,
                transparent 8px 12px
            );
            animation: chromatic-blue .3s steps(2) infinite;
        }

        /* 横方向の乱れ */
        #${OVERLAY_ID} .scanline {
            position: absolute;
            inset: 2px;
            opacity: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 3px,
                rgba(0, 0, 0, .18) 4px
            );
        }

        #${OVERLAY_ID}.noise-active .noise {
            opacity: .24;
        }

        #${OVERLAY_ID}.chromatic-active .chromatic {
            opacity: 1;
        }

        #${OVERLAY_ID}.glitch-active .noise {
            opacity: .32;
        }

        #${OVERLAY_ID}.glitch-active .chromatic {
            opacity: 1;
        }

        #${OVERLAY_ID}.glitch-active .scanline {
            opacity: 1;
        }

        #${OVERLAY_ID}.active {
            opacity: 1;
        }

        @keyframes glitch-noise {
            0%   { background-position: 0 0, 0 0; }
            25%  { background-position: 2px -1px, -1px 2px; }
            50%  { background-position: -2px 1px, 2px -2px; }
            75%  { background-position: 1px 2px, -2px -1px; }
            100% { background-position: 0 0, 0 0; }
        }

        @keyframes chromatic-red {
            0%, 100% { opacity: .3; }
            50%      { opacity: 1; }
        }

        @keyframes chromatic-blue {
            0%, 100% { opacity: 1; }
            50%      { opacity: .3; }
        }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
        <div class="noise"></div>
        <div class="chromatic"></div>
        <div class="scanline"></div>
    `;

    main.appendChild(overlay);

    function activate(className) {
        overlay.className = `active ${className}`;
    }

    window.startNoise = () => activate("noise-active");

    window.startChromaticAberration = () =>
        activate("chromatic-active");

    window.startGlitch = () =>
        activate("glitch-active");

    window.stopGlitch = () => {
        overlay.className = "";
    };
})();