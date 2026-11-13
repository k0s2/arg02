// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// データ
// --------------------------------------------------

import tutorialMessage from "../data/tutorial.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    isFlagOn,
} from "../data/save.js";

// ====================================================================================================
// テンプレート読み込み
// ====================================================================================================

// --------------------------------------------------
// テンプレート読み込み
// --------------------------------------------------

/**
 * HTMLテンプレートを読み込む
 * @param {string} htmlPath HTMLファイルのパス
 * @param {string} cssPath CSSファイルのパス
 * @param {string} containerSelector 挿入先のセレクター
 * @returns {Promise<HTMLElement | null>}
 */
export async function loadTemplate(baseUrl, containerSelector = null) {
    // 読み込み先を取得
    let container = document.querySelector(containerSelector);

    // ダイアログ（読み込み先が指定されていない）の場合、bodyに要素を追加
    if (!container) {
        // 要素を生成
        const addTemplate = document.createElement("div");
        addTemplate.id = "addElement"

        // 要素をbodyに追加
        document.body.appendChild(addTemplate)

        // 読み込み先として指定
        container = addTemplate;
    }

    try {
        // CSSを取得して設定
        const cssUrl = new URL("./style.css", baseUrl);
        if (!document.querySelector(`link[href="${cssUrl.href}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssUrl.href;
            document.head.appendChild(link);
        }

        // HTMLを取得して設定
        const htmlUrl = new URL("./index.html", baseUrl);
        const response = await fetch(htmlUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        container.innerHTML = await response.text();

        return container;

    } catch (error) {
        console.error("テンプレートの読み込みに失敗しました。", error);
        return null;
    }
}

// --------------------------------------------------
// メール
// --------------------------------------------------

/**
 * 新着メールバッジの更新
 */
export function updateMailBadge() {
    const target = document.getElementById("buttonMail");

    if (!target) {
        return;
    }

    // 受信メールを取得
    const mails = JSON.parse(localStorage.getItem("mail-receive") || "[]");

    // 既読情報を取得
    const status = JSON.parse(localStorage.getItem("mail-status") || "{}");

    // 未読メールがあるか
    const hasNewMail = mails.some(id => status[id]?.readed == false);

    // バッジ表示
    target.classList.toggle("has-new-mail", hasNewMail);
}

// --------------------------------------------------
// チュートリアル
// --------------------------------------------------

/**
 * アニメーション再生
 * @param {HTMLElement} element アニメーション対象
 * @param {string} className アニメーション用クラス
 */
function playAnimation(element, className) {
    element.classList.remove(className);

    // アニメーションを再実行できるようにリフローを発生させる
    void element.offsetWidth;

    element.classList.add(className);

    element.addEventListener("animationend", function handler() {
        element.classList.remove(className);
        element.removeEventListener("animationend", handler);
    }, { once: true });
}

/**
 * チュートリアルメッセージ表示
 * @param {Number} messageId メッセージID
 */
export async function setTutorial(messageId) {
    // メッセージを取得
    const message = tutorialMessage[messageId];

    // 親要素を取得
    const parent = document.getElementById("tutorialWrapper");

    // 子要素を取得
    const child = parent.querySelector(".tutorial");

    // 段落要素を取得
    const p = child.querySelector("p");

    // 既に文章が設定されている場合
    if (p.innerHTML != "") {
        // 同じ文章の場合、処理を行わない
        if (p.innerHTML == message) {
            return
        }

        // 文章を消去
        p.classList.add("hidden");

        // transition完了を待機
        await new Promise((resolve) => {
            p.addEventListener("transitionend", resolve, { once: true });
        });
    }

    // 文章を設定
    p.innerHTML = message;
    p.classList.remove("hidden");

    // 更新アニメーション
    playAnimation(child, "update");

    // 親要素を表示
    parent.classList.remove("hidden");
}

/**
 * チュートリアルメッセージ非表示
 */
export function hideTutorial() {
    // 親要素を取得
    const parent = document.getElementById("tutorialWrapper");

    // 親要素を表示
    parent.classList.add("hidden");
}

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * 機能解放：メール
 */
function releaseMail() {
    // フラグチェック
    if (isFlagOn("release-mail")) {
        // ボタン要素を取得
        const target = document.getElementById("button-mail");
        if (target) {
            // リンクを設定
            target.href = "../a-mail/list/#receive";
            target.target = "_blank";
        }
    }
}

/**
 * 機能解放：エンディング
 */
function releaseEnd() {
    // // フラグチェック
    // if (isFlagOn("release-end")) {
    //     // ボタン要素を取得
    //     const target = document.getElementById("button-end");
    //     if (target) {
    //         // リンクを設定
    //         target.href = "";
    //         target.target = "";
    //     }
    // }
}

// --------------------------------------------------
// ヘッダーボタン更新：他タブ・ウィンドウの更新時
// --------------------------------------------------

window.addEventListener("storage", (event) => {
    // セーブ時イベント
    if (event.key === "remains13_save") {
        // メール
        releaseMail();

        // エンディング
        releaseEnd();
    }
});

// --------------------------------------------------
// ヘッダーボタン更新：画面表示時
// --------------------------------------------------

// メール
releaseMail();

// エンディング
releaseEnd();

// --------------------------------------------------
// ロード完了
// --------------------------------------------------

document.fonts.ready.then(() => {
    document.body.classList.add("loaded");
});