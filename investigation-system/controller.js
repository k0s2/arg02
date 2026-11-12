// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// データ読み込み
// --------------------------------------------------

// 証拠データ
import evidenceData from "../data/evidence.js";

// 人物データ
import personData from "../data/person.js";

// 推理データ
import inferenceData from "../data/inference.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    getUnlockedIds,
    getUnreadIds,
    unlockItem,
    markRead,
} from "./save.js";

// ====================================================================================================
// ファンクション
// ====================================================================================================

// --------------------------------------------------
// 要素取得
// --------------------------------------------------

// 証拠リスト
const evidenceList = document.querySelector(".pannel-left .itemList ul");

// 人物リスト
const personList = document.querySelector(".pannel-right .itemList ul");

// 証拠詳細
const evidencePanel = document.querySelector(".detail-evidence");
const evidenceTitle = document.querySelector(".detail-evidence h2");
const evidenceDetail = document.querySelector(".detail-evidence .text");

// 人物詳細
const personPanel = document.querySelector(".detail-person");
const personTitle = document.querySelector(".detail-person h2");
const personDetail = document.querySelector(".detail-person .text");

// 推理ボタン
const inferenceButton = document.querySelector(".inference button");

// --------------------------------------------------
// 詳細アニメーション
// --------------------------------------------------

// 証拠
const evidenceDetailAnimation = {
    sequence: 0,
    animation: null,
};

// 人物
const personDetailAnimation = {
    sequence: 0,
    animation: null,
};

// --------------------------------------------------
// 選択中のデータ
// --------------------------------------------------

// 現在選択中の証拠ID
let selectedEvidenceId = null;

// 現在選択中の人物ID
let selectedPersonId = null;

// --------------------------------------------------
// データ取得
// --------------------------------------------------

/**
 * 証拠データを取得
 * @param {number} id 証拠ID
 * @returns {Object|undefined} 該当する証拠データ
 */
function getEvidence(id) {

    return evidenceData.find((item) => {
        return item.id === id;
    });

}

/**
 * 人物データを取得
 * @param {string} id 人物ID
 * @returns {Object|undefined} 該当する人物データ
 */
function getPerson(id) {

    return personData.find((item) => {
        return item.id === id;
    });

}

/**
 * 種類とIDからデータを取得
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {Object|undefined} 該当するデータ
 */
function getItemData(type, id) {

    if (type === "evidence") {
        return getEvidence(id);
    }

    if (type === "person") {
        return getPerson(id);
    }

    if (type === "keyword") {
        return getKeyword(id);
    }

    return undefined;

}

// --------------------------------------------------
// 表示対象の取得
// --------------------------------------------------

/**
 * 解放済みの証拠を取得
 * @returns {Object[]} 解放済みの証拠データ
 */
function getUnlockedEvidence() {

    const ids = getUnlockedIds("evidence");

    return evidenceData.filter((item) => {
        return ids.includes(item.id);
    });

}

/**
 * 解放済みの人物を取得
 * @returns {Object[]} 解放済みの人物データ
 */
function getUnlockedPerson() {

    const ids = getUnlockedIds("person");

    return personData.filter((item) => {
        return ids.includes(item.id);
    });

}

// --------------------------------------------------
// リスト項目生成
// --------------------------------------------------

/**
 * リスト項目の要素を生成
 * @param {Object} item 表示するデータ
 * @param {number|string|null} selectedId 選択中のID
 * @param {string} type データの種類
 * @param {function(number|string): void} selectFunction 選択時に呼び出す関数
 * @returns {HTMLLIElement} 生成したリスト項目
 */
function createListItem(item, selectedId, type, selectFunction) {

    // リスト項目
    const li = document.createElement("li");

    // ID
    li.dataset.id = String(item.id);

    // 未読
    const unreadIds = getUnreadIds(type);

    if (unreadIds.includes(item.id)) {
        li.classList.add("new");
    }

    // ボタン
    const button = document.createElement("button");

    // 名称
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;

    // 簡易詳細
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = item.note;

    // ボタンに内容を追加
    button.appendChild(name);
    button.appendChild(note);

    // 選択中
    if (item.id === selectedId) {
        button.classList.add("active");
    }

    // クリックイベント
    button.addEventListener("click", () => {
        selectFunction(item.id);
    });

    // リストに要素を追加
    li.appendChild(button);

    return li;

}

// --------------------------------------------------
// 空リスト表示
// --------------------------------------------------

/**
 * 空リスト項目を生成
 * @returns {HTMLLIElement} 生成したリスト項目
 */
function createEmptyListItem() {

    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "NO DATA";

    return li;

}

// --------------------------------------------------
// リスト項目追加アニメーション
// --------------------------------------------------

/**
 * リスト項目をアニメーション付きで追加
 * @param {HTMLElement} list 追加先のリスト
 * @param {HTMLLIElement} li 追加するリスト項目
 * @returns {void}
 */
function appendListItem(list, li) {

    // 空表示を削除
    const emptyItem = list.querySelector("li.empty");

    if (emptyItem !== null) {
        emptyItem.remove();
    }

    // 初期状態
    li.classList.add("slide-in");

    // リストに追加
    list.appendChild(li);

    // アニメーション開始
    requestAnimationFrame(() => {
        li.classList.remove("slide-in");
    });

}

// --------------------------------------------------
// 証拠リスト描画
// --------------------------------------------------

/**
 * 解放済みの証拠リストを描画
 * @returns {void}
 */
function renderEvidenceList() {

    evidenceList.innerHTML = "";

    const items = getUnlockedEvidence();

    if (items.length === 0) {
        evidenceList.appendChild(createEmptyListItem());
        return;
    }

    items.forEach((item) => {

        const li = createListItem(
            item,
            selectedEvidenceId,
            "evidence",
            selectEvidence
        );

        evidenceList.appendChild(li);

    });

}

// --------------------------------------------------
// 人物リスト描画
// --------------------------------------------------

/**
 * 解放済みの人物リストを描画
 * @returns {void}
 */
function renderPersonList() {

    personList.innerHTML = "";

    const items = getUnlockedPerson();

    if (items.length === 0) {
        personList.appendChild(createEmptyListItem());
        return;
    }

    items.forEach((item) => {

        const li = createListItem(
            item,
            selectedPersonId,
            "person",
            selectPerson
        );

        personList.appendChild(li);

    });

}

// --------------------------------------------------
// リストへの新規項目追加
// --------------------------------------------------

/**
 * 解放された証拠をリストに追加
 * @param {Object} item 追加する証拠データ
 * @returns {void}
 */
function addEvidence(item) {

    const li = createListItem(
        item,
        selectedEvidenceId,
        "evidence",
        selectEvidence
    );

    appendListItem(evidenceList, li);

}

/**
 * 解放された人物をリストに追加
 * @param {Object} item 追加する人物データ
 * @returns {void}
 */
function addPerson(item) {

    const li = createListItem(
        item,
        selectedPersonId,
        "person",
        selectPerson
    );

    appendListItem(personList, li);

}

// --------------------------------------------------
// 既読処理
// --------------------------------------------------

/**
 * 証拠を既読にする
 * @param {number} id 証拠ID
 * @returns {void}
 */
function markEvidenceRead(id) {

    markRead("evidence", id);

    const li = evidenceList.querySelector(
        'li[data-id="' + id + '"]'
    );

    if (li !== null) {
        li.classList.remove("new");
    }

}

/**
 * 人物を既読にする
 * @param {string} id 人物ID
 * @returns {void}
 */
function markPersonRead(id) {

    markRead("person", id);

    const li = personList.querySelector(
        'li[data-id="' + id + '"]'
    );

    if (li !== null) {
        li.classList.remove("new");
    }

}

// --------------------------------------------------
// 選択状態の更新
// --------------------------------------------------

/**
 * リストの選択状態を更新
 * @param {HTMLElement} list 対象リスト
 * @param {number|string|null} selectedId 選択中のID
 * @returns {void}
 */
function updateListSelection(list, selectedId) {

    const buttons = list.querySelectorAll("button");

    buttons.forEach((button) => {

        const id = button.parentElement.dataset.id;

        if (id === String(selectedId)) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

    });

}

/**
 * 証拠リストの選択状態を更新
 * @returns {void}
 */
function updateEvidenceSelection() {

    updateListSelection(evidenceList, selectedEvidenceId);

}

/**
 * 人物リストの選択状態を更新
 * @returns {void}
 */
function updatePersonSelection() {

    updateListSelection(personList, selectedPersonId);

}

// --------------------------------------------------
// 詳細表示
// --------------------------------------------------

/**
 * 証拠の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderEvidenceDetail(item) {

    if (item === undefined) {
        evidenceTitle.textContent = "";
        evidenceDetail.innerHTML = "";
        return;
    }

    evidenceTitle.textContent = item.name;
    evidenceDetail.innerHTML = item.detail.join("<br>");

}

/**
 * 人物の詳細を表示
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderPersonDetail(item) {

    if (item === undefined) {
        personTitle.textContent = "";
        personDetail.innerHTML = "";
        return;
    }

    personTitle.textContent = item.name;
    personDetail.innerHTML = item.detail.join("<br>");

}

// --------------------------------------------------
// 詳細切り替えアニメーション
// --------------------------------------------------

/**
 * 詳細をアニメーション付きで切り替え
 * @param {HTMLElement} panel 詳細パネル
 * @param {HTMLElement} title タイトル
 * @param {HTMLElement} detail 詳細本文
 * @param {Object|undefined} item 表示するデータ
 * @param {string} side リストの位置
 * @param {Object} state アニメーション状態
 * @param {function(Object|undefined): void} renderFunction 描画関数
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

// --------------------------------------------------
// 選択処理
// --------------------------------------------------

/**
 * 証拠を選択
 * @param {number} id 証拠ID
 * @returns {void}
 */
function selectEvidence(id) {

    // アクティブ変更
    if (selectedEvidenceId !== id) {

        selectedEvidenceId = id;

        // 既読にする
        markEvidenceRead(id);

        // 推理ボタンを切り替え
        inferenceButton.disabled = !(selectedPersonId !== null);

    }
    // アクティブ解除
    else {

        selectedEvidenceId = null;

        inferenceButton.disabled = true;

    }

    updateEvidenceSelection();

    transitionDetail(
        evidencePanel,
        evidenceTitle,
        evidenceDetail,
        getEvidence(selectedEvidenceId),
        "left",
        evidenceDetailAnimation,
        renderEvidenceDetail
    );

}

/**
 * 人物を選択
 * @param {string} id 人物ID
 * @returns {void}
 */
function selectPerson(id) {

    // アクティブ変更
    if (selectedPersonId !== id) {

        selectedPersonId = id;

        // 既読にする
        markPersonRead(id);

        // 推理ボタンを切り替え
        inferenceButton.disabled = !(selectedEvidenceId !== null);

    }
    // アクティブ解除
    else {

        selectedPersonId = null;

        inferenceButton.disabled = true;

    }

    updatePersonSelection();

    transitionDetail(
        personPanel,
        personTitle,
        personDetail,
        getPerson(selectedPersonId),
        "right",
        personDetailAnimation,
        renderPersonDetail
    );

}

// --------------------------------------------------
// アイテム解放
// --------------------------------------------------

/**
 * 指定したアイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 新規解放されたか
 */
function acquireItem(type, id) {

    // データを取得
    const item = getItemData(type, id);

    // データが存在しない場合
    if (item === undefined) {
        return false;
    }

    // セーブデータに解放状態を登録
    const unlocked = unlockItem(type, id);

    // すでに解放済みの場合
    if (!unlocked) {
        return false;
    }

    // 画面に反映
    if (type === "evidence") {
        addEvidence(item);
    }

    if (type === "person") {
        addPerson(item);
    }

    return true;

}

// --------------------------------------------------
// 推理処理
// --------------------------------------------------

/**
 * 選択中の証拠と人物から新しい情報を解放
 * @returns {void}
 */
function executeInference() {

    // どちらかが未選択なら処理しない
    if (selectedEvidenceId === null) {
        return;
    }

    if (selectedPersonId === null) {
        return;
    }

    // ----------------------------------------------
    // 推理条件の照合
    // ----------------------------------------------

    const results = inferenceData.filter((rule) => {

        if (rule.evidenceId !== selectedEvidenceId) {
            return false;
        }

        if (rule.personId !== selectedPersonId) {
            return false;
        }

        return true;

    });

    // ----------------------------------------------
    // 解放処理
    // ----------------------------------------------

    results.forEach((rule) => {

        if (!Array.isArray(rule.newInfo)) {
            return;
        }

        rule.newInfo.forEach((info) => {

            acquireItem(info.type, info.id);

        });

    });

}

// ====================================================================================================
// イベント設定
// ====================================================================================================

// --------------------------------------------------
// 推理ボタン
// --------------------------------------------------

inferenceButton.addEventListener("click", () => {

    executeInference();

});

// ====================================================================================================
// 初期化
// ====================================================================================================

// --------------------------------------------------
// リスト
// --------------------------------------------------

// 証拠
renderEvidenceList();

// 人物
renderPersonList();

// --------------------------------------------------
// 詳細
// --------------------------------------------------

// 証拠
renderEvidenceDetail(getEvidence(selectedEvidenceId));

if (selectedEvidenceId === null) {
    evidencePanel.classList.add("empty");
}

// 人物
renderPersonDetail(getPerson(selectedPersonId));

if (selectedPersonId === null) {
    personPanel.classList.add("empty");
}