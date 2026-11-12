// --------------------------------------------------
// データ読み込み
// --------------------------------------------------

// 証拠データ
import evidenceData from "../data/evidence.js";

// 人物データ
import personData from "../data/person.js";


// --------------------------------------------------
// DOM取得
// --------------------------------------------------

// 証拠リスト
const evidenceList = document.querySelector(
    ".pannel-left .itemList ul"
);

// 人物リスト
const personList = document.querySelector(
    ".pannel-right .itemList ul"
);

// 証拠詳細
const evidenceTitle = document.querySelector(
    ".detail-evidence h2"
);

const evidenceDetail = document.querySelector(
    ".detail-evidence .text"
);

// 人物詳細
const personTitle = document.querySelector(
    ".detail-person h2"
);

const personDetail = document.querySelector(
    ".detail-person .text"
);

// 推理ボタン
const inferenceButton = document.querySelector(
    ".inference button"
);


// --------------------------------------------------
// 解放済みデータ
// --------------------------------------------------

// 解放済みの証拠ID
// conditionが設定されていない項目は初期解放とする。
const unlockedEvidenceIds = [];

evidenceData.forEach((item) => {
    if (item.condition === undefined) {
        unlockedEvidenceIds.push(item.id);
    }
});


// 解放済みの人物ID
// conditionが設定されていない項目は初期解放とする。
const unlockedPersonIds = [];

personData.forEach((item) => {
    if (item.condition === undefined) {
        unlockedPersonIds.push(item.id);
    }
});


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

// IDから証拠データを取得する。
function getEvidence(id) {

    const item = evidenceData.find((data) => {
        return data.id === id;
    });

    return item;
}


// IDから人物データを取得する。
function getPerson(id) {

    const item = personData.find((data) => {
        return data.id === id;
    });

    return item;
}


// --------------------------------------------------
// 表示対象の取得
// --------------------------------------------------

// 解放済みの証拠だけを取得する。
function getUnlockedEvidence() {

    const items = evidenceData.filter((item) => {
        return unlockedEvidenceIds.includes(item.id);
    });

    return items;
}


// 解放済みの人物だけを取得する。
function getUnlockedPerson() {

    const items = personData.filter((item) => {
        return unlockedPersonIds.includes(item.id);
    });

    return items;
}


// --------------------------------------------------
// 証拠リスト描画
// --------------------------------------------------

function renderEvidenceList() {

    // リストを初期化する。
    evidenceList.innerHTML = "";

    // 解放済みの証拠を取得する。
    const items = getUnlockedEvidence();

    // 解放済みの証拠を順番に描画する。
    items.forEach((item) => {

        // リスト項目
        const li = document.createElement("li");

        li.classList.add("new");

        // 選択ボタン
        const button = document.createElement("button");

        // 証拠名
        const name = document.createElement("div");
        name.className = "name";
        name.textContent = item.name;

        // 補足情報
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = item.note;

        // ボタンに内容を追加する。
        button.appendChild(name);
        button.appendChild(note);

        // 選択中の証拠にはactiveを付ける。
        if (item.id === selectedEvidenceId) {
            button.classList.add("active");
        }

        // クリック時に選択状態を変更する。
        button.addEventListener("click", () => {
            selectEvidence(item.id);
        });

        // リストに追加する。
        li.appendChild(button);
        evidenceList.appendChild(li);
    });
}


// --------------------------------------------------
// 人物リスト描画
// --------------------------------------------------

function renderPersonList() {

    // リストを初期化する。
    personList.innerHTML = "";

    // 解放済みの人物を取得する。
    const items = getUnlockedPerson();

    // 解放済みの人物を順番に描画する。
    items.forEach((item) => {

        // リスト項目
        const li = document.createElement("li");

        li.classList.add("new");

        // 選択ボタン
        const button = document.createElement("button");

        // 人物名
        const name = document.createElement("div");
        name.className = "name";
        name.textContent = item.name;

        // 補足情報
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = item.note;

        // ボタンに内容を追加する。
        button.appendChild(name);
        button.appendChild(note);

        // 選択中の人物にはactiveを付ける。
        if (item.id === selectedPersonId) {
            button.classList.add("active");
        }

        // クリック時に選択状態を変更する。
        button.addEventListener("click", () => {
            selectPerson(item.id);
        });

        // リストに追加する。
        li.appendChild(button);
        personList.appendChild(li);
    });
}


// --------------------------------------------------
// 詳細表示
// --------------------------------------------------

// 選択中の証拠の詳細を表示する。
function renderEvidenceDetail() {

    const item = getEvidence(selectedEvidenceId);

    // 選択中のデータが存在しない場合は空にする。
    if (item === undefined) {
        evidenceTitle.textContent = "";
        evidenceDetail.innerHTML = "";
        return;
    }

    // タイトルを設定する。
    evidenceTitle.textContent = item.name;

    // 詳細を設定する。
    let detail = '';
    item.detail.forEach(text => {
        if (detail != '') {
            detail += '<br>'
        }

        detail += text;
    })
    evidenceDetail.innerHTML = detail;
}


// 選択中の人物の詳細を表示する。
function renderPersonDetail() {

    const item = getPerson(selectedPersonId);

    // 選択中のデータが存在しない場合は空にする。
    if (item === undefined) {
        personTitle.textContent = "";
        personDetail.innerHTML = "";
        return;
    }

    // タイトルを設定する。
    personTitle.textContent = item.name;

    // 詳細を設定する。
    let detail = '';
    item.detail.forEach(text => {
        if (detail != '') {
            detail += '<br>'
        }

        detail += text;
    })
    personDetail.innerHTML = detail;
}


// --------------------------------------------------
// 選択状態の更新
// --------------------------------------------------

// 証拠を選択する。
function selectEvidence(id) {

    selectedEvidenceId = id;

    // リストと詳細を更新する。
    renderEvidenceList();
    renderEvidenceDetail();
}


// 人物を選択する。
function selectPerson(id) {

    selectedPersonId = id;

    // リストと詳細を更新する。
    renderPersonList();
    renderPersonDetail();
}


// --------------------------------------------------
// 推理処理
// --------------------------------------------------

// 選択中の証拠と人物の組み合わせから、
// conditionが一致するデータを解放する。
function executeInference() {

    // どちらかが未選択なら処理しない。
    if (selectedEvidenceId === null) {
        return;
    }

    if (selectedPersonId === null) {
        return;
    }


    // ----------------------------------------------
    // 証拠の解放判定
    // ----------------------------------------------

    evidenceData.forEach((item) => {

        // conditionが設定されていない項目は対象外。
        if (item.condition === undefined) {
            return;
        }

        // conditionの形式を確認する。
        if (!Array.isArray(item.condition)) {
            return;
        }

        // 証拠IDと人物IDの両方が一致するか確認する。
        if (item.condition[0] !== selectedEvidenceId) {
            return;
        }

        if (item.condition[1] !== selectedPersonId) {
            return;
        }

        // すでに解放済みなら何もしない。
        if (unlockedEvidenceIds.includes(item.id)) {
            return;
        }

        // 証拠を解放する。
        unlockedEvidenceIds.push(item.id);
    });


    // ----------------------------------------------
    // 人物の解放判定
    // ----------------------------------------------

    personData.forEach((item) => {

        // conditionが設定されていない項目は対象外。
        if (item.condition === undefined) {
            return;
        }

        // conditionの形式を確認する。
        if (!Array.isArray(item.condition)) {
            return;
        }

        // 証拠IDと人物IDの両方が一致するか確認する。
        if (item.condition[0] !== selectedEvidenceId) {
            return;
        }

        if (item.condition[1] !== selectedPersonId) {
            return;
        }

        // すでに解放済みなら何もしない。
        if (unlockedPersonIds.includes(item.id)) {
            return;
        }

        // 人物を解放する。
        unlockedPersonIds.push(item.id);
    });


    // ----------------------------------------------
    // 解放結果を画面に反映
    // ----------------------------------------------

    renderEvidenceList();
    renderPersonList();

}


// --------------------------------------------------
// イベント設定
// --------------------------------------------------

// 推理ボタン
inferenceButton.addEventListener("click", () => {
    executeInference();
});


// --------------------------------------------------
// 初期化
// --------------------------------------------------

// 最初に表示する証拠を選択する。
const initialEvidence = getUnlockedEvidence();

if (initialEvidence.length > 0) {
    selectedEvidenceId = initialEvidence[0].id;
}


// 最初に表示する人物を選択する。
const initialPerson = getUnlockedPerson();

if (initialPerson.length > 0) {
    selectedPersonId = initialPerson[0].id;
}


// リストを描画する。
renderEvidenceList();
renderPersonList();


// 詳細を表示する。
renderEvidenceDetail();
renderPersonDetail();


// 推理ボタンの有効・無効を設定する。
if (selectedEvidenceId === null) {
    inferenceButton.disabled = true;
}

if (selectedPersonId === null) {
    inferenceButton.disabled = true;
}