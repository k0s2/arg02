// ====================================================================================================
// インポート
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
} from "../../template/dialog/controler.js";

// --------------------------------------------------
// リスト
// --------------------------------------------------

import {
    addEvidence as addEvidenceList,
    addPerson as addPersonList,
    markEvidenceRead,
    markPersonRead,
    updateEvidenceSelection,
    updatePersonSelection,
} from "./list.js";

// --------------------------------------------------
// データ
// --------------------------------------------------

// セーブ
import {
    isUnlocked,
    flagOn,
    isFlagOn,
} from "../../data/save.js";

// データ取得
import {
    getEvidence,
    getPerson,
    getItemCategory,
    acquireItem as unlockItem,
} from "./data.js";

// ====================================================================================================
// 要素取得
// ====================================================================================================

// --------------------------------------------------
// 【証拠】詳細
// --------------------------------------------------

// コンテナ
const evidencePanel = document.querySelector(".detail-evidence");

// タイトル
const evidenceTitle = document.querySelector(".detail-evidence h2");

// 説明文
const evidenceDetail = document.querySelector(".detail-evidence .text");

// --------------------------------------------------
// 【人物】詳細
// --------------------------------------------------

// コンテナ
const personPanel = document.querySelector(".detail-person");

// タイトル
const personTitle = document.querySelector(".detail-person h2");

// 説明文
const personDetail = document.querySelector(".detail-person .text");

// ====================================================================================================
// 詳細アニメーション
// ====================================================================================================

// 【証拠】
const evidenceDetailAnimation = {
    sequence: 0,
    animation: null,
};

// 【人物】
const personDetailAnimation = {
    sequence: 0,
    animation: null,
};

// ====================================================================================================
// 選択中のデータ
// ====================================================================================================

// 現在選択中の【証拠】ID
let selectedEvidenceId = null;

// 現在選択中の【人物】ID
let selectedPersonId = null;

/**
 * 選択中の【証拠】IDを取得
 * @returns {string|null} 【証拠】ID
 */
export function getSelectedEvidenceId() {
    return selectedEvidenceId;
}

/**
 * 選択中の【人物】IDを取得
 * @returns {string|null} 【人物】ID
 */
export function getSelectedPersonId() {
    return selectedPersonId;
}

// ====================================================================================================
// アイテム解放
// ====================================================================================================

/**
 * 指定したアイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @param {boolean|undefined} render 画面に反映するか
 * @returns {boolean} 新規解放されたか
 */
export function acquireItem(type, id, render = true) {
    // データを取得して解放
    const unlocked = unlockItem(type, id);

    // すでに解放済みの場合
    if (!unlocked) {
        return false;
    }

    // 画面に反映
    if (render) {

        if (type === "evidence") {
            addEvidence([getEvidence(id)]);
        }

        if (type === "person") {
            addPerson([getPerson(id)]);
        }

    }

    return true;
}

/**
 * 解放された【証拠】をリストに追加
 * @param {Object[]} items 追加する【証拠】データ
 * @returns {void}
 */
export function addEvidence(items) {
    addEvidenceList(
        items,
        selectedEvidenceId,
        selectEvidence
    );
}

/**
 * 解放された【人物】をリストに追加
 * @param {Object[]} items 追加する【人物】データ
 * @returns {void}
 */
export function addPerson(items) {
    addPersonList(
        items,
        selectedPersonId,
        selectPerson
    );
}

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
    // 初期化
    title.innerHTML = "";

    // 項目名
    const name = document.createTextNode(item.name);
    title.appendChild(name);

    // カテゴリー
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = getItemCategory(type, item.id);

    // 要素を追加
    title.appendChild(category);
}

/**
 * 【証拠】の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @returns {void}
 */
function renderEvidenceDetail(item, title, detail, acquireItem) {
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
    // 【ストーリー進行】
    // --------------------------------------------------

    const targetSpecial = detail.querySelector(".dummyLink");

    if (targetSpecial) {
        targetSpecial.addEventListener("click", () => {
            showDialog("既にインストールされています。");
        });
    }
}

/**
 * 【人物】の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @returns {void}
 */
function renderPersonDetail(item, title, detail, acquireItem) {
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

/**
 * 【証拠】の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderEvidenceDetailView(item) {
    // 【証拠】の詳細を表示
    renderEvidenceDetail(
        item,
        evidenceTitle,
        evidenceDetail,
        acquireItem
    );
}

/**
 * 【人物】の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderPersonDetailView(item) {
    // 【【人物】】の詳細を表示
    renderPersonDetail(
        item,
        personTitle,
        personDetail,
        acquireItem
    );
}

// ====================================================================================================
// 詳細切り替えアニメーション
// ====================================================================================================

// CSS：拡大表示
const classExpanded = "is-expanded";

// CSS:トランジションなし
const classNoTransition = "no-transition";

/**
 * CSSトランジションの終了を待機
 * @param {HTMLElement} element 対象要素
 * @returns {Promise<void>}
 */
async function waitDetailTransition(element) {
    // スタイルを反映
    getComputedStyle(element).top;

    // 実行中のトランジションを取得
    const transitions = element.getAnimations();

    // すべての終了を待機
    await Promise.all(
        transitions.map(animation =>
            animation.finished.catch(() => { })
        )
    );
}

/**
 * CSSアニメーションを実行
 * @param {HTMLElement} panel 詳細パネル
 * @param {string} className アニメーションクラス
 * @param {Object} state アニメーション状態
 * @returns {Promise<boolean>}
 */
function playDetailAnimation(panel, className, state) {
    return new Promise(resolve => {
        // 最終処理
        const finish = (completed) => {
            //
            panel.removeEventListener("animationend", onAnimationEnd);
            panel.classList.remove(className);

            // ●スライドアウト時
            if (className.includes("out")) {
                // 拡大表示を解除
                panel.classList.remove(classNoTransition);
                panel.classList.remove(classExpanded);
            }

            //
            if (state.animation === cancel) {
                state.animation = null;
            }

            // 解決
            resolve(completed);
        };

        // アニメーション終了
        const onAnimationEnd = (event) => {
            //
            if (event.target !== panel) {
                return;
            }

            //
            if (event.animationName === "") {
                return;
            }

            // 最終処理の呼び出し
            finish(true);
        };

        // キャンセル
        const cancel = () => {
            // 最終処理の呼び出し
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
async function transitionDetail(
    panel,
    title,
    detail,
    item,
    side,
    state,
    renderFunction
) {
    // ----------------------------------------------
    // 準備
    // ----------------------------------------------

    // 詳細が開かれていない
    const isDetailNothing = document.querySelectorAll(".empty").length >= 2;

    // 拡大表示中の詳細
    const isDetailExpand = document.querySelector("." + classExpanded);

    // 【推理】ボタンを取得
    const inferenceButton = document.querySelector(".inference button");

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
    // 詳細拡大表示関連
    // ----------------------------------------------

    // ●スライドイン
    if (item) {
        // ●片方の詳細を開く場合
        if (isDetailNothing) {
            // 開く詳細を、最初から拡大表示にする
            panel.classList.add(classNoTransition);
            panel.classList.add(classExpanded);
        }
        // ●別の詳細エリアが開かれている場合
        else if (
            isDetailExpand
            && isDetailExpand !== panel
        ) {
            // 拡大表示を解除
            isDetailExpand.classList.remove(classNoTransition);
            isDetailExpand.classList.remove(classExpanded);

            // アニメーションウェイト
            await waitDetailTransition(isDetailExpand);
        }
    }

    // ----------------------------------------------
    // 古い詳細をスライドアウト
    // ----------------------------------------------

    // ●詳細が表示されている
    if (hasContent) {
        // ●スライドアウト
        if (item === undefined) {
            // 【推理】ボタンの非活性化
            inferenceButton.disabled = true;
        }

        // クラス設定
        const exitClass =
            (side === "right")
                ? "slide-out-right"
                : "slide-out-left";

        //
        const completed = await playDetailAnimation(
            panel,
            exitClass,
            state
        );

        //
        if (!completed || sequence !== state.sequence) {
            return;
        }
    }

    // ----------------------------------------------
    // 残された詳細を拡大表示
    // ----------------------------------------------

    // ●
    if (
        item === undefined
        && hasContent
    ) {
        // 残された詳細を取得
        const otherPanel = panel.parentElement.querySelector(
            panel.classList.contains("detail-evidence")
                ? ".detail-person"
                : ".detail-evidence"
        );

        // ●残された詳細が存在する
        if (
            otherPanel
            && !otherPanel.classList.contains("empty")
            && !otherPanel.classList.contains(classExpanded)
        ) {
            // トランジションなしクラスを除去
            otherPanel.classList.remove(classNoTransition);

            // 拡大表示
            otherPanel.classList.add(classExpanded);
        }
    }

    // ----------------------------------------------
    // 新しい詳細を設定
    // ----------------------------------------------

    //
    renderFunction(item);

    // ●スライドアウト
    if (item === undefined) {
        // 非表示クラスを付与
        panel.classList.add("empty");

        return;
    }

    // 非表示クラスを除去
    panel.classList.remove("empty");

    // ----------------------------------------------
    // 【推理】ボタンを表示
    // ----------------------------------------------

    // ●既に別の詳細が表示されていた場合
    if (
        isDetailExpand
        && isDetailExpand !== panel
        && !isDetailNothing
    ) {
        // 活性化
        inferenceButton.disabled = false;
    }

    // ----------------------------------------------
    // 新しい詳細をスライドイン
    // ----------------------------------------------

    // クラスを設定
    const enterClass = side === "right"
        ? "slide-in-right"
        : "slide-in-left";

    //
    const completed = await playDetailAnimation(
        panel,
        enterClass,
        state
    );

    //
    if (!completed || sequence !== state.sequence) {
        return;
    }
}

// ====================================================================================================
// 選択処理
// ====================================================================================================

/**
 * 【証拠】を選択
 * @param {string} id 【証拠】ID
 * @returns {void}
 */
export function selectEvidence(id) {
    // ●アクティブ変更
    if (selectedEvidenceId !== id) {
        // アクティブ変更
        selectedEvidenceId = id;

        // 既読にする
        markEvidenceRead(id);

        // 【ストーリー進行】チュートリアル
        if (isFlagOn("tutorial-2") == false) {
            flagOn("tutorial-1");
            setTutorial(1);
        }
    }
    // ●アクティブ解除
    else {
        // アクティブ解除
        selectedEvidenceId = null;
    }

    //
    updateEvidenceSelection(selectedEvidenceId);

    //
    transitionDetail(
        evidencePanel,
        evidenceTitle,
        evidenceDetail,
        getEvidence(selectedEvidenceId),
        "left",
        evidenceDetailAnimation,
        renderEvidenceDetailView
    );
}

/**
 * 【人物】を選択
 * @param {string} id 【人物】ID
 * @returns {void}
 */
export function selectPerson(id) {
    // アクティブ変更
    if (selectedPersonId !== id) {
        // アクティブ変更
        selectedPersonId = id;

        // 既読にする
        markPersonRead(id);

        // 【ストーリー進行】チュートリアル
        if (isFlagOn("tutorial-2") == false) {
            flagOn("tutorial-1");
            setTutorial(1);
        }
    }
    // アクティブ解除
    else {
        // アクティブ解除
        selectedPersonId = null;
    }

    //
    updatePersonSelection(selectedPersonId);

    //
    transitionDetail(
        personPanel,
        personTitle,
        personDetail,
        getPerson(selectedPersonId),
        "right",
        personDetailAnimation,
        renderPersonDetailView
    );
}

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * 詳細を初期化
 * @returns {void}
 */
export function initializeDetails() {
    // ----------------------------------------------
    // 【証拠】
    // ----------------------------------------------

    renderEvidenceDetailView(getEvidence(selectedEvidenceId));

    if (selectedEvidenceId === null) {
        evidencePanel.classList.add("empty");
    }

    // ----------------------------------------------
    // 【人物】
    // ----------------------------------------------

    renderPersonDetailView(getPerson(selectedPersonId));

    if (selectedPersonId === null) {
        personPanel.classList.add("empty");
    }

    // ----------------------------------------------
    // 【ストーリー進行】チュートリアル
    // ----------------------------------------------

    if (isFlagOn("tutorial-1") == false) {
        setTutorial(0);
    }
    else if (isFlagOn("tutorial-2") == false) {
        setTutorial(1);
    }
    else if (isFlagOn("tutorial-3") == false) {
        setTutorial(2);
    }
    else if (isFlagOn("tutorial-4") == false) {
        setTutorial(3);
    }
}