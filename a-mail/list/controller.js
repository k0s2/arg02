// ====================================================================================================
// インポート
// ====================================================================================================

// --------------------------------------------------
// メール
// --------------------------------------------------

import { initFavorite, getBoxMails, getMailStatus } from "../mail-common.js";

// --------------------------------------------------
// セーブデータ
// --------------------------------------------------

import {
    flagOn,
} from "../../data/save.js";

// ====================================================================================================
// 初期化
// ====================================================================================================

// カテゴリー（URLから取得）
const currentCategory = location.hash.slice(1);

// 送信ボックスか
const isSend = (currentCategory == "send");

// 要素取得
const targetList = document.getElementById("list");

// --------------------------------------------------
// 【ストーリー進行】ヘッダーボタン解放
// --------------------------------------------------

flagOn("release-mail");

// --------------------------------------------------
// メール情報を取得
// --------------------------------------------------

let mails = getBoxMails(currentCategory);

// --------------------------------------------------
// メールヘッダー
// --------------------------------------------------

// 受信者／送信者
document.querySelector(".mailRow.header > .user").textContent = (isSend) ? "受信者" : "送信者";

// --------------------------------------------------
// メールデータを展開
// --------------------------------------------------

mails.forEach((data) => {

    // 親要素を生成
    const elementParent = document.createElement("li");
    elementParent.classList.add("mailRow");

    // 新着メール
    if (
        currentCategory != "send"
        && getMailStatus(data.id).readed == false
    ) {
        elementParent.classList.add("new");
    }

    // お気に入り
    const elementStar = document.createElement("div");
    elementStar.classList.add("star");
    if (!isSend) {
        elementStar.innerHTML = "★";
        elementStar.setAttribute("favoriteId", data.id);
    }
    elementParent.appendChild(elementStar);

    // 送信者
    const elementUser = document.createElement("div");
    elementUser.classList.add("user");
    elementUser.innerHTML = data.user;
    elementParent.appendChild(elementUser);

    // 件名
    const elementTitle = document.createElement("div");
    elementTitle.classList.add("title");
    elementTitle.innerHTML = data.title;
    elementParent.appendChild(elementTitle);

    // 受信日時
    const elementDate = document.createElement("div");
    elementDate.classList.add("date");
    elementDate.innerHTML = getMailStatus(data.id).date;
    elementParent.appendChild(elementDate);

    // クリックイベント
    elementParent.addEventListener("click", () => {
        // メール詳細ページへ遷移
        window.location.href = new URL("../detail/#" + data.id, location.href).href;
    });

    // メール一覧に追加
    targetList.querySelector("ul").appendChild(elementParent);

});

// 共通初期化処理
initFavorite();