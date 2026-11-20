// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// リスト
// --------------------------------------------------

import {
    initializeLists,
} from "./list.js";

// --------------------------------------------------
// 詳細
// --------------------------------------------------

import {
    initializeDetails,
    selectEvidence,
    selectPerson,
    getSelectedEvidenceId,
    getSelectedPersonId,
    acquireItem,
    addEvidence,
    addPerson,
} from "./detail.js";

// --------------------------------------------------
// セーブ
// --------------------------------------------------

import {
    isFlagOn,
    isUnlocked,
} from "../../../common/data/save.js";

// --------------------------------------------------
// 【推理】
// --------------------------------------------------

import {
    initializeInference,
} from "./inference.js";

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * 初期化処理（非同期処理につき関数可）
 */
async function initializeController() {
    // 読み書き可能モード
    if (isFlagOn("releaseModeReadWrite")) {
        const accessMode = document.getElementById("accessMode");
        accessMode.classList.remove("readOnly");
        accessMode.textContent = "[READ WRITE]"
    }

    // ハッシュから選択IDを取得
    const params = new URLSearchParams(location.hash.slice(1));

    const evidenceId = params.get("evidence");
    const personId = params.get("person");

    // 解放状態を確認
    const selectedEvidenceId = (
        evidenceId !== null
        && isUnlocked("evidence", [evidenceId])
    ) ? evidenceId : null;

    const selectedPersonId = (
        personId !== null
        && isUnlocked("person", [personId])
    ) ? personId : null;

    // リスト
    initializeLists(
        selectEvidence,
        selectPerson,
        selectedEvidenceId,
        selectedPersonId
    );

    // 詳細を初期化
    await initializeDetails(
        selectedEvidenceId,
        selectedPersonId
    );

    // 【推理】
    initializeInference(
        getSelectedEvidenceId,
        getSelectedPersonId,
        acquireItem,
        addEvidence,
        addPerson
    );
}

// 初期化処理を呼び出し
initializeController();