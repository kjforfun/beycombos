const Analysis = {

data: [],

init(data) {
    this.data = Array.isArray(data) ? data : [];
},

getBladeName(r) {
    if (r.上蓋 && r.上蓋.trim()) {
        return r.上蓋.trim();
    }

    if (r.英文 && r.英文.trim()) {
        return `【待釐正】(${r.英文.trim()})`;
    }

    return '';
},

filter({
    blade = '',
    ratchet = '',
    bit = '',
    place = ''
} = {}) {

    return this.data.filter(r => {

        const bladeName = this.getBladeName(r);

        return (!blade || bladeName === blade)
            && (!ratchet || r.固鎖 === ratchet)
            && (!bit || r.軸 === bit)
            && (!place || r.名次 === place);

    });

},

countBy(rows, key) {

    const m = {};

    rows.forEach(r => {

        let value = '';

        if (key === '上蓋') {
            value = this.getBladeName(r);
        } else {
            value = r[key];
        }

        if (!value) return;

        m[value] = (m[value] || 0) + 1;

    });

    return Object.entries(m)
        .sort((a, b) => b[1] - a[1]);

},

getBladeRanking(rows) {
    return this.countBy(rows, '上蓋');
},

getBitRanking(rows) {
    return this.countBy(rows, '軸');
},

getRatchetRanking(rows) {

    return this.countBy(rows, '固鎖')
        .sort((a, b) => this.compareRatchet(a[0], b[0]));

},

compareRatchet(a, b) {

    const pa = this.parseRatchet(a);
    const pb = this.parseRatchet(b);

    if (pa.main !== pb.main) return pa.main - pb.main;
    return pa.height - pb.height;

},

parseRatchet(value) {

    const text = String(value || '');
    const match = text.match(/^(\d+)-(\d+)$/);

    if (!match) {
        return {
            main: 999,
            height: 999
        };
    }

    return {
        main: Number(match[1]),
        height: Number(match[2])
    };

},

getTopCombos(rows, limit = 3) {

    const combos = {};

    rows.forEach(r => {

        const blade = this.getBladeName(r);
        const ratchet = r.固鎖;
        const bit = r.軸;

        if (!blade || !ratchet || !bit) return;

        const key = `${blade}|${ratchet}|${bit}`;

        if (!combos[key]) {

            combos[key] = {
                blade,
                ratchet,
                bit,
                count: 0,
                win: 0
            };

        }

        combos[key].count++;

        if (String(r.名次 || '').toUpperCase().includes('1ST')) {
            combos[key].win++;
        }

    });

    return Object.values(combos)
        .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return b.win - a.win;
        })
        .slice(0, limit);

},

getSummary(rows) {

    return {

        total: rows.length,

        bladeTop:
            this.getBladeRanking(rows)[0]?.[0] || '',

        ratchetTop:
            this.getRatchetRanking(rows)[0]?.[0] || '',

        bitTop:
            this.getBitRanking(rows)[0]?.[0] || ''

    };

},

getPlaceLabel(place) {

    switch (place) {

        case '1st':
            return '🏆 冠軍';

        case '2nd':
            return '2nd';

        case '3rd':
            return '3rd';

        default:
            return '全部';

    }

}

};
