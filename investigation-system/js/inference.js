// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// 共通
// --------------------------------------------------

import {
    setTutorial,
    hideTutorial,
} from "../../js/common.js";

// --------------------------------------------------
// ダイアログ
// --------------------------------------------------

import {
    showDialog,
    showThinkDialog
} from "../../template/dialog/controler.js"

// --------------------------------------------------
// データ
// --------------------------------------------------

// 推理データ
import inferenceData from "../../data/inference.js";

// データ取得
import {
    getItemData,
} from "./data.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    flagOn,
    isFlagOn,
} from "../../data/save.js";

// ====================================================================================================
// 推理処理
// ====================================================================================================

/**
 * 選択中の証拠と人物から新しい情報を解放
 * @param {string|null} selectedEvidenceId 選択中の証拠ID
 * @param {string|null} selectedPersonId 選択中の人物ID
 * @param {Function} acquireItem アイテム解放関数
 * @param {Function} addEvidence 証拠追加関数
 * @param {Function} addPerson 人物追加関数
 * @returns {void}
 */
export async function executeInference(
    selectedEvidenceId,
    selectedPersonId,
    acquireItem,
    addEvidence,
    addPerson
) {

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

    // 不一致
    if (results.length == 0) {
        // 証拠名
        const nameEvidence = getItemData("evidence", selectedEvidenceId).name;

        // 人物名
        const namePerson = getItemData("person", selectedPersonId).name;

        // ダイアログ表示
        const res = await showDialog("「" + nameEvidence + "」と「" + namePerson + "」の組み合わせから、得られる情報は無さそうだ。");

        // 「閉じる」押下後
        if (res == 0) {
            // 【ストーリー進行】チュートリアル
            if (isFlagOn("tutorial-3") == false) {
                flagOn("tutorial-2");
                setTutorial(2);
            }
        }

        // 処理を中断
        return;
    }

    // ----------------------------------------------
    // 解放処理
    // ----------------------------------------------

    const newEvidence = [];
    const newPersons = [];

    results.forEach((rule) => {

        if (!Array.isArray(rule.newInfo)) {
            return;
        }

        rule.newInfo.forEach((info) => {

            const item = getItemData(info.type, info.id);

            // アイテムを解放
            const unlocked = acquireItem(info.type, info.id, false);

            // 新規解放された場合
            if (unlocked) {
                // 証拠
                if (info.type === "evidence") {
                    newEvidence.push(item);
                }

                // 人物
                if (info.type === "person") {
                    newPersons.push(item);
                }

                // ダイアログ表示
                let textDialog = "";
                rule.dialog.forEach(text => {
                    if (text != "") {
                        textDialog += '<br>';
                    }
                    textDialog += text;
                })
                showThinkDialog(textDialog);

                // 【ストーリー進行】チュートリアル
                if (isFlagOn("tutorial-5") == false) {
                    flagOn("tutorial-1");
                    flagOn("tutorial-2");
                    flagOn("tutorial-3");
                    flagOn("tutorial-4");
                    flagOn("tutorial-5");
                    hideTutorial();
                }

            }
            else {
                // ダイアログ表示
                showThinkDialog("この組み合わせから得られる情報は、もう無さそうだ。");
            }

        });

    });

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