// ====================================================================================================
// 要素取得
// ====================================================================================================

const buttonLogin = document.getElementById("button-login");
const areaInput = document.getElementById("login-input");
const areaMessage = document.getElementById("login-message");

const loadPercent = areaMessage.querySelector(".loadPercent");
const loadProgress = areaMessage.querySelector(".loadProgress");

// ====================================================================================================
// 定数
// ====================================================================================================

const FADE_TIME = 250;
const LOAD_TIME = 2400;

// ====================================================================================================
// 共通処理
// ====================================================================================================

/**
 * 指定時間待機
 */
function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * フェードアウト
 */
async function fadeOut(element) {

    element.classList.add("hidden");

    await wait(FADE_TIME);

}

/**
 * 初期状態に戻す
 */
function resetLogin() {

    // 画面状態
    document.querySelector("main").classList.remove("leaving");

    areaInput.classList.remove("hidden");
    areaMessage.classList.add("hidden");

    // ロード状態
    loadPercent.textContent = "0%";
    loadProgress.style.width = "0%";

    // ボタン
    buttonLogin.disabled = false;

}

// ====================================================================================================
// ローディング
// ====================================================================================================

/**
 * ローディング演出
 */
function startLoading() {

    return new Promise(resolve => {

        const startTime = performance.now();

        function update() {

            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / LOAD_TIME, 1);
            const percent = Math.floor(progress * 100);

            loadPercent.textContent = `${percent}%`;
            loadProgress.style.width = `${percent}%`;

            if (progress >= 1) {
                resolve();
                return;
            }

            requestAnimationFrame(update);

        }

        requestAnimationFrame(update);

    });

}

// ====================================================================================================
// ログイン
// ====================================================================================================

buttonLogin.addEventListener("click", async () => {

    // 二重実行防止
    if (buttonLogin.disabled) {
        return;
    }

    buttonLogin.disabled = true;

    // ログイン画面をフェードアウト
    await fadeOut(areaInput);

    // ローディング画面を表示
    areaMessage.classList.remove("hidden");

    await wait(500);

    // ロード
    await startLoading();

    await wait(500);

    // 画面遷移
    document.querySelector("main").classList.add("leaving");

    await wait(FADE_TIME);

    location.href = "../terminal/";

});

// ====================================================================================================
// ブラウザバック対策
// ====================================================================================================

window.addEventListener("pageshow", () => {
    resetLogin();
});