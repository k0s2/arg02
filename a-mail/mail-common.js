// ====================================================================================================
// インポート
// ====================================================================================================

// 共通
import { updateMailBadge } from "../js/common.js";

// メール情報
import { getMails } from "../data/mail.js";

// セーブデータ
import {
    getMailRecords,
    addMailRecord,
    updateMailRecord,
} from "../data/save.js";

// ====================================================================================================
// 共通メソッド
// ====================================================================================================

/**
 * 現在年月日を取得
 * @param {Number} dayPlus 加算する日付
 * @returns 現在年月日＋加算する日付（yyyy/mm/dd）
 */
function getDate(dayPlus = 0) {
    // 現在日付を取得
    const date = new Date();

    // 加算
    date.setDate(date.getDate() + dayPlus);

    // 整形して返す
    return date.getFullYear() + "/" + String(date.getMonth() + 1).padStart(2, "0") + "/" + String(date.getDate()).padStart(2, "0");
};

/**
 * メール情報の取得
 * @param {String} box "receive":受信ボックス / "send":送信ボックス / "favorite":お気に入り
 * @returns {Object[]} メール情報の配列
 */
export function getBoxMails(box) {

    // メール管理データを取得
    const records = getMailRecords();

    // 対象メールを抽出
    let targets = [];

    switch (box) {
        case "receive":
        case "send":
            targets = records.filter(mail => mail.type == box);
            break;

        case "favorite":
            targets = records.filter(mail => mail.favorite);
            break;
    }

    // メール情報を取得
    return getMails(targets.map(mail => mail.id));
}

/**
 * メールIDの追加
 * @param {String} box "receive":受信ボックス / "send":送信ボックス
 * @param {String} id メールID
 * @param {Boolean} read 既読状態
 * @param {String} date 受信・送信日
 */
export function addBoxMail(box, id, read = false, date = null) {

    // 受信・送信以外は処理しない
    if (box != "receive" && box != "send") {
        return;
    }

    // メールを追加
    const added = addMailRecord(
        box,
        id,
        date || getDate(),
        read,
    );

    // 新着メールバッジの更新
    if (added) {
        updateMailBadge();
    }
}

/**
 * メールのお気に入り登録
 * @param {String} id メールID
 */
export function addFavorite(id) {
    updateMailRecord(id, {
        favorite: true,
    });
}

/**
 * メールのお気に入り解除
 * @param {String} id メールID
 */
export function removeFavorite(id) {
    updateMailRecord(id, {
        favorite: false,
    });
}

/**
 * お気に入り状態の取得
 * @param {String} id メールID
 * @returns {Boolean} お気に入り状態
 */
export function isFavorite(id) {
    const mail = getMailRecords().find(mail => mail.id == id);

    return mail?.favorite || false;
}

/**
 * 既読情報の取得
 * @param {String} id メールID
 * @returns {Object} 既読情報
 */
export function getMailStatus(id) {
    const mail = getMailRecords().find(mail => mail.id == id);

    if (!mail) {
        return null;
    }

    return {
        readed: mail.read,
        date: mail.date,
    };
}

/**
 * 既読状態の変更
 * @param {String} id メールID
 * @param {Boolean} read 既読状態(デフォルト：true)
 */
export function setMailRead(id, read = true) {

    // 既読状態を更新
    const updated = updateMailRecord(id, {
        read,
    });

    // 新着メールバッジの更新
    if (updated) {
        updateMailBadge();
    }
}

/**
 * 共通初期化処理
 */
export async function initFavorite() {

    // カテゴリー（URLから取得）
    let currentCategory = location.hash.slice(1);

    // 詳細画面の場合
    if (location.href.includes("detail")) {

        // 一文字目を取得
        const type = currentCategory.charAt(0);

        switch (type) {
            case "r":
                currentCategory = "receive";
                break;

            case "s":
                currentCategory = "send";
                break;

            default:
        }
    }

    // --------------------------------------------------
    // サイドバー
    // --------------------------------------------------

    // 一旦全てアクティブ解除
    document.querySelectorAll("#sideBar .buttons li").forEach(element => {
        element.classList.remove("is-active");
    });

    // 対象カテゴリーをアクティブ
    document.querySelector("#button-" + currentCategory)?.classList.add("is-active");

    // 受信ボックス
    document.querySelector("#button-receive:not(.is-active)")?.addEventListener("click", () => {

        // 「受信ボックス」ページへ遷移
        location.href = new URL("../list/#receive", location.href).href

    });

    // 送信ボックス
    document.querySelector("#button-send:not(.is-active)")?.addEventListener("click", () => {

        // 「送信ボックス」ページへ遷移
        location.href = new URL("../list/#send", location.href).href

    });

    // お気に入り
    document.querySelector("#button-favorite:not(.is-active)")?.addEventListener("click", () => {

        // 「お気に入り」ページへ遷移
        location.href = new URL("../list/#favorite", location.href).href

    });

    // ハッシュが切り替わった際に発火
    window.addEventListener("hashchange", () => {
        // ページのリロード
        location.reload();
    });

    // --------------------------------------------------
    // 新着件数を表示
    // --------------------------------------------------

    // 受信メールを取得
    const mails = getMailRecords().filter(mail => mail.type == "receive");

    // 件数を取得
    const countNew = mails.filter(mail => !mail.read).length;

    // 描画
    const targetNew = document.querySelector("#button-receive .count");

    if (targetNew) {
        targetNew.textContent = countNew || "";
        targetNew.classList.toggle("new", countNew >= 1);
    }

    // --------------------------------------------------
    // お気に入り
    // --------------------------------------------------

    const targetsFavorite = document.querySelectorAll(".mailRow:not(.header) > .star[favoriteId]");

    targetsFavorite.forEach(target => {

        // お気に入り済みか
        if (isFavorite(target.getAttribute("favoriteId"))) {
            target.classList.add("is-favorite");
        }

        // クリックイベントを設定
        target.addEventListener("click", (event) => {

            // 詳細遷移イベントを発火しないようにする
            event.stopPropagation();

            // ID
            const favoriteId = target.getAttribute("favoriteId");

            // ●お気に入り済み
            if (isFavorite(favoriteId)) {

                // お気に入り解除
                removeFavorite(favoriteId);

                // クラス除去
                target.classList.remove("is-favorite");

            }
            // ●それ以外の場合
            else {

                // お気に入り登録
                addFavorite(favoriteId);

                // クラス付与
                target.classList.add("is-favorite");

            }

        });

    });

}