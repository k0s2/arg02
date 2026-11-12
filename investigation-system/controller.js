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

const evidenceDetailAnimation = {
    sequence: 0,
    animation: null
};

const personDetailAnimation = {
    sequence: 0,
    animation: null
};

// --------------------------------------------------
// 解放済みデータ
// --------------------------------------------------

// 解放済みの証拠ID
const unlockedEvidenceIds = [];
evidenceData.forEach((item) => {
    // conditionが設定されていない項目は初期解放と
    if (item.condition === undefined) {
        unlockedEvidenceIds.push(item.id);
    }
});

// 解放済みの人物ID
const unlockedPersonIds = [];
personData.forEach((item) => {
    // conditionが設定されていない項目は初期解放と
    if (item.condition === undefined) {
        unlockedPersonIds.push(item.id);
    }
});

// --------------------------------------------------
// 未読データ
// --------------------------------------------------

// 未読の証拠ID
const unreadEvidenceIds = [];

// 未読の人物ID
const unreadPersonIds = [];

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
    // IDが一致するアイテムを取得
    const item = evidenceData.find((data) => {
        return data.id === id;
    });

    // アイテムを返す
    return item;
}

/**
 * 人物データを取得
 * @param {number} id 人物ID
 * @returns {Object|undefined} 該当する人物データ
 */
function getPerson(id) {
    // IDが一致するアイテムを取得
    const item = personData.find((data) => {
        return data.id === id;
    });

    // アイテムを返す
    return item;
}

// --------------------------------------------------
// 表示対象の取得
// --------------------------------------------------

/** 解放済みの証拠だけを取得
 * @returns {Object[]} 解放済みの証拠データ
 */
function getUnlockedEvidence() {
    // IDが一致する、解放済みアイテムを取得
    const items = evidenceData.filter((item) => {
        return unlockedEvidenceIds.includes(item.id);
    });

    // アイテムを返す
    return items;
}


// 解放済みの人物だけを取得
/** @returns {Object[]} 解放済みの人物データ */
function getUnlockedPerson() {
    // IDが一致する、解放済みアイテムを取得
    const items = personData.filter((item) => {
        return unlockedPersonIds.includes(item.id);
    });

    // アイテムを返す
    return items;
}

// --------------------------------------------------
// リスト項目生成
// --------------------------------------------------

/**
 * リスト項目の要素を生成
 * @param {Object} item 表示するデータ
 * @param {number|null} selectedId 選択中のID
 * @param {number[]} unreadIds 未読ID一覧
 * @param {function(number): void} selectFunction 選択時に呼び出す関数
 * @returns {HTMLLIElement} 生成したリスト項目
 */
function createListItem(item, selectedId, unreadIds, selectFunction) {
    // リスト項目
    const li = document.createElement("li");

    // ID
    li.dataset.id = String(item.id);

    // 新規
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
        // 選択状態の切り替え
        selectFunction(item.id);
    });

    // リストに要素を追加する
    li.appendChild(button);

    // 追加要素を返す
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

    // 初期状態を設定
    li.classList.add("hidden");
    li.style.height = "0px";
    li.style.overflow = "hidden";

    // リストに追加
    list.appendChild(li);

    // 高さ0の状態を確定させる。
    li.getBoundingClientRect();

    // 本来の高さを取得
    const targetHeight = li.scrollHeight;

    // 高さをアニメーションさせる。
    requestAnimationFrame(() => {
        li.style.height = targetHeight + "px";
    });

    // 高さのアニメーションが終了したらスライドイン
    li.addEventListener("transitionend", function onTransitionEnd(event) {

        // height以外のtransitionは無視
        if (event.propertyName !== "height") {
            return;
        }

        // イベントを解除
        li.removeEventListener("transitionend", onTransitionEnd);

        // 高さをautoに戻す。
        li.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        li.style.height = "auto";
        li.style.overflow = "";

        // 次のフレームでhiddenを解除
        requestAnimationFrame(() => {
            li.classList.remove("hidden");
        });

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

    // リストを初期化
    evidenceList.innerHTML = "";

    // 解放済みの証拠を取得
    const items = getUnlockedEvidence();

    // 空の場合
    if (items.length === 0) {
        evidenceList.appendChild(createEmptyListItem());
        return;
    }

    // 解放済みの証拠を順番に描画
    items.forEach((item) => {

        const li = createListItem(
            item,
            selectedEvidenceId,
            unreadEvidenceIds,
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

    // リストを初期化
    personList.innerHTML = "";

    // 解放済みの人物を取得
    const items = getUnlockedPerson();

    // 空の場合
    if (items.length === 0) {
        personList.appendChild(createEmptyListItem());
        return;
    }

    // 解放済みの人物を順番に描画
    items.forEach((item) => {

        const li = createListItem(
            item,
            selectedPersonId,
            unreadPersonIds,
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
        unreadEvidenceIds,
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
        unreadPersonIds,
        selectPerson
    );

    appendListItem(personList, li);
}

// --------------------------------------------------
// 既読処理
// --------------------------------------------------

// 証拠を既読に
/**
 * 証拠を既読状態に
 * @param {number} id 証拠ID
 * @returns {void}
 */
function markEvidenceRead(id) {

    const index = unreadEvidenceIds.indexOf(id);

    if (index !== -1) {
        unreadEvidenceIds.splice(index, 1);
    }

    const li = evidenceList.querySelector(
        'li[data-id="' + id + '"]'
    );

    if (li !== null) {
        li.classList.remove("new");
    }
}

// 人物を既読に
/**
 * 人物を既読状態に
 * @param {number} id 人物ID
 * @returns {void}
 */
function markPersonRead(id) {

    const index = unreadPersonIds.indexOf(id);

    if (index !== -1) {
        unreadPersonIds.splice(index, 1);
    }

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
 * 証拠リストの選択状態を更新します。
 * @returns {void}
 */
function updateEvidenceSelection() {

    const buttons = evidenceList.querySelectorAll("button");

    buttons.forEach((button) => {

        const id = Number(button.parentElement.dataset.id);

        if (id === selectedEvidenceId) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

    });
}

/**
 * 人物リストの選択状態を更新します。
 * @returns {void}
 */
function updatePersonSelection() {

    const buttons = personList.querySelectorAll("button");

    buttons.forEach((button) => {

        const id = Number(button.parentElement.dataset.id);

        if (id === selectedPersonId) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

    });
}
// --------------------------------------------------
// 詳細表示
// --------------------------------------------------

// 選択中の証拠の詳細を表示
function renderEvidenceDetail(item) {
    // 選択中のデータが存在しない場合は空に
    if (item === undefined) {
        evidenceTitle.textContent = "";
        evidenceDetail.innerHTML = "";
        return;
    }

    // タイトルを設定
    evidenceTitle.textContent = item.name;

    // 詳細を設定
    let detail = '';

    item.detail.forEach((text) => {

        if (detail !== '') {
            detail += '<br>';
        }

        detail += text;

    });

    evidenceDetail.innerHTML = detail;
}

// 選択中の人物の詳細を表示
function renderPersonDetail(item) {
    // 選択中のデータが存在しない場合は空に
    if (item === undefined) {
        personTitle.textContent = "";
        personDetail.innerHTML = "";
        return;
    }

    // タイトルを設定
    personTitle.textContent = item.name;

    // 詳細を設定
    let detail = '';

    item.detail.forEach((text) => {

        if (detail !== '') {
            detail += '<br>';
        }

        detail += text;

    });

    personDetail.innerHTML = detail;
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
 * @param {function(Object): void} renderFunction 描画関数
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

        // リストと反対側へ移動
        let exitTransform = "translateX(24px)";

        if (side === "right") {
            exitTransform = "translateX(-24px)";
        }

        const exitAnimation = panel.animate(
            [
                {
                    transform: startTransform,
                    opacity: startOpacity
                },
                {
                    transform: exitTransform,
                    opacity: 0
                }
            ],
            {
                duration: 180,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        state.animation = exitAnimation;

        try {
            await exitAnimation.finished;
        } catch (error) {
            return;
        }

        // 途中で別の選択が行われていたら終了
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

    // 選択解除ならここで終了
    if (item === undefined) {
        return;
    }

    // ----------------------------------------------
    // 新しい詳細をスライドイン
    // ----------------------------------------------

    // リスト側から移動
    let enterTransform = "translateX(-24px)";

    if (side === "right") {
        enterTransform = "translateX(24px)";
    }

    const enterAnimation = panel.animate(
        [
            {
                transform: enterTransform,
                opacity: 0
            },
            {
                transform: "translateX(0)",
                opacity: 1
            }
        ],
        {
            duration: 220,
            easing: "ease-out",
            fill: "both"
        }
    );

    state.animation = enterAnimation;

    try {
        await enterAnimation.finished;
    } catch (error) {
        return;
    }

    // 途中で別の選択が行われていたら終了
    if (sequence !== state.sequence) {
        return;
    }

    // アニメーションを解除して通常状態に戻す
    enterAnimation.cancel();
    state.animation = null;
}

// --------------------------------------------------
// 選択状態の更新
// --------------------------------------------------

/**
 * 証拠を選択
 * @param {*} id
 */
function selectEvidence(id) {
    // ●アクティブ変更
    if (selectedEvidenceId !== id) {

        selectedEvidenceId = id;

        // 既読に
        markEvidenceRead(id);

    }
    // ●アクティブ解除
    else {

        selectedEvidenceId = null;

    }

    // 選択状態を更新
    updateEvidenceSelection();

    // 詳細をアニメーション付きで更新
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
 * @param {*} id
 */
function selectPerson(id) {

    // ●アクティブ変更
    if (selectedPersonId !== id) {

        selectedPersonId = id;

        // 既読に
        markPersonRead(id);

    }
    // ●アクティブ解除
    else {

        selectedPersonId = null;

    }

    // 選択状態を更新
    updatePersonSelection();

    // 詳細をアニメーション付きで更新
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
// 推理処理
// --------------------------------------------------

/** 選択中の証拠と人物の組み合わせから新しい項目を解放 @returns {void} */
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

        // conditionの形式を確認
        if (!Array.isArray(item.condition)) {
            return;
        }

        // 証拠IDと人物IDの両方が一致するか確認
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

        // 証拠を解放
        unlockedEvidenceIds.push(item.id);

        // 未読として登録
        unreadEvidenceIds.push(item.id);

        // 証拠を追加
        addEvidence(item);

    });


    // ----------------------------------------------
    // 人物の解放判定
    // ----------------------------------------------

    personData.forEach((item) => {

        // conditionが設定されていない項目は対象外。
        if (item.condition === undefined) {
            return;
        }

        // conditionの形式を確認
        if (!Array.isArray(item.condition)) {
            return;
        }

        // 証拠IDと人物IDの両方が一致するか確認
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

        // 人物を解放
        unlockedPersonIds.push(item.id);

        // 未読として登録
        unreadPersonIds.push(item.id);

        // 人物を追加
        addPerson(item);

    });

}

// --------------------------------------------------
// イベント設定
// --------------------------------------------------

// 推理ボタン
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
renderEvidenceDetail();

// 人物
renderPersonDetail();

// --------------------------------------------------
// 推理ボタン
// --------------------------------------------------

// 証拠・人物が選択されていない場合
if (
    selectedEvidenceId === null
    || selectedPersonId === null
) {
    // 推理ボタンを無効化
    inferenceButton.disabled = true;
}