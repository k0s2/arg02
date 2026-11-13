// --------------------------------------------------
// ロード完了
// --------------------------------------------------

document.fonts.ready.then(() => {
    document.body.classList.add("loaded");
});

// ====================================================================================================
// 共通メソッド
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
// チュートリアル
// --------------------------------------------------

/**
 * チュートリアルメッセージ表示
 * @param {String} message 文章
 */
export async function setTutorial(message) {
    // 親要素を取得
    const tutorialElement = document.getElementById("tutorialWrapper");

    // 子要素を取得
    const p = tutorialElement.querySelector(".tutorial>p");

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

    // 親要素を表示
    tutorialElement.classList.remove("hidden");
}

/**
 * チュートリアルメッセージ非表示
 */
export function hideTutorial() {
    // 親要素を取得
    const tutorialElement = document.getElementById("tutorialWrapper");

    // 親要素を表示
    tutorialElement.classList.add("hidden");
}