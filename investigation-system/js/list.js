// ====================================================================================================
// リスト
// ====================================================================================================

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    getUnlockedIds,
    getUnreadIds,
    markRead,
} from "./save.js";

// ====================================================================================================
// 要素取得
// ====================================================================================================

// 証拠グループ
const evidenceList = document.querySelector(".pannel-left .itemList .groups");

// 人物グループ
const personList = document.querySelector(".pannel-right .itemList .groups");

// ====================================================================================================
// グループ状態取得
// ====================================================================================================

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

// ====================================================================================================
// リスト項目生成
// ====================================================================================================

/**
 * リスト項目の要素を生成
 * @param {Object} item 表示するデータ
 * @param {number|string|null} selectedId 選択中のID
 * @param {string} type データの種類
 * @param {Function} selectFunction 選択時に呼び出す関数
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

// ====================================================================================================
// グループリスト描画
// ====================================================================================================

/**
 * グループリストを描画
 * @param {HTMLElement} list 描画先
 * @param {Object[]} groups グループデータ
 * @param {string} type データの種類
 * @param {number|string|null} selectedId 選択中のID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @param {string[]} openGroupIds 展開するグループID
 * @param {Array<number|string>} animatedIds アニメーションさせるアイテムID
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

// ====================================================================================================
// 証拠リスト描画
// ====================================================================================================

/**
 * 解放済みの証拠リストを描画
 * @param {Object[]} groups 証拠グループデータ
 * @param {string|null} selectedId 選択中の証拠ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる証拠ID
 * @returns {void}
 */
export function renderEvidenceList(
    groups,
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds
) {

    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(groups, "evidence");
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    renderGroupedList(
        evidenceList,
        groups,
        "evidence",
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds
    );

}

// ====================================================================================================
// 人物リスト描画
// ====================================================================================================

/**
 * 解放済みの人物リストを描画
 * @param {Object[]} groups 人物グループデータ
 * @param {string|null} selectedId 選択中の人物ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる人物ID
 * @returns {void}
 */
export function renderPersonList(
    groups,
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds
) {

    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(groups, "person");
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    renderGroupedList(
        personList,
        groups,
        "person",
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds
    );

}

// ====================================================================================================
// リストへの新規項目追加
// ====================================================================================================

/**
 * 追加項目が属するグループを展開
 * @param {Object[]} groups グループデータ
 * @param {Object[]} items 追加する項目
 * @param {string[]} openGroupIds 現在展開中のグループID
 * @returns {string[]} 更新した展開グループID
 */
function getUpdatedOpenGroupIds(groups, items, openGroupIds) {

    items.forEach((item) => {

        groups.forEach((group) => {

            const exists = group.items.some((groupItem) => {
                return groupItem.id === item.id;
            });

            if (exists && !openGroupIds.includes(String(group.id))) {
                openGroupIds.push(String(group.id));
            }

        });

    });

    return openGroupIds;

}

/**
 * 解放された証拠をリストに追加
 * @param {Object[]} groups 証拠グループデータ
 * @param {Object[]} items 追加する証拠データ
 * @param {string|null} selectedId 選択中の証拠ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @returns {void}
 */
export function addEvidence(groups, items, selectedId, selectFunction) {

    const openGroupIds = getOpenGroupIds(evidenceList);

    // 取得したアイテムが属するグループを展開
    getUpdatedOpenGroupIds(groups, items, openGroupIds);

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderEvidenceList(
        groups,
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds
    );

}

/**
 * 解放された人物をリストに追加
 * @param {Object[]} groups 人物グループデータ
 * @param {Object[]} items 追加する人物データ
 * @param {string|null} selectedId 選択中の人物ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @returns {void}
 */
export function addPerson(groups, items, selectedId, selectFunction) {

    const openGroupIds = getOpenGroupIds(personList);

    // 取得したアイテムが属するグループを展開
    getUpdatedOpenGroupIds(groups, items, openGroupIds);

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderPersonList(
        groups,
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds
    );

}

// ====================================================================================================
// 既読処理
// ====================================================================================================

/**
 * 証拠を既読にする
 * @param {string} id 証拠ID
 * @returns {void}
 */
export function markEvidenceRead(id) {

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
export function markPersonRead(id) {

    markRead("person", id);

    const li = personList.querySelector(
        'li[data-id="' + id + '"]'
    );

    if (li !== null) {
        li.classList.remove("new");
    }

}

// ====================================================================================================
// 選択状態の更新
// ====================================================================================================

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
 * @param {string|null} selectedId 選択中の証拠ID
 * @returns {void}
 */
export function updateEvidenceSelection(selectedId) {

    updateListSelection(evidenceList, selectedId);

}

/**
 * 人物リストの選択状態を更新
 * @param {string|null} selectedId 選択中の人物ID
 * @returns {void}
 */
export function updatePersonSelection(selectedId) {

    updateListSelection(personList, selectedId);

}