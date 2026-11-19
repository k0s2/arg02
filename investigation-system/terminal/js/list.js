// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// データ
// --------------------------------------------------

// データ取得
import {
    formatDateText,
} from "./data.js";

// 【証拠】
import evidenceData from "../../../common/data/evidence.js";

// 【人物】
import personData from "../../../common/data/person.js";

// セーブ
import {
    getUnlockedIds,
    getUnreadIds,
    markRead,
} from "../../../common/data/save.js";

// ====================================================================================================
// 要素取得
// ====================================================================================================

// 【証拠】グループ
const evidenceList = document.querySelector(".pannel-left .itemList .groups");

// 【人物】グループ
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

/**
 * 項目が属するグループIDを取得
 * @param {Object[]} groups グループデータ
 * @param {string|null} selectedId 選択中の項目ID
 * @returns {string|null} グループID
 */
function getItemGroupId(groups, selectedId) {

    if (selectedId === null) {
        return null;
    }

    const group = groups.find((group) => {

        return group.items.some((item) => {
            return String(item.id) === String(selectedId);
        });

    });

    return group !== undefined
        ? String(group.id)
        : null;

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
    name.textContent = formatDateText(item.name);

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
 * @param {string[]} previousOpenGroupIds 再描画前に展開していたグループID
 * @returns {void}
 */
function renderGroupedList(
    list,
    groups,
    type,
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds,
    previousOpenGroupIds
) {

    list.innerHTML = "";

    const unlockedIds = getUnlockedIds(type);

    // アニメーション付きで展開するグループ
    const groupsToOpen = [];

    let hasItems = false;

    groups.forEach((group) => {

        // グループ
        const groupElement = document.createElement("details");
        groupElement.className = "itemGroup";
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

                // 再描画前から展開していたグループは即時展開
                if (previousOpenGroupIds.includes(String(group.id))) {
                    groupElement.open = true;
                }
                // 新たに展開するグループは後から開く
                else {
                    groupsToOpen.push(groupElement);
                }

            }

            items.forEach((item) => {

                const li = createListItem(
                    item,
                    selectedId,
                    type,
                    selectFunction
                );

                // 新規取得アニメーション
                if (!isNewGroup && animatedIds.includes(item.id)) {
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

    // 新たに展開するグループをアニメーション付きで開く
    if (groupsToOpen.length > 0) {

        requestAnimationFrame(() => {

            groupsToOpen.forEach((group) => {
                group.open = true;
            });

        });

    }

}

// ====================================================================================================
// 【証拠】リスト描画
// ====================================================================================================

/**
 * 解放済みの【証拠】リストを描画
 * @param {string|null} selectedId 選択中の【証拠】ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる【証拠】ID
 * @param {string[]|undefined} previousOpenGroupIds 再描画前に展開していたグループID
 * @returns {void}
 */
function renderEvidenceList(
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds,
    previousOpenGroupIds
) {

    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(evidenceData, "evidence");
        previousOpenGroupIds = openGroupIds;
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    if (previousOpenGroupIds === undefined) {
        previousOpenGroupIds = [];
    }

    renderGroupedList(
        evidenceList,
        evidenceData,
        "evidence",
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds,
        previousOpenGroupIds
    );

}

// ====================================================================================================
// 【人物】リスト描画
// ====================================================================================================

/**
 * 解放済みの【人物】リストを描画
 * @param {string|null} selectedId 選択中の【人物】ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @param {string[]|undefined} openGroupIds 展開するグループID
 * @param {string[]|undefined} animatedIds アニメーションさせる【人物】ID
 * @param {string[]|undefined} previousOpenGroupIds 再描画前に展開していたグループID
 * @returns {void}
 */
function renderPersonList(
    selectedId,
    selectFunction,
    openGroupIds,
    animatedIds,
    previousOpenGroupIds
) {

    if (openGroupIds === undefined) {
        openGroupIds = getInitialOpenGroupIds(personData, "person");
        previousOpenGroupIds = openGroupIds;
    }

    if (animatedIds === undefined) {
        animatedIds = [];
    }

    if (previousOpenGroupIds === undefined) {
        previousOpenGroupIds = [];
    }

    renderGroupedList(
        personList,
        personData,
        "person",
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds,
        previousOpenGroupIds
    );

}

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * リストを初期化
 * @param {Function} selectEvidence 【証拠】選択関数
 * @param {Function} selectPerson 【人物】選択関数
 * @param {string|null} selectedEvidenceId 選択中の【証拠】ID
 * @param {string|null} selectedPersonId 選択中の【人物】ID
 * @returns {void}
 */
export function initializeLists(
    selectEvidence,
    selectPerson,
    selectedEvidenceId = null,
    selectedPersonId = null
) {

    // 【証拠】
    const evidenceOpenGroupIds = getInitialOpenGroupIds(
        evidenceData,
        "evidence"
    );

    const evidenceGroupId = getItemGroupId(
        evidenceData,
        selectedEvidenceId
    );

    if (
        evidenceGroupId !== null
        && !evidenceOpenGroupIds.includes(evidenceGroupId)
    ) {
        evidenceOpenGroupIds.push(evidenceGroupId);
    }

    renderEvidenceList(
        selectedEvidenceId,
        selectEvidence,
        evidenceOpenGroupIds,
        [],
        evidenceOpenGroupIds
    );

    // 【人物】
    const personOpenGroupIds = getInitialOpenGroupIds(
        personData,
        "person"
    );

    const personGroupId = getItemGroupId(
        personData,
        selectedPersonId
    );

    if (
        personGroupId !== null
        && !personOpenGroupIds.includes(personGroupId)
    ) {
        personOpenGroupIds.push(personGroupId);
    }

    renderPersonList(
        selectedPersonId,
        selectPerson,
        personOpenGroupIds,
        [],
        personOpenGroupIds
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
 * 解放された【証拠】をリストに追加
 * @param {Object[]} items 追加する【証拠】データ
 * @param {string|null} selectedId 選択中の【証拠】ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @returns {void}
 */
export function addEvidence(items, selectedId, selectFunction) {

    // 再描画前の展開状態を取得
    const previousOpenGroupIds = getOpenGroupIds(evidenceList);

    // 展開状態を複製
    const openGroupIds = [...previousOpenGroupIds];

    // 取得したアイテムが属するグループを展開
    getUpdatedOpenGroupIds(evidenceData, items, openGroupIds);

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderEvidenceList(
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds,
        previousOpenGroupIds
    );

}

/**
 * 解放された【人物】をリストに追加
 * @param {Object[]} items 追加する【人物】データ
 * @param {string|null} selectedId 選択中の【人物】ID
 * @param {Function} selectFunction 選択時に呼び出す関数
 * @returns {void}
 */
export function addPerson(items, selectedId, selectFunction) {

    // 再描画前の展開状態を取得
    const previousOpenGroupIds = getOpenGroupIds(personList);

    // 展開状態を複製
    const openGroupIds = [...previousOpenGroupIds];

    // 取得したアイテムが属するグループを展開
    getUpdatedOpenGroupIds(personData, items, openGroupIds);

    const animatedIds = items.map((item) => {
        return item.id;
    });

    renderPersonList(
        selectedId,
        selectFunction,
        openGroupIds,
        animatedIds,
        previousOpenGroupIds
    );

}

// ====================================================================================================
// 既読処理
// ====================================================================================================

/**
 * 【証拠】を既読にする
 * @param {string} id 【証拠】ID
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
 * 【人物】を既読にする
 * @param {string} id 【人物】ID
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
 * 【証拠】リストの選択状態を更新
 * @param {string|null} selectedId 選択中の【証拠】ID
 * @returns {void}
 */
export function updateEvidenceSelection(selectedId) {

    updateListSelection(evidenceList, selectedId);

}

/**
 * 【人物】リストの選択状態を更新
 * @param {string|null} selectedId 選択中の【人物】ID
 * @returns {void}
 */
export function updatePersonSelection(selectedId) {

    updateListSelection(personList, selectedId);

}