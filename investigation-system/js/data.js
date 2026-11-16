// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// データ
// --------------------------------------------------

// 【証拠】
import evidenceData from "../../data/evidence.js";

// 【人物】
import personData from "../../data/person.js";

// セーブ
import {
    unlockItem,
    getGameStartDate,
} from "../../data/save.js";

// ====================================================================================================
// データ取得
// ====================================================================================================

/**
 * 【証拠】データを取得
 * @param {string} id 【証拠】ID
 * @returns {Object|undefined} 該当する【証拠】データ
 */
export function getEvidence(id) {

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
 * 【人物】データを取得
 * @param {string} id 【人物】ID
 * @returns {Object|undefined} 該当する【人物】データ
 */
export function getPerson(id) {

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
export function getItemData(type, id) {
    // 【証拠】
    if (type === "evidence") {
        return getEvidence(id);
    }

    // 【人物】
    if (type === "person") {
        return getPerson(id);
    }

    // 不一致
    return undefined;
}

/**
 * 項目が属するカテゴリー名を取得
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {string} カテゴリー名
 */
export function getItemCategory(type, id) {

    let groups = [];

    if (type === "evidence") {
        groups = evidenceData;
    }

    if (type === "person") {
        groups = personData;
    }

    for (const group of groups) {

        const exists = group.items.some((item) => {
            return item.id === id;
        });

        if (exists) {
            return group.name;
        }

    }

    return "";

}

// ====================================================================================================
// アイテム解放
// ====================================================================================================

// 日付置換パターン
const DATE_PATTERN = /\{date(?:\(\s*([+-]?\d+)?\s*(?:,\s*["']([^"']*)["'])?\s*\))?\}/g;

/**
 * 日付指定が含まれているか確認
 * @param {string} text 対象の文章
 * @returns {boolean}
 */
function hasDateToken(text) {
    DATE_PATTERN.lastIndex = 0;

    const exists = DATE_PATTERN.test(text);

    DATE_PATTERN.lastIndex = 0;

    return exists;
}

/**
 * 日付指定を置換
 * @param {string} text 元の文章
 * @param {Date} baseDate 基準日
 * @returns {string|undefined} 生成した文章
 */
function formatAcquiredText(text, baseDate) {

    // 日付指定がなければ保存しない
    if (!hasDateToken(text)) {
        return undefined;
    }

    // 日付指定を置換
    return text.replace(
        DATE_PATTERN,
        (match, offset, format) => {
            const date = new Date(baseDate);

            // 基準日から指定日数を加算
            date.setDate(date.getDate() + Number(offset || 0));

            // 表示形式
            const values = {
                yyyy: String(date.getFullYear()),
                yy: String(date.getFullYear()).slice(-2),
                mm: String(date.getMonth() + 1).padStart(2, "0"),
                m: String(date.getMonth() + 1),
                dd: String(date.getDate()).padStart(2, "0"),
                d: String(date.getDate()),
            };

            // 形式を指定していない場合
            const pattern = format || "yyyy/mm/dd";

            return pattern.replace(
                /yyyy|yy|mm|m|dd|d/g,
                token => values[token]
            );
        }
    );

}

/**
 * 日付指定を含むタイトルを生成
 * @param {string} title 元のタイトル
 * @param {Date} baseDate 基準日
 * @returns {string|undefined} 生成したタイトル
 */
function createAcquiredTitle(title, baseDate) {
    return formatAcquiredText(title, baseDate);
}

/**
 * 日付指定を含む詳細本文を生成
 * @param {Array} detail 元の詳細本文
 * @param {Date} baseDate 基準日
 * @returns {Array|undefined} 生成した詳細本文
 */
function createAcquiredDetail(detail, baseDate) {

    // 日付指定がなければ保存しない
    if (!detail.some(text => hasDateToken(text))) {
        return undefined;
    }

    // 各文章の日付を置換
    return detail.map(text =>
        formatAcquiredText(text, baseDate) ?? text
    );

}

/**
 * 指定したアイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 新規解放されたか
 */
export function acquireItem(type, id) {
    // データを取得
    const item = getItemData(type, id);

    // データが存在しない場合
    if (item === undefined) {
        return false;
    }

    // ゲーム起動日を取得
    const baseDate = getGameStartDate();

    // 基準日からタイトルと詳細を生成
    const title = createAcquiredTitle(item.name, baseDate);
    const detail = createAcquiredDetail(item.detail, baseDate);

    // セーブデータに解放状態と置換結果を登録
    return unlockItem(type, id, title, detail);
}