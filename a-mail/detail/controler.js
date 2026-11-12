// ====================================================================================================
// インポート
// ====================================================================================================

// ダイアログ
import { showSystemDialog, showMindDialog } from "../../common/template/dialog/controler.js";

// メール情報
import { getMails } from "../data/mail.js";

// 返信情報
import { getReplyData } from "../data/reply.js";

// メール共通
import { initFavorite, addBoxMail, setMailRead, getMailStatus, getBoxMails } from "../controler.js";

// ====================================================================================================
// 準備
// ====================================================================================================

// 要素取得
const targetDetail = document.querySelector("#area-main #detail");

// 表示中のメールID（URLから取得）
const currentId = location.hash.slice(1);;

// ====================================================================================================
// 初期化
// ====================================================================================================

// 受信メールか
const isReceive = (currentId.includes("r"));

// --------------------------------------------------
// イベント設定
// --------------------------------------------------

// 「一覧へ戻る」ボタン
targetDetail.querySelector(".detailHeader button#button-return").addEventListener("click", () => {

    // メール一覧ページへ遷移
    const category = (isReceive) ? "receive" : "send";
    window.location.href = new URL("../list/#" + category, location.href).href;

});

// 「返信する」ボタン
const buttonReply = targetDetail.querySelector("#button-reply");
if (isReceive) {
    buttonReply.addEventListener("click", async () => {

        // 返信情報を取得
        let reply = getReplyData(currentId);

        // ●文字化けメール
        if (reply == undefined) {
            showSystemDialog("退会済みユーザーには返信できません。");
        }
        // ●選択肢あり
        else {
            // 受信済みメールのIDを取得
            const receivedIds = getBoxMails("receive").map(mail => mail.id);

            // 返信済み選択肢は除外
            reply = reply.filter(item => !receivedIds.includes("r" + item.mailNo));

            // 選択肢がある
            if (reply.length >= 1) {
                // 選択ダイアログを表示
                const result = await showMindDialog(
                    "なんと返そうか？",
                    "返信する",
                    reply.map(item => item.text),
                );

                // ●選択された場合
                if (result >= 0) {
                    // 返信を、送信ボックスへ追加
                    addBoxMail("send", "s" + reply[result].mailNo);

                    // 返信への返信を、受信ボックスへ追加
                    addBoxMail("receive", "r" + reply[result].mailNo);

                    // 「受信ボックス」ページへ遷移
                    location.href = new URL("../list/#receive", location.href).href
                }
            }
            // ●それ以外
            else {
                showMindDialog("返信の必要は無いな。");
            }
        }

    });
} else {
    buttonReply.classList.add("is-hidden");
}

// --------------------------------------------------
// ヘッダー
// --------------------------------------------------

// 受信者／送信者
document.querySelector(".mailRow.header > .user").textContent = (isReceive) ? "送信者" : "受信者";

// --------------------------------------------------
// ディティール
// --------------------------------------------------

// メール情報を取得
const data = getMails(currentId)[0];

// お気に入り
const star = targetDetail.querySelector("#mailInfo .star");
if (isReceive) {
    star.innerHTML = "★";
    star.setAttribute("favoriteId", data.id);
}

// 送信者
targetDetail.querySelector("#mailInfo .user").innerHTML = data.user;

// 件名
targetDetail.querySelector("#mailInfo .title").innerHTML = data.title;

// 受信日時
targetDetail.querySelector("#mailInfo .date").innerHTML = getMailStatus(data.id).date;

// 本文
targetDetail.querySelector(".message>p").innerHTML = data.message;

// 既読情報の登録
setMailRead(data.id);

// --------------------------------------------------
// 共通初期化処理
// --------------------------------------------------

initFavorite();