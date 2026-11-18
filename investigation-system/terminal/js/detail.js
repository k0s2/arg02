// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// 共通コントローラー
// --------------------------------------------------

import {
    setTutorial,
} from "../../../common/js/common.js";

// --------------------------------------------------
// ダイアログ
// --------------------------------------------------

import {
    showDialog,
} from "../../../common/template/dialog/controller.js";

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

// データ取得
import {
    getEvidence,
    getPerson,
    getItemCategory,
    acquireItem as unlockItem,
    formatDateText,
} from "./data.js";

// セーブ
import {
    isUnlocked,
    flagOn,
    isFlagOn,
} from "../../../common/data/save.js";

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

// --------------------------------------------------
// 【推理】ボタン
// --------------------------------------------------

const inferenceButton = document.querySelector(".inference button");

// ====================================================================================================
// 詳細アニメーション
// ====================================================================================================

// 【証拠】
const evidenceDetailAnimation = {
    animation: null,
};

// 【人物】
const personDetailAnimation = {
    animation: null,
};

// 切り替え処理番号
let transitionSequence = 0;

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
// URLハッシュ
// ====================================================================================================

/**
 * 選択状態をURLハッシュに反映
 * @param {string} type データの種類
 * @param {string|null} id アイテムID
 * @returns {void}
 */
function updateSelectionHash(type, id) {

    const params = new URLSearchParams(
        location.hash.slice(1)
    );

    if (id === null) {
        params.delete(type);
    } else {
        params.set(type, id);
    }

    const hash = params.toString();

    history.replaceState(
        history.state,
        "",
        location.pathname
        + location.search
        + (hash ? "#" + hash : "")
    );

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

        // すべて取得済みなら取得済み表示
        const unlockItems = items.filter(item => item.ids.length > 0);
        const isComplete = () => unlockItems.every(item =>
            isUnlocked(item.type, item.ids)
        );

        // 取得済み
        if (isComplete()) {
            // クラスを付与
            target.classList.add("get");

            // ファイルの場合
            if (target.classList.contains("file")) {
                // クリックイベント
                target.addEventListener("click", () => {
                    // ダイアログ表示
                    showDialog("既にダウンロード済みのファイルです。");
                });
            }

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
    const name = document.createTextNode(formatDateText(item.name));
    title.appendChild(name);

    // カテゴリー
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = getItemCategory(type, item.id);

    // 要素を追加
    title.appendChild(category);

}

/**
 * HTMLファイルを取得
 * @param {Object} item 表示するデータ
 * @param {string} type データの種類
 * @returns {Promise<string>} HTML本文
 */
async function loadDetailHtml(item, type) {

    const path = `../../common/data/html/${type}/${item.id}.html`;

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`詳細HTMLの読み込みに失敗しました: ${path}`);
    }

    const html = await response.text();

    return formatDateText(html);

}

/**
 * 【証拠】の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @param {number} sequence 表示処理番号
 * @returns {Promise<void>}
 */
async function renderEvidenceDetail(
    item,
    title,
    detail,
    acquireItem,
    sequence
) {

    // 無効なアイテム
    if (item === undefined) {
        title.innerHTML = "";
        detail.innerHTML = "";
        return;
    }

    // タイトル
    renderDetailTitle(title, item, "evidence");

    // HTML取得
    const html = await loadDetailHtml(item, "evidence");

    // 別の項目に切り替わっていたら中止
    if (sequence !== transitionSequence) {
        return;
    }

    // 本文
    detail.innerHTML = html;

    // スクロールを戻す
    detail.scrollTo(0, 0);

    // キーワードを設定
    setKeyword(detail, acquireItem);

}

/**
 * 【人物】の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @param {HTMLElement} title タイトル要素
 * @param {HTMLElement} detail 詳細本文
 * @param {Function} acquireItem アイテム解放関数
 * @param {number} sequence 表示処理番号
 * @returns {Promise<void>}
 */
async function renderPersonDetail(
    item,
    title,
    detail,
    acquireItem,
    sequence
) {

    // 無効なアイテム
    if (item === undefined) {
        title.innerHTML = "";
        detail.innerHTML = "";
        return;
    }

    // タイトル
    renderDetailTitle(title, item, "person");

    // HTML取得
    const html = await loadDetailHtml(item, "person");

    // 別の項目に切り替わっていたら中止
    if (sequence !== transitionSequence) {
        return;
    }

    // 本文
    detail.innerHTML = html;

    // スクロールを戻す
    detail.scrollTo(0, 0);

    // キーワードを設定
    setKeyword(detail, acquireItem);

}

/**
 * 【証拠】の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @param {number} sequence 表示処理番号
 * @returns {Promise<void>}
 */
function renderEvidenceDetailView(item, sequence) {

    return renderEvidenceDetail(
        item,
        evidenceTitle,
        evidenceDetail,
        acquireItem,
        sequence
    );

}

/**
 * 【人物】の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @param {number} sequence 表示処理番号
 * @returns {Promise<void>}
 */
function renderPersonDetailView(item, sequence) {

    return renderPersonDetail(
        item,
        personTitle,
        personDetail,
        acquireItem,
        sequence
    );

}

// ====================================================================================================
// 詳細切り替えアニメーション
// ====================================================================================================

// CSS：拡大表示
const classExpanded = "is-expanded";

// CSS：トランジションなし
const classNoTransition = "no-transition";

// ====================================================================================================
// アニメーション制御
// ====================================================================================================

/**
 * 現在の切り替え処理か確認
 * @param {number} sequence 処理番号
 * @returns {boolean}
 */
function isCurrentTransition(sequence) {
    return sequence === transitionSequence;
}

/**
 * 実行中のアニメーションを停止
 * @param {Object} state アニメーション状態
 * @returns {void}
 */
function cancelDetailAnimation(state) {
    if (state.animation === null) {
        return;
    }

    state.animation();
    state.animation = null;
}

/**
 * すべての詳細アニメーションを停止
 * @returns {void}
 */
function cancelAllDetailAnimations() {
    cancelDetailAnimation(evidenceDetailAnimation);
    cancelDetailAnimation(personDetailAnimation);
}

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
 * @param {boolean} preserveExpanded 拡大表示を維持するか
 * @returns {Promise<boolean>}
 */
function playDetailAnimation(
    panel,
    className,
    state,
    preserveExpanded = false
) {
    return new Promise(resolve => {
        // 最終処理
        const finish = (completed) => {
            // イベント監視を解除
            panel.removeEventListener("animationend", onAnimationEnd);

            // スライドアウト完了時
            if (completed && className.includes("out")) {
                // 非表示状態にする
                panel.classList.add("empty");

                // 拡大表示を解除
                if (!preserveExpanded) {
                    panel.classList.remove(classNoTransition);
                    panel.classList.remove(classExpanded);
                }
            }

            // アニメーションクラスを解除
            panel.classList.remove(className);

            // アニメーション状態を初期化
            if (state.animation === cancel) {
                state.animation = null;
            }

            // 結果を返す
            resolve(completed);
        };

        // アニメーション終了
        const onAnimationEnd = (event) => {
            // 子要素のイベントは無視
            if (event.target !== panel) {
                return;
            }

            // アニメーション名がない場合は無視
            if (event.animationName === "") {
                return;
            }

            // 最終処理
            finish(true);
        };

        // キャンセル
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

// ====================================================================================================
// 詳細レイアウト
// ====================================================================================================

/**
 * 詳細が両方とも空か確認
 * @returns {boolean}
 */
function isDetailNothing() {
    return (
        evidencePanel.classList.contains("empty")
        && personPanel.classList.contains("empty")
    );
}

/**
 * 拡大表示中の詳細を取得
 * @returns {HTMLElement|null}
 */
function getExpandedDetail() {
    if (evidencePanel.classList.contains(classExpanded)) {
        return evidencePanel;
    }

    if (personPanel.classList.contains(classExpanded)) {
        return personPanel;
    }

    return null;
}

/**
 * 詳細を拡大表示
 * @param {HTMLElement} panel 対象パネル
 * @returns {void}
 */
function expandDetail(panel) {
    panel.classList.remove(classNoTransition);
    panel.classList.add(classExpanded);
}

/**
 * 詳細の拡大表示を解除
 * @param {HTMLElement} panel 対象パネル
 * @returns {void}
 */
function collapseDetail(panel) {
    panel.classList.remove(classNoTransition);
    panel.classList.remove(classExpanded);
}

/**
 * 詳細の拡大表示を準備
 * @param {HTMLElement} panel 対象要素
 * @param {number} sequence 処理番号
 * @returns {Promise<boolean>}
 */
async function prepareDetailLayout(panel, sequence) {
    // 両方とも空の場合
    if (isDetailNothing()) {
        // 最初から拡大表示にする
        panel.classList.add(classNoTransition);
        panel.classList.add(classExpanded);

        return true;
    }

    // 現在拡大表示中の詳細を取得
    const expandedPanel = getExpandedDetail();

    // 別の詳細が拡大表示中の場合
    if (
        expandedPanel
        && expandedPanel !== panel
    ) {
        // 拡大表示を解除
        collapseDetail(expandedPanel);

        // トランジション終了を待機
        await waitDetailTransition(expandedPanel);

        // 古い処理なら終了
        if (!isCurrentTransition(sequence)) {
            return false;
        }
    }

    return true;
}

/**
 * 閉じた詳細に合わせてレイアウトを更新
 * @param {HTMLElement} panel 閉じたパネル
 * @returns {void}
 */
function updateDetailLayout(panel) {
    // 残された詳細を取得
    const otherPanel = panel === evidencePanel
        ? personPanel
        : evidencePanel;

    // 残された詳細が存在する場合
    if (!otherPanel.classList.contains("empty")) {
        // 残された詳細を拡大表示
        expandDetail(otherPanel);
        return;
    }

    // 両方とも空の場合は拡大表示を解除
    collapseDetail(panel);
}

/**
 * 推理ボタンの状態を更新
 * @returns {void}
 */
function updateInferenceButton() {
    inferenceButton.disabled = (
        evidencePanel.classList.contains("empty")
        || personPanel.classList.contains("empty")
    );
}

/**
 * リロード時の詳細レイアウトを即時反映
 * @returns {void}
 */
function updateRestoredDetailLayout() {

    // トランジションを一時停止
    evidencePanel.classList.add(classNoTransition);
    personPanel.classList.add(classNoTransition);

    // 両方選択されている場合
    if (
        selectedEvidenceId !== null
        && selectedPersonId !== null
    ) {
        evidencePanel.classList.remove(classExpanded);
        personPanel.classList.remove(classExpanded);
    }
    // 証拠のみ選択されている場合
    else if (selectedEvidenceId !== null) {
        evidencePanel.classList.add(classExpanded);
        personPanel.classList.remove(classExpanded);
    }
    // 人物のみ選択されている場合
    else if (selectedPersonId !== null) {
        evidencePanel.classList.remove(classExpanded);
        personPanel.classList.add(classExpanded);
    }
    // どちらも選択されていない場合
    else {
        evidencePanel.classList.remove(classExpanded);
        personPanel.classList.remove(classExpanded);
    }

    // スタイルを即時反映
    getComputedStyle(evidencePanel).width;

    // トランジションを再有効化
    evidencePanel.classList.remove(classNoTransition);
    personPanel.classList.remove(classNoTransition);

}

// ====================================================================================================
// 詳細切り替え
// ====================================================================================================

/**
 * 詳細をスライドアウト
 * @param {HTMLElement} panel 対象パネル
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {number} sequence 処理番号
 * @param {boolean} preserveExpanded 拡大表示を維持するか
 * @returns {Promise<boolean>}
 */
async function slideOutDetail(
    panel,
    side,
    state,
    sequence,
    preserveExpanded
) {
    // クラス設定
    const className = side === "right"
        ? "slide-out-right"
        : "slide-out-left";

    // アニメーション実行
    const completed = await playDetailAnimation(
        panel,
        className,
        state,
        preserveExpanded
    );

    // 完了状態と処理番号を確認
    return completed && isCurrentTransition(sequence);
}

/**
 * 詳細をスライドイン
 * @param {HTMLElement} panel 対象パネル
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {number} sequence 処理番号
 * @returns {Promise<boolean>}
 */
async function slideInDetail(panel, side, state, sequence) {
    // クラス設定
    const className = side === "right"
        ? "slide-in-right"
        : "slide-in-left";

    // アニメーション実行
    const completed = await playDetailAnimation(
        panel,
        className,
        state
    );

    // 完了状態と処理番号を確認
    return completed && isCurrentTransition(sequence);
}

/**
 * 詳細を描画して表示状態を更新
 * @param {HTMLElement} panel 詳細パネル
 * @param {Object|undefined} item 表示するデータ
 * @param {Function} renderFunction 描画関数
 * @param {number} sequence 処理番号
 * @returns {Promise<void>}
 */
async function updateDetailContent(
    panel,
    item,
    renderFunction,
    sequence
) {

    // 詳細を描画
    await renderFunction(item, sequence);

    // 古い処理なら終了
    if (sequence !== transitionSequence) {
        return;
    }

    // 表示状態を更新
    if (item === undefined) {
        panel.classList.add("empty");
    } else {
        panel.classList.remove("empty");
    }

    // 推理ボタンを更新
    updateInferenceButton();

}

/**
 * 詳細切り替え処理
 * @param {HTMLElement} panel 詳細パネル
 * @param {Object|undefined} item 表示するデータ
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {Function} renderFunction 描画関数
 * @param {number} sequence 処理番号
 * @returns {Promise<void>}
 */
async function runDetailTransition(
    panel,
    item,
    side,
    state,
    renderFunction,
    sequence
) {
    // 現在の表示内容を確認
    const hasContent = !panel.classList.contains("empty");

    // 現在の拡大状態を確認
    const preserveExpanded = (
        item !== undefined
        && panel.classList.contains(classExpanded)
    );

    // ----------------------------------------------
    // 詳細拡大表示の準備
    // ----------------------------------------------

    // 新しい詳細を開く場合
    if (item !== undefined) {
        const prepared = await prepareDetailLayout(
            panel,
            sequence
        );

        // 古い処理なら終了
        if (!prepared || !isCurrentTransition(sequence)) {
            return;
        }
    }

    // ----------------------------------------------
    // 古い詳細をスライドアウト
    // ----------------------------------------------

    if (hasContent) {
        // スライドアウト
        const completed = await slideOutDetail(
            panel,
            side,
            state,
            sequence,
            preserveExpanded
        );

        // 古い処理なら終了
        if (!completed) {
            return;
        }
    }

    // ----------------------------------------------
    // 詳細内容を更新
    // ----------------------------------------------

    await updateDetailContent(
        panel,
        item,
        renderFunction,
        sequence
    );

    // 古い処理なら終了
    if (!isCurrentTransition(sequence)) {
        return;
    }

    // ----------------------------------------------
    // 詳細を閉じる
    // ----------------------------------------------

    if (item === undefined) {
        updateDetailLayout(panel);
        updateInferenceButton();

        return;
    }

    // ----------------------------------------------
    // 新しい詳細をスライドイン
    // ----------------------------------------------

    await slideInDetail(
        panel,
        side,
        state,
        sequence
    );
}

/**
 * 詳細切り替えを開始
 * @param {HTMLElement} panel 詳細パネル
 * @param {Object|undefined} item 表示するデータ
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {Function} renderFunction 描画関数
 * @returns {Promise<void>}
 */
function transitionDetail(
    panel,
    item,
    side,
    state,
    renderFunction
) {
    // 切り替え処理番号を更新
    transitionSequence++;

    const sequence = transitionSequence;

    // 実行中のアニメーションを停止
    cancelAllDetailAnimations();

    // 切り替え処理を実行
    return runDetailTransition(
        panel,
        item,
        side,
        state,
        renderFunction,
        sequence
    );
}

// ====================================================================================================
// 選択処理
// ====================================================================================================

/**
 * 【証拠】を選択
 * @param {string} id 【証拠】ID
 * @param {boolean} restoring リロード時の復元か
 * @returns {Promise<void>}
 */
export function selectEvidence(id, restoring = false) {

    // リロード時の復元
    if (restoring) {
        selectedEvidenceId = id;

        // リストの選択状態を更新
        updateEvidenceSelection(selectedEvidenceId);

        // 実行中のアニメーションを停止
        transitionSequence++;
        const sequence = transitionSequence;
        cancelAllDetailAnimations();

        // アニメーションなしで詳細を描画
        return renderEvidenceDetailView(
            getEvidence(selectedEvidenceId),
            sequence
        ).then(() => {

            if (!isCurrentTransition(sequence)) {
                return;
            }

            evidencePanel.classList.remove("empty");

            // 両パネルの最終レイアウトを即時反映
            updateRestoredDetailLayout();
            updateInferenceButton();

        });
    }

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

    // リストの選択状態を更新
    updateEvidenceSelection(selectedEvidenceId);

    // URLハッシュを更新
    updateSelectionHash("evidence", selectedEvidenceId);

    // 詳細を切り替え
    return transitionDetail(
        evidencePanel,
        getEvidence(selectedEvidenceId),
        "left",
        evidenceDetailAnimation,
        renderEvidenceDetailView
    );
}

/**
 * 【人物】を選択
 * @param {string} id 【人物】ID
 * @param {boolean} restoring リロード時の復元か
 * @returns {Promise<void>}
 */
export function selectPerson(id, restoring = false) {

    // リロード時の復元
    if (restoring) {
        selectedPersonId = id;

        // リストの選択状態を更新
        updatePersonSelection(selectedPersonId);

        // 実行中のアニメーションを停止
        transitionSequence++;
        const sequence = transitionSequence;
        cancelAllDetailAnimations();

        // アニメーションなしで詳細を描画
        return renderPersonDetailView(
            getPerson(selectedPersonId),
            sequence
        ).then(() => {

            if (!isCurrentTransition(sequence)) {
                return;
            }

            personPanel.classList.remove("empty");

            // 両パネルの最終レイアウトを即時反映
            updateRestoredDetailLayout();
            updateInferenceButton();

        });
    }

    // ●アクティブ変更
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
    // ●アクティブ解除
    else {
        // アクティブ解除
        selectedPersonId = null;
    }

    // リストの選択状態を更新
    updatePersonSelection(selectedPersonId);

    // URLハッシュを更新
    updateSelectionHash("person", selectedPersonId);

    // 詳細を切り替え
    return transitionDetail(
        personPanel,
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
 * @param {string|null} evidenceId 選択する【証拠】ID
 * @param {string|null} personId 選択する【人物】ID
 * @returns {Promise<void>}
 */
export async function initializeDetails(
    evidenceId = null,
    personId = null
) {

    // 選択中のIDを設定
    selectedEvidenceId = evidenceId;
    selectedPersonId = personId;

    // 初期化中はトランジションを無効化
    evidencePanel.classList.add(classNoTransition);
    personPanel.classList.add(classNoTransition);
    inferenceButton.classList.add(classNoTransition);

    // リストの選択状態を更新
    updateEvidenceSelection(selectedEvidenceId);
    updatePersonSelection(selectedPersonId);

    // 既読にする
    if (selectedEvidenceId !== null) {
        markEvidenceRead(selectedEvidenceId);
    }

    if (selectedPersonId !== null) {
        markPersonRead(selectedPersonId);
    }

    // 【証拠】を描画
    await renderEvidenceDetailView(
        getEvidence(selectedEvidenceId),
        transitionSequence
    );

    // 【人物】を描画
    await renderPersonDetailView(
        getPerson(selectedPersonId),
        transitionSequence
    );

    // パネルの表示状態を設定
    evidencePanel.classList.toggle(
        "empty",
        selectedEvidenceId === null
    );

    personPanel.classList.toggle(
        "empty",
        selectedPersonId === null
    );

    // 拡大状態を初期化
    evidencePanel.classList.remove(classExpanded);
    personPanel.classList.remove(classExpanded);

    // 片方だけ選択されている場合は拡大表示
    if (selectedEvidenceId !== null && selectedPersonId === null) {
        evidencePanel.classList.add(classExpanded);
    }

    if (selectedPersonId !== null && selectedEvidenceId === null) {
        personPanel.classList.add(classExpanded);
    }

    // 推理ボタンの状態を更新
    updateInferenceButton();

    // レイアウトを確定
    getComputedStyle(evidencePanel).top;
    getComputedStyle(personPanel).top;
    getComputedStyle(inferenceButton).opacity;

    // トランジションを再度有効化
    evidencePanel.classList.remove(classNoTransition);
    personPanel.classList.remove(classNoTransition);
    inferenceButton.classList.remove(classNoTransition);

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