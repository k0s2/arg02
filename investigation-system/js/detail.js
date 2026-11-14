// ====================================================================================================
// 詳細表示
// ====================================================================================================

// --------------------------------------------------
// 共通コントローラー
// --------------------------------------------------

import {
    setTutorial,
} from "../../js/common.js";


// --------------------------------------------------
// ダイアログ
// --------------------------------------------------

import {
    showDialog,
} from "../../template/dialog/controler.js"

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
    flagOn,
    isFlagOn,
} from "../../data/save.js";

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

        // 解放対象を取得
        const items = [
            {
                type: "evidence",
                ids: target.getAttribute("getEvidence"),
            },
            {
                type: "person",
                ids: target.getAttribute("getPerson"),
            },
        ];

        // IDを配列化
        items.forEach(item => {

            if (item.ids) {
                item.ids = item.ids
                    .split(",")
                    .map(id => id.trim())
                    .filter(id => id);
            } else {
                item.ids = [];
            }

        });

        // 解放対象がなければ終了
        const unlockItems = items.filter(item => item.ids.length > 0);

        if (unlockItems.length === 0) {
            return;
        }

        // すべて取得済みなら取得済み表示
        const isComplete = () => unlockItems.every(item =>
            isUnlocked(item.type, item.ids)
        );

        if (isComplete()) {
            target.classList.add("get");
            return;
        }

        // クリックイベント
        target.addEventListener("click", () => {

            let acquired = false;

            // 未取得のアイテムをすべて解放
            unlockItems.forEach(item => {

                item.ids.forEach(id => {

                    if (!isUnlocked(item.type, id)) {
                        acquireItem(item.type, id);
                        acquired = true;
                    }

                });

            });

            // すべて取得済みなら取得済み表示
            if (isComplete()) {
                target.classList.add("get");
            }

            // 【ストーリー進行】チュートリアル
            if (acquired && isFlagOn("tutorial-4") == false) {
                flagOn("tutorial-3");
                setTutorial(3);
            }

        });

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
    detail.scrollTo(0, 0);

    setKeyword(detail, acquireItem);

    // --------------------------------------------------
    // 特殊処理
    // --------------------------------------------------

    const targetSpecial = detail.querySelector(".dummyLink");

    if (targetSpecial) {
        targetSpecial.addEventListener("click", () => {
            showDialog("既にインストールされています。");
        })
    }
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
    detail.scrollTo(0, 0);

    setKeyword(detail, acquireItem);

}

// ====================================================================================================
// 詳細切り替えアニメーション
// ====================================================================================================

/**
 * CSSアニメーションを実行
 * @param {HTMLElement} panel 詳細パネル
 * @param {string} className アニメーションクラス
 * @param {Object} state アニメーション状態
 * @returns {Promise<boolean>}
 */
function playDetailAnimation(panel, className, state) {

    return new Promise(resolve => {

        const finish = (completed) => {

            panel.removeEventListener("animationend", onAnimationEnd);
            panel.classList.remove(className);

            if (state.animation === cancel) {
                state.animation = null;
            }

            resolve(completed);

        };

        const onAnimationEnd = (event) => {

            if (event.target !== panel) {
                return;
            }

            if (event.animationName === "") {
                return;
            }

            finish(true);

        };

        const cancel = () => {
            finish(false);
        };

        // アニメーション終了を監視
        panel.addEventListener("animationend", onAnimationEnd);

        // CSSクラスを付与
        state.animation = cancel;
        panel.classList.add(className);

    });

}

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
    // ----------------------------------------------
    // 詳細拡大表示関連
    // ----------------------------------------------

    // 拡大表示クラス
    const classExpanded = ".is-expanded";

    // 拡大表示中の詳細
    const isDetailExpand = document.querySelector(classExpanded);

    // TODO: ●スライドイン
    if (true) {
        // ●詳細エリア拡大中
        if (isDetailExpand) {
            // 縮小
            isDetailExpand.classList.remove(classExpanded);

            // TODO: アニメーション終了を待つ

        }
        // ●それ以外
        else {
            // TODO:　開く詳細を、最初から拡大表示にする

        }
    }

    // ----------------------------------------------
    // アニメーション準備
    // ----------------------------------------------

    // アニメーション番号を更新
    state.sequence++;

    const sequence = state.sequence;

    // 実行中のアニメーションを停止
    if (state.animation !== null) {
        state.animation();
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

        const exitClass = side === "right"
            ? "slide-out-right"
            : "slide-out-left";

        const completed = await playDetailAnimation(
            panel,
            exitClass,
            state
        );

        if (!completed || sequence !== state.sequence) {
            return;
        }

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

    const enterClass = side === "right"
        ? "slide-in-right"
        : "slide-in-left";

    const completed = await playDetailAnimation(
        panel,
        enterClass,
        state
    );

    if (!completed || sequence !== state.sequence) {
        return;
    }

}