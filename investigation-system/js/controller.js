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

// 推理データ
import inferenceData from "../../data/inference.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    getUnlockedIds,
    getUnreadIds,
    unlockItem,
    markRead,
    isUnlocked,
} from "./save.js";

// ====================================================================================================
// ファンクション
// ====================================================================================================

// --------------------------------------------------
// 要素取得
// --------------------------------------------------

// 証拠グループ
const evidenceList = document.querySelector(".pannel-left .itemList .groups");

// 人物グループ
const personList = document.querySelector(".pannel-right .itemList .groups");

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
 * @param {string} id 証拠ID
 * @returns {Object|undefined} 該当する証拠データ
 */
function getEvidence(id) {

    for (const group of evidenceData) {

        const item = group.items.find((item) => {
            return item.id === id;
        });

        if (item !== undefined) {
            return item;
        }

    }

    return undefined;

}

/**
 * 人物データを取得
 * @param {string} id 人物ID
 * @returns {Object|undefined} 該当する人物データ
 */
function getPerson(id) {

    for (const group of personData) {

        const item = group.items.find((item) => {
            return item.id === id;
        });

        if (item !== undefined) {
            return item;
        }

    }

    return undefined;

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
// グループ状態取得
// --------------------------------------------------

/**
 * 展開中のグループIDを取得
 * @param {HTMLElement} list 対象リスト
 * @returns {string[]} 展開中のグループID
 */
function getOpenGroupIds(list) {

    const groups = list.querySelectorAll("details[data-group-id][open]");

    return Array.from(groups).map((group) => {
        return group.dataset.groupId;
    });

}

/**
 * 初期状態で展開するグループIDを取得
 * @param {Object[]} groups グループデータ
 * @param {string} type データの種類
 * @returns {string[]} 展開するグループID
 */
function getInitialOpenGroupIds(groups, type) {

    const unreadIds = getUnreadIds(type);

    return groups
        .filter((group) => {

            return group.items.some((item) => {
                return unreadIds.includes(item.id);
            });

        })
        .map((group) => {
            return String(group.id);
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

    // 新規追加
    const unreadIds = getUnreadIds(type);
    if (unreadIds.includes(item.id)) {
        // バッジ
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
// グループリスト描画
// --------------------------------------------------

/**
 * グループリストを描画
 * @param {HTMLElement} list 描画先
 * @param {Object[]} groups グループデータ
 * @param {string} type データの種類
 * @param {number|string|null} selectedId 選択中のID
 * @param {function(number|string): void} selectFunction 選択時に呼び出す関数
 * @param {string[]} openGroupIds 展開するグループID
 * @param {number|string[]} animatedIds アニメーションさせるアイテムID
 * @returns {void}
 */
function renderGroupedList(
    list,
    groups,
    type,
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds
) {
    list.innerHTML = "";

    const unlockedIds = getUnlockedIds(type);

    let hasItems = false;

    groups.forEach((group) => {

        // グループ
        const groupElement = document.createElement("details");
        groupElement.className = "itemGroup";
        groupElement.open = true;
        groupElement.dataset.groupId = String(group.id);

        // グループ名
        const summary = document.createElement("summary");
        summary.className = "groupTitle";
        summary.textContent = group.name;

        groupElement.appendChild(summary);

        // アイテムリスト
        const ul = document.createElement("ul");

        // 解放済みアイテム
        const items = group.items.filter((item) => {
            return unlockedIds.includes(item.id);
        });

        // アイテムが存在する場合
        if (items.length > 0) {

            // 新規グループ
            const isNewGroup = items.every((item) => {
                return animatedIds.includes(item.id);
            });

            if (isNewGroup) {
                groupElement.classList.add("slide-in");
            }

            hasItems = true;

            groupElement.hidden = false;

            // 展開状態
            if (openGroupIds.includes(String(group.id))) {
                groupElement.open = true;
            }

            items.forEach((item) => {

                const li = createListItem(
                    item,
                    selectedId,
                    type,
                    selectFunction
                );

                // 新規取得アニメーション
                if (animatedIds.includes(item.id)) {
                    li.classList.add("slide-in");
                }

                ul.appendChild(li);

            });

        }
        // アイテムが存在しない場合
        else {

            groupElement.hidden = true;

        }

        groupElement.appendChild(ul);
        list.appendChild(groupElement);

    });

    // 全グループにアイテムが存在しない場合
    if (!hasItems) {

        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "NO DATA";

        list.appendChild(empty);

    }

}

// --------------------------------------------------
// 証拠リスト描画
// --------------------------------------------------

/**
 * 解放済みの証拠リストを描画
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる証拠ID
 * @returns {void}
 */
function renderEvidenceList(openGroupIds, animatedIds) {
    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(evidenceData, "evidence");
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    renderGroupedList(
        evidenceList,
        evidenceData,
        "evidence",
        selectedEvidenceId,
        selectEvidence,
        openGroupIds,
        animatedIds
    );
}

// --------------------------------------------------
// 人物リスト描画
// --------------------------------------------------

/**
 * 解放済みの人物リストを描画
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる人物ID
 * @returns {void}
 */
function renderPersonList(openGroupIds, animatedIds) {
    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(personData, "person");
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    renderGroupedList(
        personList,
        personData,
        "person",
        selectedPersonId,
        selectPerson,
        openGroupIds,
        animatedIds
    );
}

// --------------------------------------------------
// リストへの新規項目追加
// --------------------------------------------------

/**
 * 解放された証拠をリストに追加
 * @param {Object[]} items 追加する証拠データ
 * @returns {void}
 */
function addEvidence(items) {
    const openGroupIds = getOpenGroupIds(evidenceList);

    // 取得したアイテムが属するグループを展開
    items.forEach((item) => {

        evidenceData.forEach((group) => {

            const exists = group.items.some((groupItem) => {
                return groupItem.id === item.id;
            });

            if (exists && !openGroupIds.includes(String(group.id))) {
                openGroupIds.push(String(group.id));
            }

        });

    });

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderEvidenceList(openGroupIds, animatedIds);
}

/**
 * 解放された人物をリストに追加
 * @param {Object[]} items 追加する人物データ
 * @returns {void}
 */
function addPerson(items) {
    const openGroupIds = getOpenGroupIds(personList);

    // 取得したアイテムが属するグループを展開
    items.forEach((item) => {

        personData.forEach((group) => {

            const exists = group.items.some((groupItem) => {
                return groupItem.id === item.id;
            });

            if (exists && !openGroupIds.includes(String(group.id))) {
                openGroupIds.push(String(group.id));
            }

        });

    });

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderPersonList(openGroupIds, animatedIds);
}

// --------------------------------------------------
// 既読処理
// --------------------------------------------------

/**
 * 証拠を既読にする
 * @param {string} id 証拠ID
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
 * キーワード設定
 * @param {HTMLElement} detailElement 対象要素
 */
function setKeyword(detailElement) {

    // キーワード要素を取得
    const targets = detailElement.querySelectorAll(".keyword");

    // 要素ごとに処理
    targets.forEach((target) => {

        // 証拠
        const evidenceId = target.getAttribute("getEvidence");

        if (evidenceId) {

            // 未取得
            if (!isUnlocked("evidence", evidenceId)) {

                target.addEventListener("click", () => {

                    acquireItem("evidence", evidenceId);

                    target.classList.add("get");

                });

            }
            // 取得済み
            else {

                target.classList.add("get");

            }

        }

        // 人物
        const personId = target.getAttribute("getPerson");

        if (personId) {

            // 未取得
            if (!isUnlocked("person", personId)) {

                target.addEventListener("click", () => {

                    acquireItem("person", personId);

                    target.classList.add("get");

                });

            }
            // 取得済み
            else {

                target.classList.add("get");

            }

        }

    });

}

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

    setKeyword(evidenceDetail);

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

    setKeyword(personDetail);

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