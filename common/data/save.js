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
        // 起動日
        date: null,

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
// セーブデータをロード
// --------------------------------------------------

// ロード
const saveData = loadSave();

// 起動日が未登録の場合
if (!saveData.date) {
    const today = new Date();

    // ローカル日付を保存
    saveData.date = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    save();
}

// ====================================================================================================
// 起動日
// ====================================================================================================

/**
 * ゲーム起動日を取得
 * @returns {Date} ゲーム起動日
 */
export function getGameStartDate() {
    const [year, month, day] = saveData.date.split("-").map(Number);

    return new Date(year, month - 1, day);
}

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
 * @returns {boolean} 新規解放されたか
 */
export function unlockItem(type, id) {
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
    records.push({
        id,
        read: false,
    });

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

// ====================================================================================================
// 追記情報
// ====================================================================================================

/**
 * 追記情報が解放済みか確認
 * @param {string} type データの種類
 * @param {string} id アイテムID
 * @param {string} targetId 組み合わせる相手のID
 * @returns {boolean} 解放済みか
 */
export function isAddInfoUnlocked(type, id, targetId) {

    const records = saveData[type];

    // 対応していない種類なら処理しない
    if (!Array.isArray(records)) {
        return false;
    }

    // 対象アイテムを取得
    const target = records.find(item => item.id == id);

    return target?.addInfo?.[targetId] === true;

}

/**
 * 推理成功時に追記情報を解放
 * @param {string} evidenceId 【証拠】ID
 * @param {string} personId 【人物】ID
 * @returns {boolean} 新規解放されたか
 */
export function completeInference(evidenceId, personId) {

    // 【証拠】を取得
    const evidence = saveData.evidence.find(
        item => item.id == evidenceId
    );

    // 【人物】を取得
    const person = saveData.person.find(
        item => item.id == personId
    );

    // 対象が存在しない場合
    if (!evidence || !person) {
        return false;
    }

    // addInfoが存在しない場合は初期化
    if (!evidence.addInfo || typeof evidence.addInfo !== "object") {
        evidence.addInfo = {};
    }

    if (!person.addInfo || typeof person.addInfo !== "object") {
        person.addInfo = {};
    }

    // 既に推理済みの場合
    if (
        evidence.addInfo[personId] === true
        && person.addInfo[evidenceId] === true
    ) {
        return false;
    }

    // 追記情報を解放
    evidence.addInfo[personId] = true;
    person.addInfo[evidenceId] = true;

    // 保存
    // save();

    return true;

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