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

    // セーブデータに解放状態を登録
    return unlockItem(type, id);

}