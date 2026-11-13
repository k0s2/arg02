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
// チュートリアルウィンドウ
// --------------------------------------------------

/**
 * チュートリアルウィンドウ呼び出し
 * @param {HTMLElement} target 対象要素
 * @param {[String]} message 文章
 */
export function showTutorial(target, message) {

}