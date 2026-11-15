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

/**
 * 取得時点の日付・時刻でタイトルを生成
 * @param {string} title 元のタイトル
 * @returns {string|undefined} 生成したタイトル
 */
function createAcquiredTitle(title) {

    // 動的な日付指定がなければ保存しない
    if (!/\{date\([+-]?\d+\)\}/.test(title)) {
        return undefined;
    }

    // 取得時点の日時
    const acquiredAt = new Date();

    // 日付・時刻を整形
    const formatDate = (date) => {
        const pad = (value) => {
            return String(value).padStart(2, "0");
        };

        return (
            `${date.getFullYear()}/`
            + `${pad(date.getMonth() + 1)}/`
            + `${pad(date.getDate())}`
        );
    };

    // 日付指定を置換
    return title.replace(
        /\{date\(([+-]?\d+)\)\}/g,
        (match, offset) => {
            const date = new Date(acquiredAt);

            // 指定日数を加算
            date.setDate(date.getDate() + Number(offset));

            return formatDate(date);
        }
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

    // 取得時点のタイトルを生成
    const title = createAcquiredTitle(item.name);

    // セーブデータに解放状態とタイトルを登録
    return unlockItem(type, id, title);
}