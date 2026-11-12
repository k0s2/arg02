// ====================================================================================================
// インポート
// ====================================================================================================

// テンプレート
import { loadTemplate } from "../../controler.js";

// ====================================================================================================
// メール着信アナウンス
// ====================================================================================================

let targetNotice = null;
let hideTimer = null;

/**
 * メール着信アナウンスを表示
 */
export async function showMailNotice() {

    // --------------------------------------------------
    // テンプレート
    // --------------------------------------------------

    // 初回のみ読み込み
    if (!targetNotice) {

        // テンプレート読み込み
        const resultContainer = await loadTemplate(import.meta.url);

        // 読み込み失敗時
        if (!resultContainer) {
            return;
        }

        // 要素取得
        targetNotice = resultContainer.querySelector("#mail-notice");

        // 読み込み失敗時
        if (!targetNotice) {
            resultContainer.remove();
            return;
        }

        // --------------------------------------------------
        // イベント設定
        // --------------------------------------------------

        // ボタンとして設定
        targetNotice.setAttribute("role", "button");
        targetNotice.setAttribute("tabindex", "0");
        targetNotice.setAttribute("aria-label", "受信ボックスを開く");

        // 受信ボックスへ移動
        const openMail = () => {
            location.href = new URL("../../../a-mail/list/#receive", import.meta.url).href;
        };

        // クリック
        targetNotice.addEventListener("click", () => {
            openMail();
        });

        // キーボード操作
        targetNotice.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMail();
            }
        });

        // --------------------------------------------------
        // 表示位置
        // --------------------------------------------------

        // mainに移動
        document.querySelector("main").appendChild(targetNotice);

        // 読み込み用ラッパーを削除
        resultContainer.remove();

    }

    // --------------------------------------------------
    // 表示内容
    // --------------------------------------------------

    targetNotice.querySelector("h1").textContent = "MAIL RECEIVED";
    targetNotice.querySelector("p").textContent = "新着メールが届きました。クリックして確認してください。";

    // --------------------------------------------------
    // 表示
    // --------------------------------------------------

    // 既存タイマーを解除
    clearTimeout(hideTimer);

    // 一旦非表示にする
    targetNotice.classList.add("is-hidden");

    // 描画後に表示
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            targetNotice.classList.remove("is-hidden");
        });
    });

    // --------------------------------------------------
    // 自動で非表示
    // --------------------------------------------------

    hideTimer = setTimeout(() => {
        targetNotice.classList.add("is-hidden");
    }, 5000);

}