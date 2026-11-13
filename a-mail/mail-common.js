// ====================================================================================================
// インポート
// ====================================================================================================

// 共通
import { updateMailBadge } from "../js/common.js";

// メール情報
import { getMails } from "../data/mail.js";

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
 *メール情報の取得
 * @param {String} box "receive":受信ボックス / "send":送信ボックス / "favorite":お気に入り
 */
export function getBoxMails(box) {
    const ids = JSON.parse(localStorage.getItem("mail-" + box) || "[]");
    return getMails(ids);
}

/**
 * メールIDの追加
 * @param {String} box "receive":受信ボックス / "send":送信ボックス / "favorite":お気に入り
 * @param {String} id メールID
 * @param {String} date メールID
 */
export function addBoxMail(box, id, readed = false, date = null) {
    // 登録済みのメールIDを取得
    const ids = JSON.parse(localStorage.getItem("mail-" + box) || "[]");

    // 登録済みでない場合
    if (!ids.includes(id)) {
        // 追加
        ids.unshift(id);
        localStorage.setItem("mail-" + box, JSON.stringify(ids));

        // 既読情報の登録
        setMailRead(id, readed, date);
    }
}

/**
 * メールのお気に入り登録
 * @param {String} id メールID
 */
export function addFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem("mail-favorite") || "[]");

    if (!favorites.includes(id)) {
        favorites.push(id);
        localStorage.setItem("mail-favorite", JSON.stringify(favorites));
    }
}

/**
 * メールのお気に入り解除
 * @param {String} id メールID
 */
export function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("mail-favorite") || "[]");

    favorites = favorites.filter(item => item !== id);

    localStorage.setItem("mail-favorite", JSON.stringify(favorites));
}

/**
 * お気に入り状態の取得
 * @param {String} id メールID
 * @returns {Boolean} お気に入り状態
 */
export function isFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem("mail-favorite") || "[]");

    return favorites.includes(id);
}

/**
 * 既読情報の取得
 * @param {String} id メールID
 * @returns {Object} 既読情報
 */
export function getMailStatus(id) {
    const status = JSON.parse(localStorage.getItem("mail-status") || "{}");
    return status[id] || null;
}

/**
 * 既読状態の変更
 * @param {String} id メールID
 * @param {Boolean} readed 既読状態(デフォルト：true)
 */
export function setMailRead(id, readed = true, date = null) {
    const status = JSON.parse(localStorage.getItem("mail-status") || "{}");

    status[id] = {
        readed,
        date: date || getDate(),
    };

    localStorage.setItem("mail-status", JSON.stringify(status));

    // 新着メールバッジの更新
    updateMailBadge();
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

    // 受信ボックスを取得
    let mails = getBoxMails("receive");

    // 件数を取得
    const countNew = mails.filter(mail => (!getMailStatus(mail.id).readed)).length;

    // 描画
    const targetNew = document.querySelector("#button-receive .count");
    targetNew.textContent = countNew || "";
    targetNew.classList.toggle("new", countNew >= 1);

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