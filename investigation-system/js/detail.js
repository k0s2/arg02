// ====================================================================================================
// 詳細表示
// ====================================================================================================

// --------------------------------------------------
// データ取得
// --------------------------------------------------

import {
    getItemCategory,
} from "./data.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    isUnlocked,
} from "./save.js";

// ====================================================================================================
// キーワード設定
// ====================================================================================================

/**
 * キーワード設定
 * @param {HTMLElement} detailElement 対象要素
 * @param {Function} acquireItem アイテム解放関数
 * @returns {void}
 */
function setKeyword(detailElement, acquireItem) {

    // キーワード要素を取得
    const targets = detailElement.querySelectorAll(".keyword");

    // 要素ごとに処理
    targets.forEach((target) => {

        // 証拠
        const evidenceId = target.getAttribute("getEvidence");

        if (evidenceId) {

            // 未取得
            if (!isUnlocked("evidence", evidenceId)) {

                target.addEventListener("click", () => {

                    acquireItem("evidence", evidenceId);

                    target.classList.add("get");

                });

            }
            // 取得済み
            else {

                target.classList.add("get");

            }

        }

        // 人物
        const personId = target.getAttribute("getPerson");

        if (personId) {

            // 未取得
            if (!isUnlocked("person", personId)) {

                target.addEventListener("click", () => {

                    acquireItem("person", personId);

                    target.classList.add("get");

                });

            }
            // 取得済み
            else {

                target.classList.add("get");

            }

        }

    });

}

// ====================================================================================================
// 詳細表示
// ====================================================================================================

/**
 * 詳細タイトルに項目名とカテゴリーを設定
 * @param {HTMLElement} title タイトル要素
 * @param {Object} item 表示するデータ
 * @param {string} type データの種類
 * @returns {void}
 */
function renderDetailTitle(title, item, type) {

    title.innerHTML = "";

    // 項目名
    const name = document.createTextNode(item.name);
    title.appendChild(name);

    // カテゴリー
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = getItemCategory(type, item.id);

    title.appendChild(category);

}

/**
 * 証拠の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @returns {void}
 */
export function renderEvidenceDetail(item, title, detail, acquireItem) {

    if (item === undefined) {
        title.innerHTML = "";
        detail.innerHTML = "";
        return;
    }

    renderDetailTitle(title, item, "evidence");

    detail.innerHTML = item.detail.join("<br>");

    setKeyword(detail, acquireItem);

}

/**
 * 人物の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @returns {void}
 */
export function renderPersonDetail(item, title, detail, acquireItem) {

    if (item === undefined) {
        title.innerHTML = "";
        detail.innerHTML = "";
        return;
    }

    renderDetailTitle(title, item, "person");

    detail.innerHTML = item.detail.join("<br>");

    setKeyword(detail, acquireItem);

}

// ====================================================================================================
// 詳細切り替えアニメーション
// ====================================================================================================

/**
 * 詳細をアニメーション付きで切り替え
 * @param {HTMLElement} panel 詳細パネル
 * @param {HTMLElement} title タイトル
 * @param {HTMLElement} detail 詳細本文
 * @param {Object|undefined} item 表示するデータ
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {Function} renderFunction 描画関数
 * @returns {Promise<void>}
 */
export async function transitionDetail(
    panel,
    title,
    detail,
    item,
    side,
    state,
    renderFunction
) {

    // アニメーション番号を更新
    state.sequence++;

    const sequence = state.sequence;

    // 現在の表示状態を取得
    const computedStyle = getComputedStyle(panel);

    const startTransform = computedStyle.transform;
    const startOpacity = computedStyle.opacity;

    // 実行中のアニメーションを停止
    if (state.animation !== null) {
        state.animation.cancel();
        state.animation = null;
    }

    // 現在詳細が表示されているか
    const hasContent = (
        title.textContent !== ""
        || detail.innerHTML !== ""
    );

    // ----------------------------------------------
    // 古い詳細をスライドアウト
    // ----------------------------------------------

    if (hasContent) {

        let exitTransform = "translateX(24px)";

        if (side === "right") {
            exitTransform = "translateX(-24px)";
        }

        const exitAnimation = panel.animate(
            [
                {
                    transform: startTransform,
                    opacity: startOpacity,
                },
                {
                    transform: exitTransform,
                    opacity: 0,
                },
            ],
            {
                duration: 180,
                easing: "ease-in",
                fill: "forwards",
            }
        );

        state.animation = exitAnimation;

        try {
            await exitAnimation.finished;
        } catch (error) {
            return;
        }

        if (sequence !== state.sequence) {
            return;
        }

        exitAnimation.cancel();
        state.animation = null;

    }

    // ----------------------------------------------
    // 新しい詳細を設定
    // ----------------------------------------------

    renderFunction(item);

    // 選択解除
    if (item === undefined) {
        panel.classList.add("empty");
        return;
    }

    panel.classList.remove("empty");

    // ----------------------------------------------
    // 新しい詳細をスライドイン
    // ----------------------------------------------

    let enterTransform = "translateX(-24px)";

    if (side === "right") {
        enterTransform = "translateX(24px)";
    }

    const enterAnimation = panel.animate(
        [
            {
                transform: enterTransform,
                opacity: 0,
            },
            {
                transform: "translateX(0)",
                opacity: 1,
            },
        ],
        {
            duration: 220,
            easing: "ease-out",
            fill: "both",
        }
    );

    state.animation = enterAnimation;

    try {
        await enterAnimation.finished;
    } catch (error) {
        return;
    }

    if (sequence !== state.sequence) {
        return;
    }

    enterAnimation.cancel();
    state.animation = null;

}