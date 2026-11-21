// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// 定数
// --------------------------------------------------

import dataConst from "../../../common/data/const.js";

// --------------------------------------------------
// セーブ
// --------------------------------------------------

import {
    flagOn,
} from "../../../common/data/save.js";

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

// フェード時間
const FADE_TIME = 250;

// ロード時間
const LOAD_TIME = 2400;

// ====================================================================================================
// 共通処理
// ====================================================================================================

/**
 * 指定時間待機
 */
function wait(time) {
    // 指定時間分ウェイト
    return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * フェードアウト
 */
async function fadeOut(element) {
    // フェードアウト用クラスを付与
    element.classList.add("hidden");

    // フェード時間分ウェイト
    await wait(FADE_TIME);
}

/**
 * 初期状態に戻す
 */
function resetLogin() {
    // 画面状態を初期化
    document.querySelector("main").classList.remove("leaving");

    // 入力画面を表示
    areaInput.classList.remove("hidden");

    // ロード画面を非表示
    areaMessage.classList.add("hidden");

    // ロード状態の初期化
    loadPercent.textContent = "0%";
    loadProgress.style.width = "0%";

    // ログインボタンの有効化
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

    // ログインボタン無効化
    buttonLogin.disabled = true;

    // ログイン画面をフェードアウト
    await fadeOut(areaInput);

    // パスワード一致チェック
    if (document.getElementById("input-password").value == dataConst.willWord) {
        // ReatWriteモード解放
        // flagOn("releaseModeReadWrite");

        // メッセージ変更
        const targetMessage = document.getElementById("message");
        targetMessage.classList.remove("c-red");
        targetMessage.classList.add("c-green");
        targetMessage.innerHTML =
            "パスワードが一致しました。<br>"
            + "読み書き可能モードで起動します。";
    }

    // ローディング画面を表示
    areaMessage.classList.remove("hidden");

    // ウェイト
    await wait(500);

    // ロード
    await startLoading();

    // ウェイト
    await wait(500);

    // 画面遷移
    document.querySelector("main").classList.add("leaving");

    // ウェイト
    await wait(FADE_TIME);

    // 捜査システム画面へ遷移
    location.href = "../terminal/";

});

// ====================================================================================================
// ブラウザバック対策
// ====================================================================================================

window.addEventListener("pageshow", () => {

    // 初期状態に戻す
    resetLogin();

});