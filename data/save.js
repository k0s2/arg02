// ====================================================================================================
// セーブ
// ====================================================================================================

// --------------------------------------------------
// 設定
// --------------------------------------------------

const SAVE_KEY = "remains13_save";

// --------------------------------------------------
// 初期セーブデータ
// --------------------------------------------------

function createInitialSave() {
    return {
        // 進行フラグ
        flag: [],

        // 【証拠】
        evidence: [
            // 古びた便箋
            {
                id: "001",
                read: false,
            },
        ],

        // 【人物】
        person: [
            // 谷戸　俊道
            {
                id: "001",
                read: false,
            },
        ],
    };
}

// --------------------------------------------------
// セーブデータ読み込み
// --------------------------------------------------

function loadSave() {
    // ローカルストレージから取得
    const savedData = localStorage.getItem(SAVE_KEY);

    // セーブデータが存在しない場合
    if (savedData === null) {
        return createInitialSave();
    }

    // パースして返す
    return JSON.parse(savedData);
}

// --------------------------------------------------
// セーブデータ保存
// --------------------------------------------------

function save() {

    // セーブデータ取得
    const json = JSON.stringify(saveData);

    // ローカルストレージに保存
    localStorage.setItem(SAVE_KEY, json);

    // セーブデータ更新イベントを発火
    window.dispatchEvent(new Event("saveupdated"));

}

// --------------------------------------------------
// 他タブからのセーブデータ更新
// --------------------------------------------------

window.addEventListener("storage", (event) => {

    // セーブデータ以外の変更は無視
    if (event.key !== SAVE_KEY) {
        return;
    }

    // 最新のセーブデータを読み込み
    Object.assign(saveData, loadSave());

    // 更新イベント
    window.dispatchEvent(new Event("saveupdated"));

});

// --------------------------------------------------
// セーブデータ本体
// --------------------------------------------------

const saveData = loadSave();

// ====================================================================================================
// 【証拠】【人物】アイテム
// ====================================================================================================

/**
 * 登録済みIDを取得
 * @param {string} type データの種類
 * @returns {Array} 登録済みID
 */
export function getUnlockedIds(type) {

    const records = saveData[type];

    if (!Array.isArray(records)) {
        return [];
    }

    return records.map(item => item.id);

}

/**
 * 未読IDを取得
 * @param {string} type データの種類
 * @returns {Array} 未読ID
 */
export function getUnreadIds(type) {

    const records = saveData[type];

    if (!Array.isArray(records)) {
        return [];
    }

    return records
        .filter(item => !item.read)
        .map(item => item.id);

}

/**
 * アイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @param {string|undefined} title 保存するタイトル
 * @returns {boolean} 新規解放されたか
 */
export function unlockItem(type, id, title) {
    const records = saveData[type];

    // 対応していない種類なら処理しない
    if (!Array.isArray(records)) {
        return false;
    }

    // 解放済みなら処理しない
    if (records.some(item => item.id == id)) {
        return false;
    }

    // 解放
    const record = {
        id,
        read: false,
    };

    // タイトルが指定されている場合
    if (title !== undefined) {
        record.title = title;
    }

    records.push(record);

    // 保存
    save();

    return true;
}

/**
 * アイテムが取得済みか確認
 * @param {string} type データの種類
 * @param {number|string|Array} id アイテムID
 * @returns {boolean} 取得済みか
 */
export function isUnlocked(type, id) {

    const records = saveData[type];

    if (!Array.isArray(records)) {
        return false;
    }

    // 配列の場合はすべて取得済みか確認
    if (Array.isArray(id)) {
        return id.every(itemId =>
            records.some(item => item.id == itemId)
        );
    }

    // 単一IDの場合
    return records.some(item => item.id == id);

}

/**
 * アイテムが既読か確認
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 既読か
 */
export function isRead(type, id) {

    const records = saveData[type];

    if (!Array.isArray(records)) {
        return false;
    }

    const target = records.find(item => item.id == id);

    return target?.read ?? false;

}

/**
 * アイテムを既読にする
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {void}
 */
export function markRead(type, id) {

    const records = saveData[type];

    // 対応していない種類なら処理しない
    if (!Array.isArray(records)) {
        return;
    }

    // 対象アイテムを取得
    const target = records.find(item => item.id == id);

    // 未取得なら処理しない
    if (!target) {
        return;
    }

    // 既読済みなら何もしない
    if (target.read) {
        return;
    }

    // 既読
    target.read = true;

    // 保存
    save();

}

/**
 * アイテムの表示タイトルを取得
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @param {string} defaultTitle 通常のタイトル
 * @returns {string} 表示タイトル
 */
export function getItemTitle(type, id, defaultTitle) {
    const records = saveData[type];

    if (!Array.isArray(records)) {
        return defaultTitle;
    }

    const target = records.find(item => item.id == id);

    return target?.title || defaultTitle;
}

// ====================================================================================================
// フラグ
// ====================================================================================================

/**
 * フラグを立てる
 * @param {string} name フラグ名
 * @returns {boolean} 新規フラグか
 */
export function flagOn(name) {

    // 既に立ってる？
    if (isFlagOn(name)) {
        return false;
    }

    // 解放
    saveData.flag.push(name);

    // 保存
    save();

    return true;

}

/**
 * フラグが立っているか
 * @param {string} name フラグ名
 * @returns {boolean} フラグが立っているか
 */
export function isFlagOn(name) {
    return saveData.flag.includes(name);
}