// ====================================================================================================
// データ取得
// ====================================================================================================

// --------------------------------------------------
// インポート
// --------------------------------------------------

// 証拠データ
import evidenceData from "../../data/evidence.js";

// 人物データ
import personData from "../../data/person.js";

// ====================================================================================================
// データ取得
// ====================================================================================================

/**
 * 証拠データを取得
 * @param {string} id 証拠ID
 * @returns {Object|undefined} 該当する証拠データ
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
 * 人物データを取得
 * @param {string} id 人物ID
 * @returns {Object|undefined} 該当する人物データ
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