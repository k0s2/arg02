// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// データ読み込み
// --------------------------------------------------

// 証拠データ
import evidenceData from "../../data/evidence.js";

// 人物データ
import personData from "../../data/person.js";

// データ取得
import {
    getEvidence,
    getPerson,
    getItemData,
} from "./data.js";

// --------------------------------------------------
// リスト
// --------------------------------------------------

import {
    renderEvidenceList,
    renderPersonList,
    addEvidence as addEvidenceList,
    addPerson as addPersonList,
    markEvidenceRead,
    markPersonRead,
    updateEvidenceSelection,
    updatePersonSelection,
} from "./list.js";

// --------------------------------------------------
// 詳細表示
// --------------------------------------------------

import {
    renderEvidenceDetail,
    renderPersonDetail,
    transitionDetail,
} from "./detail.js";

// --------------------------------------------------
// 推理処理
// --------------------------------------------------

import {
    executeInference,
} from "./inference.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    unlockItem,
} from "./save.js";

// ====================================================================================================
// 要素取得
// ====================================================================================================

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

// ====================================================================================================
// 詳細アニメーション
// ====================================================================================================

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

// ====================================================================================================
// 選択中のデータ
// ====================================================================================================

// 現在選択中の証拠ID
let selectedEvidenceId = null;

// 現在選択中の人物ID
let selectedPersonId = null;

// ====================================================================================================
// リスト描画
// ====================================================================================================

/**
 * 解放済みの証拠リストを描画
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる証拠ID
 * @returns {void}
 */
function renderEvidenceListView(openGroupIds, animatedIds) {

    renderEvidenceList(
        evidenceData,
        selectedEvidenceId,
        selectEvidence,
        openGroupIds,
        animatedIds
    );

}

/**
 * 解放済みの人物リストを描画
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる人物ID
 * @returns {void}
 */
function renderPersonListView(openGroupIds, animatedIds) {

    renderPersonList(
        personData,
        selectedPersonId,
        selectPerson,
        openGroupIds,
        animatedIds
    );

}

// ====================================================================================================
// リストへの新規項目追加
// ====================================================================================================

/**
 * 解放された証拠をリストに追加
 * @param {Object[]} items 追加する証拠データ
 * @returns {void}
 */
function addEvidence(items) {

    addEvidenceList(
        evidenceData,
        items,
        selectedEvidenceId,
        selectEvidence
    );

}

/**
 * 解放された人物をリストに追加
 * @param {Object[]} items 追加する人物データ
 * @returns {void}
 */
function addPerson(items) {

    addPersonList(
        personData,
        items,
        selectedPersonId,
        selectPerson
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
function acquireItem(type, id, render) {

    if (render === undefined) {
        render = true;
    }

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
    if (render) {

        if (type === "evidence") {
            addEvidence([item]);
        }

        if (type === "person") {
            addPerson([item]);
        }

    }

    return true;

}

// ====================================================================================================
// 詳細表示
// ====================================================================================================

/**
 * 証拠の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderEvidenceDetailView(item) {

    renderEvidenceDetail(
        item,
        evidenceTitle,
        evidenceDetail,
        acquireItem
    );

}

/**
 * 人物の詳細を描画
 * @param {Object|undefined} item 表示するデータ
 * @returns {void}
 */
function renderPersonDetailView(item) {

    renderPersonDetail(
        item,
        personTitle,
        personDetail,
        acquireItem
    );

}

// ====================================================================================================
// 選択処理
// ====================================================================================================

/**
 * 証拠を選択
 * @param {string} id 証拠ID
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

    updateEvidenceSelection(selectedEvidenceId);

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

    updatePersonSelection(selectedPersonId);

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
// 推理処理
// ====================================================================================================

/**
 * 選択中の証拠と人物から新しい情報を解放
 * @returns {void}
 */
function runInference() {

    executeInference(
        selectedEvidenceId,
        selectedPersonId,
        acquireItem,
        addEvidence,
        addPerson
    );

}

// ====================================================================================================
// イベント設定
// ====================================================================================================

// --------------------------------------------------
// 推理ボタン
// --------------------------------------------------

inferenceButton.addEventListener("click", () => {

    runInference();

});

// ====================================================================================================
// 初期化
// ====================================================================================================

// --------------------------------------------------
// リスト
// --------------------------------------------------

// 証拠
renderEvidenceListView();

// 人物
renderPersonListView();

// --------------------------------------------------
// 詳細
// --------------------------------------------------

// 証拠
renderEvidenceDetailView(getEvidence(selectedEvidenceId));

if (selectedEvidenceId === null) {
    evidencePanel.classList.add("empty");
}

// 人物
renderPersonDetailView(getPerson(selectedPersonId));

if (selectedPersonId === null) {
    personPanel.classList.add("empty");
}