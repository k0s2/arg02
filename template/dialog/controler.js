// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// 共通コントローラー
// --------------------------------------------------

import { loadTemplate, setInnerHtml } from "../../js/common.js";

// ====================================================================================================
// ダイアログを閉じる
// ====================================================================================================

// ダイアログ要素
let resultContainer = null;

/**
 * ダイアログを閉じる
 */
function hideDialog() {
    // --------------------------------------------------
    // 閉じる処理
    // --------------------------------------------------

    // ダイアログを取得
    const target = resultContainer.querySelector("#dialog");

    // トランジション終了イベント
    const onTransitionEnd = (event) => {
        // ダイアログ自身のopacity以外は無視
        if (event.target !== target || event.propertyName !== "opacity") {
            return;
        }

        // イベントリスナーを解除
        target.removeEventListener("transitionend", onTransitionEnd);

        // ダイアログ要素を削除
        resultContainer.remove();
    };
    target.addEventListener("transitionend", onTransitionEnd);

    // 非表示クラスを付与
    target.classList.add("is-hidden");

    // --------------------------------------------------
    // ダイアログ外の操作を有効化
    // --------------------------------------------------

    document.querySelector("main").inert = false;
    document.querySelector("header").inert = false;
    document.querySelector("footer").inert = false;
}

// ====================================================================================================
// 共通メソッド
// ====================================================================================================

/**
 * ダイアログを表示
 * @param {String} message 確認文章
 * @param {String} title 見出し（省略可）
 * @param {[String]} buttons ボタン（省略可）
 * @param {Number} mode モード（0:通常 / 1:思考 / 2:警告 / 3:システム）
 */
export async function showDialog(message, title = "", buttons = null, mode = 0) {
    return new Promise(async (resolve) => {

        // --------------------------------------------------
        // テンプレート
        // --------------------------------------------------

        // 読み込み
        resultContainer = await loadTemplate(
            import.meta.url,
            null
        );

        // --------------------------------------------------
        // モード
        // --------------------------------------------------

        // ラッパーを取得
        const targetBack = resultContainer.querySelector("#dialog");

        switch (mode) {
            // --------------------------------------------------
            // ●思考
            // --------------------------------------------------
            case 1:

                // モード切替
                targetBack.classList.add("is-mind");

                break;

            // --------------------------------------------------
            // ●警告
            // --------------------------------------------------
            case 2:

                // モード切替
                targetBack.classList.add("is-alert");

                break;

            // --------------------------------------------------
            // ●システム
            // --------------------------------------------------
            case 3:

                // モード切替
                targetBack.classList.add("is-system");

                break;

            // --------------------------------------------------
            // ●デフォルト
            // --------------------------------------------------
            default:
        }

        // --------------------------------------------------
        // 見出しを設定
        // --------------------------------------------------

        // 対象を取得
        const h1 = resultContainer.querySelector("h1");

        // ●設定値あり
        if (title) {
            // 文字列を設定
            h1.textContent = title;
        }
        // ●設定値なし
        else {
            // 要素を削除
            h1.remove();
        }

        // --------------------------------------------------
        // 内容を設定
        // --------------------------------------------------

        // 対象を取得
        const p = resultContainer.querySelector("p");

        // ●設定値あり
        if (message) {
            // 文字列を設定
            p.innerHTML = setInnerHtml(message);
        }
        // ●設定値なし
        else {
            // 要素を削除
            p.remove();
        }

        // --------------------------------------------------
        // ダイアログ外の操作を無効化
        // --------------------------------------------------

        document.querySelector("main").inert = true;
        document.querySelector("header").inert = true;
        document.querySelector("footer").inert = true;

        // --------------------------------------------------
        // 閉じるボタン
        // --------------------------------------------------

        // ●設定値なし
        if (!buttons) {
            // 「閉じる」ボタンのみにする
            buttons = ["閉じる"];
        }

        // ボタン配置位置を取得
        const targetButtons = resultContainer.querySelector(".buttons");

        // 設定値ごとに処理
        buttons.forEach((text, index) => {
            // ボタンを生成
            const button = document.createElement("button");
            button.innerHTML = text;

            // ●警告モードの「はい」
            if (
                mode == 2
                && index == 0
            ) {
                const HOLD_TIME = 1000;
                let holdStart = 0;
                let holdFrame = null;
                let holding = false;

                /**
                 * 長押し中のゲージ更新
                 */
                function updateGauge() {
                    const progress = Math.min(
                        (performance.now() - holdStart) / HOLD_TIME,
                        1
                    );

                    button.style.setProperty("--progress", `${progress * 100}%`);

                    if (progress >= 1) {
                        holding = false;
                        hideDialog();
                        resolve(index);
                        return;
                    }

                    holdFrame = requestAnimationFrame(updateGauge);
                }

                /**
                 * 長押し開始
                 */
                function startHold() {
                    if (holding) {
                        return;
                    }

                    holding = true;
                    button.classList.add("is-holding");
                    holdStart = performance.now();
                    holdFrame = requestAnimationFrame(updateGauge);
                }

                // イベント設定
                button.addEventListener("pointerdown", event => {
                    if (event.button !== 0) {
                        return;
                    }

                    event.preventDefault();
                    button.setPointerCapture(event.pointerId);
                    startHold();
                });
                button.addEventListener("keydown", event => {
                    if (event.key !== "Enter" && event.key !== " ") {
                        return;
                    }

                    event.preventDefault();

                    if (!event.repeat) {
                        startHold();
                    }
                });

                /**
                 * 長押し中断
                 */
                function cancelHold() {
                    if (!holding) {
                        return;
                    }

                    holding = false;
                    button.classList.remove("is-holding");
                    cancelAnimationFrame(holdFrame);
                    button.style.setProperty("--progress", "0%");
                }

                // イベント設定
                button.addEventListener("pointerup", cancelHold);
                button.addEventListener("pointercancel", cancelHold);
                button.addEventListener("lostpointercapture", cancelHold);
                button.addEventListener("blur", cancelHold);
                button.addEventListener("keyup", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        cancelHold();
                    }
                });
            }
            // ●通常
            else {
                // クリックイベントを追加
                button.addEventListener("click", () => {
                    // ダイアログを閉じる
                    hideDialog();

                    // 選択インデックスを渡す
                    resolve(index);
                });
            }

            // ボタンエリアに追加
            targetButtons.appendChild(button);
        });

        // --------------------------------------------------
        // 枠外をクリックで閉じる
        // --------------------------------------------------

        const targetBackCover = resultContainer.querySelector("#dialog");
        targetBackCover.addEventListener("click", (event) => {

            // 子要素クリックで発火しないようにする
            if (event.target === event.currentTarget) {
                // ダイアログを閉じる
                hideDialog();

                // 選択インデックスを渡す
                resolve(-1);
            }

        });

        // --------------------------------------------------
        // トランジション
        // --------------------------------------------------

        // 描画を待つ
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 非表示クラスを除去
                const target = resultContainer.querySelector("#dialog");
                target.classList.remove("is-hidden");
            });
        });

    });

}

/**
 * ダイアログ（思考モード）を表示
 * @param {String} message 確認文章
 * @param {String} title 見出し（省略可）
 * @param {[String]} buttons ボタン（省略可）
 */
export async function showThinkDialog(message, title = "", buttons = null) {
    // 思考モードで、既存のダイアログ表示処理を呼び出し
    return showDialog(message, title, buttons, 1);
}

/**
 * ダイアログ（警告モード）を表示
 * @param {String} message 確認文章
 * @param {String} title 見出し（省略可）
 * @param {[String]} buttons ボタン（省略可）
 */
export async function showAlert(message) {
    // 警告モードで、既存のダイアログ表示処理を呼び出し
    return showDialog(message, "確認", ["はい<span>長押しで実行</span>", "いいえ"], 2);
}

/**
 * ダイアログ（システムモード）を表示
 * @param {String} message 確認文章
 * @param {String} title 見出し（省略可）
 * @param {[String]} buttons ボタン（省略可）
 */
export async function showSystemDialog(message, title = "", buttons = null) {
    // システムモードで、既存のダイアログ表示処理を呼び出し
    return showDialog(message, title, buttons, 3);
}