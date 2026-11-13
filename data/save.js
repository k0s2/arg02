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

        // 証拠
        evidence: [
            // 古びた便箋
            {
                id: "001",
                read: false,
            },
        ],

        // 人物
        person: [
            // 谷戸　俊道
            {
                id: "001",
                read: false,
            },
        ],

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
            !Array.isArray(parsedData.flag)
            || !Array.isArray(parsedData.evidence)
            || !Array.isArray(parsedData.person)
            || !Array.isArray(parsedData.mail)
        ) {
            return createInitialSave();
        }

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
 * @param {number|string} id アイテムID
 * @returns {boolean} 取得済みか
 */
export function isUnlocked(type, id) {

    const records = saveData[type];

    if (!Array.isArray(records)) {
        return false;
    }

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
 * メール情報を取得
 * @returns {Object[]} メール情報
 */
export function getMailRecords() {
    return saveData.mail;
}

/**
 * メールを追加
 * @param {string} type receive / send
 * @param {string} id メールID
 * @param {string} date 受信・送信日
 * @param {boolean} read 既読状態
 * @returns {boolean} 新規追加されたか
 */
export function addMailRecord(type, id, date, read = false) {

    // 対応していない種類なら処理しない
    if (type != "receive" && type != "send") {
        return false;
    }

    // 登録済みなら処理しない
    if (saveData.mail.some(mail => mail.id == id)) {
        return false;
    }

    // メールを追加
    saveData.mail.unshift({
        type,
        id,
        date,
        favorite: false,
        read,
    });

    // 保存
    save();

    return true;

}

/**
 * メール情報を更新
 * @param {string} id メールID
 * @param {Object} updates 更新内容
 * @returns {boolean} 更新されたか
 */
export function updateMailRecord(id, updates) {

    const mail = saveData.mail.find(mail => mail.id == id);

    if (!mail) {
        return false;
    }

    Object.assign(mail, updates);

    // 保存
    save();

    return true;

}

/**
 * メールを受け取っているか
 * @param {string} mailId メールID
 * @returns {boolean} メールを受け取っているか
 */
export function isReceivedMail(mailId) {
    return saveData.mail.some(item => item.id == mailId && item.type == "receive");
}