// ====================================================================================================
// ファイル内メソッド
// ====================================================================================================

// --------------------------------------------------
// 設定
// --------------------------------------------------

const SAVE_KEY = "remains13_save";

const SAVE_VERSION = "1.00";

// --------------------------------------------------
// 初期セーブデータ
// --------------------------------------------------

function createInitialSave() {

    return {

        // バージョン
        version: SAVE_VERSION,

        // 進行フラグ
        flag: [],

        // 取得済み
        unlocked: {
            evidence: [
                "001",
            ],
            person: [
                "001",
            ],
        },

        // 既読
        read: {
            evidence: [],
            person: [],
        },

        // メール
        mail: [],

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

    try {

        const parsedData = JSON.parse(savedData);

        // バージョン確認
        if (parsedData.version !== SAVE_VERSION) {
            return createInitialSave();
        }

        // データ形式の確認
        if (
            typeof parsedData.unlocked !== "object"
            || parsedData.unlocked === null
            || typeof parsedData.read !== "object"
            || parsedData.read === null
        ) {
            return createInitialSave();
        }

        // 各カテゴリの配列を確認
        const types = ["evidence", "person"];

        types.forEach((type) => {

            if (!Array.isArray(parsedData.unlocked[type])) {
                parsedData.unlocked[type] = [];
            }

            if (!Array.isArray(parsedData.read[type])) {
                parsedData.read[type] = [];
            }

        });

        return parsedData;

    } catch (error) {

        // 読み込みに失敗した場合は初期状態に戻す
        return createInitialSave();

    }

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
// ファイル外メソッド
// ====================================================================================================

// --------------------------------------------------
// 情報
// --------------------------------------------------

/**
 * 解放済みIDを取得
 * @param {string} type データの種類
 * @returns {Array} 解放済みID
 */
export function getUnlockedIds(type) {

    if (!Array.isArray(saveData.unlocked[type])) {
        return [];
    }

    return saveData.unlocked[type].slice();

}

/**
 * 未読IDを取得
 * @param {string} type データの種類
 * @returns {Array} 未読ID
 */
export function getUnreadIds(type) {

    const unlockedIds = saveData.unlocked[type];
    const readIds = saveData.read[type];

    if (!Array.isArray(unlockedIds)) {
        return [];
    }

    if (!Array.isArray(readIds)) {
        return [];
    }

    return unlockedIds.filter((id) => {

        return !readIds.includes(id);

    });

}

/**
 * アイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 新規解放されたか
 */
export function unlockItem(type, id) {

    const ids = saveData.unlocked[type];

    // 対応していない種類なら処理しない
    if (!Array.isArray(ids)) {
        return false;
    }

    // 解放済みなら処理しない
    if (ids.includes(id)) {
        return false;
    }

    // 解放
    ids.push(id);

    // 保存
    save();

    return true;

}

/**
 * アイテムが取得済みか確認
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 取得済みか
 */
export function isUnlocked(type, id) {

    const ids = saveData.unlocked[type];

    if (!Array.isArray(ids)) {
        return false;
    }

    return ids.includes(id);

}

/**
 * アイテムが既読か確認
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 既読か
 */
export function isRead(type, id) {

    const ids = saveData.read[type];

    if (!Array.isArray(ids)) {
        return false;
    }

    return ids.includes(id);

}

/**
 * アイテムを既読にする
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {void}
 */
export function markRead(type, id) {

    const unlockedIds = saveData.unlocked[type];
    const readIds = saveData.read[type];

    // 未解放のアイテムは既読にできない
    if (!Array.isArray(unlockedIds)) {
        return;
    }

    if (!unlockedIds.includes(id)) {
        return;
    }

    if (!Array.isArray(readIds)) {
        return;
    }

    // 既読済みなら何もしない
    if (readIds.includes(id)) {
        return;
    }

    // 既読
    readIds.push(id);

    // 保存
    save();

}

// --------------------------------------------------
// フラグ
// --------------------------------------------------

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

// --------------------------------------------------
// メール
// --------------------------------------------------

/**
 * メールを受け取っているか
 * @param {string} mailId メールID
 * @returns {boolean} メールを受け取っているか
 */
export function isReceivedMail(mailId) {
    return saveData.mail.filter(item => (item.id == mailId)).length >= 1;
}