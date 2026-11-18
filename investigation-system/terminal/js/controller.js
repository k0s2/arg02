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
// 【推理】
// --------------------------------------------------

import {
    initializeInference,
} from "./inference.js";

// ====================================================================================================
// 初期化
// ====================================================================================================

// リスト
initializeLists(
    selectEvidence,
    selectPerson
);

// 詳細
initializeDetails();

// 【推理】
initializeInference(
    getSelectedEvidenceId,
    getSelectedPersonId,
    acquireItem,
    addEvidence,
    addPerson
);