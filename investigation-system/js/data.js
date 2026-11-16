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
// 日付置換
// ====================================================================================================

// 日付置換パターン
const DATE_PATTERN = /\{date(?:\(\s*([+-]?\d+)?\s*(?:,\s*["']([^"']*)["'])?\s*\))?\}/g;

/**
 * 日付指定を含む文字列を置換
 * @param {string} text 元の文章
 * @returns {string} 置換した文章
 */
export function formatDateText(text) {

    // ゲーム起動日を取得
    const baseDate = getGameStartDate();

    return text.replace(
        DATE_PATTERN,
        (match, offset, format) => {

            // 基準日を複製
            const date = new Date(baseDate);

            // 指定日数を加算
            date.setDate(date.getDate() + Number(offset || 0));

            // 日付の各要素
            const values = {
                yyyy: String(date.getFullYear()),
                yy: String(date.getFullYear()).slice(-2),
                mm: String(date.getMonth() + 1).padStart(2, "0"),
                m: String(date.getMonth() + 1),
                dd: String(date.getDate()).padStart(2, "0"),
                d: String(date.getDate()),
            };

            // 表示形式
            const pattern = format || "yyyy/mm/dd";

            return pattern.replace(
                /yyyy|yy|mm|m|dd|d/g,
                token => values[token]
            );

        }
    );

}

// ====================================================================================================
// アイテム解放
// ====================================================================================================

/**
 * 指定したアイテムを解放
 * @param {string} type データの種類
 * @param {number|string} id アイテムID
 * @returns {boolean} 新規解放されたか
 */
export function acquireItem(type, id) {

    // データが存在するか確認
    const item = getItemData(type, id);

    if (item === undefined) {
        return false;
    }

    // 解放
    return unlockItem(type, id);

}