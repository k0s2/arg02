export default [

    // --------------------------------------------------
    // 祖母の葬式
    // --------------------------------------------------

    {
        id: "1",
        name: "祖母の葬式",
        items: [

            // 古びた便箋
            {
                id: "001",
                name: "古びた便箋",
                note: "祖母の遺品整理で見つかった便箋",
            },

            // 祖父の遺した手紙
            {
                id: "002",
                name: "祖父の遺した手紙",
                note: "古びた便箋の中身は、祖父の手紙だった",
                detail: [
                    '<button class="keyword" getPerson="003">俊子</button>へ',
                    '',
                    '俺はもう帰って来られないだろう。',
                    '<button class="keyword" getEvidence="301">風路山</button>には、触れるべきでない存在が眠っていた。',
                    'みんな死んでしまった。いや、殺されたんだ。私も彼らの後を追うことになるだろう。',
                    '',
                    '<button class="keyword" getPerson="004">俊介</button>、<button class="keyword" getPerson="005">道江</button>さん、そして俊道には、このことは伝えないでほしい。',
                    'お前だけを危険に晒すことになってしまうが、どうか許してほしい。',
                    'もし、身の危険を感じたならば、<button class="keyword" getEvidence="003">立花</button>を頼ってくれ。あいつなら、きっと助けになってくれるだろう。',
                    '',
                    '最後に。',
                    '愛しているよ。',
                    '',
                    '亮介',
                ],
            },

            // 立花という人物
            {
                id: "003",
                name: "立花という人物",
                note: "祖父の手紙に書かれていた、謎の人物",
                detail: [
                    'じいちゃんの手紙に書かれていた、謎の人物。',
                    '',
                    '頼れったって、どうやって……？',
                ],
            },

        ],
    },

    // --------------------------------------------------
    // 地名・施設
    // --------------------------------------------------

    {
        id: "3",
        name: "地名・施設",
        items: [

            // 風路山
            {
                id: "301",
                name: "風路山",
                note: "祖父が行方不明となった山",
                detail: [
                    '読みは「かざみちやま」。',
                    '俺は行ったことないけど、東北地方にあるらしい。',
                    '登山やスキー目的に訪れる人もいるらしいが、数は少ないようだ。',
                ],
            },

            // ペンション・グアルディアーノ
            {
                id: "302",
                name: "ペンション・グアルディアーノ",
                note: "立花が経営するペンション",
                detail: [
                    '<button class="keyword" getEvidence="301">風路山</button>の麓にある、立花が経営するペンション。',
                    '客入りは少ないようだが、何故か１０年以上続いている。',
                    '',
                    '連絡先は、<button class="keyword" getEvidence="201">guardiano@a-mail.co.jp</button>。',
                ],
            },

        ],
    },

    // --------------------------------------------------
    // 立花とのメール
    // --------------------------------------------------

    {
        id: "2",
        name: "立花とのメール",
        items: [

            // アーカイブ
            {
                id: "201",
                name: '最初のやり取り',
                note: "立花との、最初のやり取り",
                detail: [
                    '<span class="mailTitle">谷戸俊道　t.yato@a-mail.co.jp　[{date(-3, "yyyy/mm/dd")} 13:21]</span>',
                    '初めまして、あなたの甥の谷戸俊道です。',
                    '個人の連絡先が分からなかったので、お店のメールアドレス宛に連絡させていただきました。',
                    '',
                    '祖父の手紙にあなたの名前が書かれていたので、それについてお話させてください。',
                    '',
                    '返信お待ちしております。',

                    // --------------------------------------------------

                    '<span class="mailTitle">立花幸男　snow-man@a-mail.co.jp　[{date(-3, "yyyy/mm/dd")} 13:34]</span>',
                    '個人アカウントで返信する。',
                    '',
                    '手紙の内容を安易に出さなかったのは正解だ。',
                    'まあ、初めてやり取りする相手にあんな話を出そうと思う方が異常か。',
                    '',
                    '内容はおおむね把握している。',
                    'あれは、私が担当した事件だったからだ。',
                    '',
                    '元刑事の俺が投げ出した事件だ。それがどういう意味か分かるだろう。',
                    'それでも、お前はこの事件に踏み込む覚悟があるか？',

                    // --------------------------------------------------

                    '<span class="mailTitle">谷戸俊道　t.yato@a-mail.co.jp　[{date(-3, "yyyy/mm/dd")} 13:35]</span>',
                    'はい。どうしても。',

                    // --------------------------------------------------

                    '<span class="mailTitle">立花幸男　snow-man@a-mail.co.jp　[{date(-3, "yyyy/mm/dd")} 14:02]</span>',
                    '俺が警察から持ち出した情報を送る。',
                    '',
                    'それと、現役時代に使っていた捜査システムも送ろう。',
                    '情報を入力すれば、それらを照らし合わせて新たな情報を導き出してくれる優れものだ。',
                    '活用してくれ。',
                    '',
                    '<button class="keyword file get">investigation_system_setup.exe</button><button class="keyword file" getEvidence="202">case_kazamichi.pdf</button>',

                ],
            },

            // 風路山変死事案・概要
            {
                id: "202",
                name: "風路山変死事案・概要",
                note: "立花から送られてきた、警察の極秘情報の概要",
                detail: [
                    '事案に際して作成された警察資料は、以下の通り。',
                    '●<button class="keyword" getEvidence="401">実況見分調書</button>',
                    '●<button class="keyword" getEvidence="402"></button>',
                    '●<button class="keyword" getEvidence="403"></button>',
                    '',
                    '現場で発見された死体は、以下の通り。',
                    '●<button class="keyword" getPerson="401">６０代男性</button>',
                    '●<button class="keyword" getPerson="402">年齢不明・男性</button>',
                    '●<button class="keyword" getPerson="403">年齢不明・男性</button>',
                    '●<button class="keyword" getPerson="404">年齢不明・男性</button>',
                    '●<button class="keyword" getPerson="405">年齢不明・女性</button>',
                    '●<button class="keyword" getPerson="406">年齢不明・女性</button>',
                    '●<button class="keyword" getPerson="407">年齢不明・性別不明</button>',
                ],
            },

        ],
    },

    // --------------------------------------------------
    // 警察資料
    // --------------------------------------------------

    {
        id: "4",
        name: "警察資料",
        items: [

            // 実況見分調書
            {
                id: "401",
                name: '実況見分調書',
                note: "",
                detail: [
                    '現場は、<button class="keyword" getEvidence="302">ペンション・グアルディアーノ</button>とその周辺。',
                    'ペンションオーナー「<button class="keyword" getPerson="202">花山　芳次</button>」の許可を得て、実況見分を実施。',
                    '',
                    '<table>',
                    '  <tr>',
                    '    <th>作成日</th>',
                    '    <td>{date(-1825, "yyyy")}/08/09</td>',
                    '    <th>見分者</th>',
                    '    <td>司法警察員巡査長　立花幸男</td>',
                    '  </tr>',
                    '  <tr>',
                    '    <th>見分日時</th>',
                    '    <td colspan="3">{date(-1825, "yyyy")}/08/09　午前18時34分から午前20時30分までの間（天候　晴れ）</td>',
                    '  </tr>',
                    '  <tr>',
                    '    <th>発生日時</th>',
                    '    <td colspan="3">{date(-1825, "yyyy")}/08/06　午前07時04分頃（天候　曇り）</td>',
                    '  </tr>',
                    '</table>',
                    '',
                    '',
                    '',
                    '',
                    '',
                ],
            },

            // ペンション宿泊記録
            {
                id: "402",
                name: 'ペンション宿泊記録',
                note: "",
                detail: [
                    '',

                ],
            },

        ],
    },

]