// ====================================================================================================
// 推理処理
// ====================================================================================================

// --------------------------------------------------
// インポート
// --------------------------------------------------

// 推理データ
import inferenceData from "../../data/inference.js";

// データ取得
import {
    getItemData,
} from "./data.js";

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
export function executeInference(
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

                if (info.type === "evidence") {
                    newEvidence.push(item);
                }

                if (info.type === "person") {
                    newPersons.push(item);
                }

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