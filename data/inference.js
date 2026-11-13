export default [

    // 「古びた便箋」×「谷戸　亮介」
    {
        evidenceId: "001",
        personId: "002",
        newInfo: [
            // 「祖父の遺した手紙」
            {
                type: "evidence",
                id: "002",
            },
        ],
        dialog: [
            'そうだ。これはじいちゃんが残した手紙だ。',
            '',
            '宛名も無いし、家族だし、読んでもいいよな？',
        ]
    },

    // 「立花という人物」×「谷戸　道江」
    {
        evidenceId: "201",
        personId: "005",
        newInfo: [
            // 「立花　幸男」
            {
                type: "person",
                id: "201",
            },
        ],
        dialog: [
            '母さんの旧姓も「立花」だ。',
            '何か知ってるかもしれない。訊いてみよう。',
        ]
    },

]