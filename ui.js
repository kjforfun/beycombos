const UI = {

render() {

  if (!Analysis.data.length) return;

  this.renderFilters();

  const rows = Analysis.filter({
    keyword: document.getElementById('keyword').value || '',
    blade: document.getElementById('bladeSelect').value || '',
    ratchet: document.getElementById('ratchetSelect').value || '',
    bit: document.getElementById('bitSelect').value || ''
  });

  document.getElementById('recordCount').textContent =
    `${rows.length} 筆`;

  this.renderTopCombos(rows);
  this.renderRankings(rows);
  this.renderResults(rows);
},

renderFilters() {

  const bladeSelect = document.getElementById('bladeSelect');
  const ratchetSelect = document.getElementById('ratchetSelect');
  const bitSelect = document.getElementById('bitSelect');

  const currentBlade = bladeSelect.value;
  const currentRatchet = ratchetSelect.value;
  const currentBit = bitSelect.value;

  // 全向連動(Faceted Filter)

  const rowsForBlade =
    Analysis.filter({
      keyword: '',
      blade: '',
      ratchet: currentRatchet || '',
      bit: currentBit || ''
    });

  const rowsForRatchet =
    Analysis.filter({
      keyword: '',
      blade: currentBlade || '',
      ratchet: '',
      bit: currentBit || ''
    });

  const rowsForBit =
    Analysis.filter({
      keyword: '',
      blade: currentBlade || '',
      ratchet: currentRatchet || '',
      bit: ''
    });

  // ===== 上蓋 =====

  const bladeMap = {};

  rowsForBlade.forEach(r => {

    let name = '';

    if (r.上蓋 && r.上蓋.trim()) {

      name = r.上蓋.trim();

    } else if (r.英文 && r.英文.trim()) {

      name = `【待釐正】(${r.英文.trim()})`;

    }

    if (!name) return;

    bladeMap[name] =
      (bladeMap[name] || 0) + 1;

  });

  const blades =
    Object.entries(bladeMap)
      .sort((a,b)=>b[1]-a[1])
      .map(([name,count])=>({
        name,
        count
      }));

  bladeSelect.innerHTML =
    '<option value="">上蓋</option>' +
    blades.map(x =>
      `<option value="${x.name}">${x.name} (${x.count})</option>`
    ).join('');

  // ===== 固鎖 =====

  const ratchets =
    [...new Set(
      rowsForRatchet
        .map(r => r.固鎖)
        .filter(Boolean)
    )]
    .sort((a,b)=>{

      const [a1,a2] =
        String(a).split('-').map(Number);

      const [b1,b2] =
        String(b).split('-').map(Number);

      if(a1!==b1) return a1-b1;

      return a2-b2;

    });

  ratchetSelect.innerHTML =
    '<option value="">固鎖</option>' +
    ratchets.map(x =>
      `<option value="${x}">${x}</option>`
    ).join('');

  // ===== 軸 =====

  const bits =
    [...new Set(
      rowsForBit
        .map(r => r.軸)
        .filter(Boolean)
    )]
    .sort();

  bitSelect.innerHTML =
    '<option value="">軸心</option>' +
    bits.map(x =>
      `<option value="${x}">${x}</option>`
    ).join('');

  // ===== 恢復選擇 =====

  if (
    [...bladeSelect.options]
      .some(o => o.value === currentBlade)
  ) {
    bladeSelect.value = currentBlade;
  } else {
    bladeSelect.value = '';
  }

  if (
    [...ratchetSelect.options]
      .some(o => o.value === currentRatchet)
  ) {
    ratchetSelect.value = currentRatchet;
  } else {
    ratchetSelect.value = '';
  }

  if (
    [...bitSelect.options]
      .some(o => o.value === currentBit)
  ) {
    bitSelect.value = currentBit;
  } else {
    bitSelect.value = '';
  }

},




  
renderTopCombos(rows) {

  const map = {};

rows.forEach(r => {

  const bladeName =
    r.上蓋 && r.上蓋.trim()
      ? r.上蓋
      : `【未翻譯】${r.英文 || ''}`;

  const key =
    `${bladeName}|${r.固鎖}${r.軸}`;

  if (!map[key]) {
    map[key] = {
      total: 0,
      win: 0
    };
  }

  map[key].total++;

  if (
    String(r.名次 || '')
      .toUpperCase()
      .includes('1ST')
  ) {
    map[key].win++;
  }

});

  const html =
    Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3)
      .map(([combo, data], idx) => {

       const [blade, setup] = combo.split('|');

return `
<div style="
  display:grid;
  grid-template-columns: 1.2fr 1.2fr 2fr;
  align-items:center;
  padding:4px 0;
  font-size:14px;
">

  <div style="
    text-align:left;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
  ">
    ${idx + 1}. <span style="color:red;">${blade}</span>
  </div>

  <div style="
    text-align:center;
    color:#002244;
    font-weight:bold;
  ">
    ${setup}
  </div>

  <div style="
    text-align:right;
    color:#666;
    white-space:nowrap;
  ">
    ${data.total}次(🏆${data.win}次)
  </div>

</div>
`;
      })
      .join('');

  document.getElementById('topCombos').innerHTML =
    html || '無資料';
},

renderRankings(rows) {

  const renderRanking = (target, key) => {

    const total = rows.length || 1;

    const html =
      Analysis.countBy(rows, key)
        .slice(0, 3)
        .map(([name, count]) => {

          const pct =
            (count / total * 100).toFixed(1);

          return `
            <div style="margin-bottom:8px">

              <div style="
  display:flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  margin-bottom:2px;
  white-space:nowrap;
">
                <span style="
                  color:#0b3d91;
                  font-weight:bold;
                ">
                  ${name}
                </span>

                <span style="
                  color:#000;
                  font-size:12px;
                ">
                  ${pct}%
                </span>
              </div>

              <div style="
                background:#ddd;
                height:10px;
                border-radius:5px;
              ">
                <div style="
                  width:${pct}%;
                  background:#2e7d32;
                  height:10px;
                  border-radius:5px;
                "></div>
              </div>

            </div>
          `;
        })
        .join('');

    document.getElementById(target).innerHTML = html;
  };

  renderRanking('bladeRanking', '上蓋');
  renderRanking('ratchetRanking', '固鎖');
  renderRanking('bitRanking', '軸');
},

renderResults(rows) {

  document.getElementById('resultList').innerHTML =
    rows.map(r => `

      <div style="
        display:grid;
        grid-template-columns:1fr 120px 1fr;
        align-items:center;
        padding:6px 0;
        border-bottom:1px solid #eee;
      ">

        <div style="
          overflow:hidden;
          white-space:nowrap;
          text-overflow:ellipsis;
          font-size:14px;
        ">
         ${
  r.上蓋 && r.上蓋.trim()
    ? r.上蓋
    : `【未翻譯】${r.英文 || ''}`
}
        </div>

        <div style="
          display:flex;
          justify-content:center;
          align-items:center;
          font-weight:bold;
          color:#0b3d91;
          text-align:center;
        ">
          ${r.固鎖}${r.軸}
        </div>

        <div style="
          text-align:center;
        ">
          ${
            String(r.名次 || '')
              .toUpperCase()
              .includes('1ST')
              ? '🏆'
              : (r.名次 || '')
          }
        </div>

      </div>

    `).join('');
}

};

window.addEventListener('DOMContentLoaded', () => {

  document.getElementById('keyword')
    .addEventListener('input', () => UI.render());

  document.getElementById('bladeSelect')
    .addEventListener('change', () => UI.render());

  document.getElementById('ratchetSelect')
    .addEventListener('change', () => UI.render());

  document.getElementById('bitSelect')
    .addEventListener('change', () => UI.render());

  document.getElementById('clearBlade')
    .addEventListener('click', () => {

      document.getElementById('bladeSelect').value = '';
      UI.render();

    });

  document.getElementById('clearRatchet')
    .addEventListener('click', () => {

      document.getElementById('ratchetSelect').value = '';
      UI.render();

    });

  document.getElementById('clearBit')
    .addEventListener('click', () => {

      document.getElementById('bitSelect').value = '';
      UI.render();

    });

  document.getElementById('clearAllButton')
    .addEventListener('click', () => {

      document.getElementById('keyword').value = '';
      document.getElementById('bladeSelect').value = '';
      document.getElementById('ratchetSelect').value = '';
      document.getElementById('bitSelect').value = '';

      UI.render();

    });

});


/* 名次篩選 */
.place-filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 10px;
}

.place-btn {
  padding: 9px 4px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #f6f8fa;
  font-size: 14px;
  cursor: pointer;
}

.place-btn.active {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
}

/* 熱門組合 */
.top-combo-row {
  display: grid;
  grid-template-columns: 32px 1fr 72px 54px;
  align-items: center;
  gap: 6px;
  padding: 7px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.top-combo-row:last-child {
  border-bottom: none;
}

/* 排行榜 */
.ranking-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 4px 0;
  font-size: 13px;
}

/* 賽果 */
.result-row {
  display: grid;
  grid-template-columns: 34px 1fr 78px 48px;
  align-items: center;
  gap: 6px;
  padding: 7px 4px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.result-row:last-child {
  border-bottom: none;
}

.blade-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.combo-code {
  color: #0b5d1e;
  font-weight: bold;
  text-align: center;
  font-family: monospace;
}

.place {
  text-align: center;
  font-weight: bold;
}

.date {
  text-align: right;
  color: #666;
  font-size: 12px;
}

.empty {
  padding: 10px;
  color: #777;
  text-align: center;
}

document.addEventListener('dataLoaded', () => {
  UI.render();
});
