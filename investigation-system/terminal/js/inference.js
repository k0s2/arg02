// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// 共通コントローラー
// --------------------------------------------------

import {
    setTutorial,
    hideTutorial,
} from "../../../common/js/common.js";

// --------------------------------------------------
// ダイアログ
// --------------------------------------------------

import {
    showDialog,
} from "../../../common/template/dialog/controller.js";

// --------------------------------------------------
// データ
// --------------------------------------------------

// データ取得
import {
    getItemData,
    formatDateText,
} from "./data.js";

// 【推理】データ
import inferenceData from "../../../common/data/inference.js";

// セーブ
import {
    completeInference,
    isAddInfoUnlocked,
    flagOn,
    isFlagOn,
} from "../../../common/data/save.js";

// 詳細
import {
    updateAdditionalInfo,
} from "./detail.js";

// ====================================================================================================
// 【推理】処理
// ====================================================================================================

/**
 * 選択中の【証拠】と【人物】から新しい情報を解放
 * @param {string|null} selectedEvidenceId 選択中の【証拠】ID
 * @param {string|null} selectedPersonId 選択中の【人物】ID
 * @param {Function} acquireItem アイテム解放関数
 * @param {Function} addEvidence 【証拠】追加関数
 * @param {Function} addPerson 【人物】追加関数
 * @returns {Promise<void>}
 */
export async function executeInference(
    selectedEvidenceId,
    selectedPersonId,
    acquireItem,
    addEvidence,
    addPerson
) {

    // --------------------------------------------------
    // どちらかが未選択なら処理しない
    // --------------------------------------------------

    // 【証拠】
    if (selectedEvidenceId === null) {
        return;
    }

    // 【人物】
    if (selectedPersonId === null) {
        return;
    }

    // ----------------------------------------------
    // 【推理】条件の照合
    // ----------------------------------------------

    const results = inferenceData.filter((rule) => {

        // 【証拠】の不一致
        if (rule.evidenceId !== selectedEvidenceId) {
            return false;
        }

        // 【人物】の不一致
        if (rule.personId !== selectedPersonId) {
            return false;
        }

        // 条件の一致
        return true;

    });

    // ----------------------------------------------
    // 不一致
    // ----------------------------------------------

    if (results.length === 0) {

        // 【証拠】名
        const nameEvidence = formatDateText(
            getItemData("evidence", selectedEvidenceId).name
        );

        // 【人物】名
        const namePerson = formatDateText(
            getItemData("person", selectedPersonId).name
        );

        // ダイアログ表示
        const res = await showDialog(
            "「" + nameEvidence + "」と「" + namePerson + "」の組み合わせから、得られる情報は無さそうだ。",
            "メモ"
        );

        // 「閉じる」押下後
        if (res == 0) {

            // 【ストーリー進行】チュートリアル
            if (isFlagOn("tutorial-3") == false) {
                flagOn("tutorial-2");
                setTutorial(2);
            }

        }

        return;
    }

    // ----------------------------------------------
    // 推理済みか確認
    // ----------------------------------------------

    if (
        isAddInfoUnlocked(
            "evidence",
            selectedEvidenceId,
            selectedPersonId
        )
    ) {

        // ダイアログ表示
        await showDialog(
            "この組み合わせから得られる情報は、もう無さそうだ。",
            "メモ"
        );

        return;
    }

    // ----------------------------------------------
    // 追記情報を解放
    // ----------------------------------------------

    completeInference(
        selectedEvidenceId,
        selectedPersonId
    );

    // 詳細画面に反映
    updateAdditionalInfo(
        selectedEvidenceId,
        selectedPersonId
    );

    // ----------------------------------------------
    // アイテム解放
    // ----------------------------------------------

    const newEvidence = [];
    const newPersons = [];

    // 条件ごとに処理
    for (const rule of results) {

        // 新しい情報がある場合
        if (Array.isArray(rule.newInfo)) {

            for (const info of rule.newInfo) {

                const item = getItemData(info.type, info.id);

                // アイテムを解放
                const unlocked = acquireItem(
                    info.type,
                    info.id,
                    false
                );

                // 新規解放された場合
                if (unlocked) {

                    // 【証拠】
                    if (info.type === "evidence") {
                        newEvidence.push(item);
                    }

                    // 【人物】
                    if (info.type === "person") {
                        newPersons.push(item);
                    }

                }

            }

        }

        // ------------------------------------------
        // ダイアログ表示
        // ------------------------------------------

        if (Array.isArray(rule.dialog)) {

            const res = await showDialog(
                rule.dialog.map(formatDateText),
                "メモ"
            );

            // 【ストーリー進行】チュートリアル
            if (res == 0) {

                if (isFlagOn("tutorial-5") == false) {
                    flagOn("tutorial-1");
                    flagOn("tutorial-2");
                    flagOn("tutorial-3");
                    flagOn("tutorial-4");
                    flagOn("tutorial-5");
                    hideTutorial();
                }

            }

        }

    }

    // ----------------------------------------------
    // リスト描画
    // ----------------------------------------------

    if (newEvidence.length > 0) {
        addEvidence(newEvidence);
    }

    if (newPersons.length > 0) {
        addPerson(newPersons);
    }

}

// ====================================================================================================
// イベント設定
// ====================================================================================================

/**
 * 【推理】ボタンを初期化
 * @param {Function} getSelectedEvidenceId 選択中の【証拠】ID取得関数
 * @param {Function} getSelectedPersonId 選択中の【人物】ID取得関数
 * @param {Function} acquireItem アイテム解放関数
 * @param {Function} addEvidence 【証拠】追加関数
 * @param {Function} addPerson 【人物】追加関数
 * @returns {void}
 */
export function initializeInference(
    getSelectedEvidenceId,
    getSelectedPersonId,
    acquireItem,
    addEvidence,
    addPerson
) {

    // 【推理】ボタン
    const inferenceButton = document.querySelector(".inference button");

    inferenceButton.addEventListener("click", () => {

        executeInference(
            getSelectedEvidenceId(),
            getSelectedPersonId(),
            acquireItem,
            addEvidence,
            addPerson
        );

    });

}