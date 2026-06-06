const UI = {

render() {

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

  if (!bladeSelect.dataset.loaded) {

    const blades =
      Analysis.countBy(Analysis.data,'上蓋')
      .map(([name,count]) => ({
        name,
        count
      }));

    bladeSelect.innerHTML =
      '<option value="">全部上蓋</option>' +
      blades.map(x =>
        `<option value="${x.name}">${x.name} (${x.count})</option>`
      ).join('');

    bladeSelect.dataset.loaded = '1';
  }

  if (!ratchetSelect.dataset.loaded) {

    const ratchets =
      [...new Set(
        Analysis.data
          .map(r=>r.固鎖)
          .filter(Boolean)
      )]
      .sort((a,b)=>{

        const [a1,a2] = a.split('-').map(Number);
        const [b1,b2] = b.split('-').map(Number);

        if(a1!==b1) return a1-b1;

        return a2-b2;

      });

    ratchetSelect.innerHTML =
      '<option value="">全部固鎖</option>' +
      ratchets.map(x =>
        `<option value="${x}">${x}</option>`
      ).join('');

    ratchetSelect.dataset.loaded='1';
  }

  if (!bitSelect.dataset.loaded) {

    const bits =
      Analysis.countBy(Analysis.data,'軸')
      .map(([name])=>name);

    bitSelect.innerHTML =
      '<option value="">全部軸心</option>' +
      bits.map(x =>
        `<option value="${x}">${x}</option>`
      ).join('');

    bitSelect.dataset.loaded='1';
  }

},

renderTopCombos(rows){

  const map = {};

  rows.forEach(r=>{

    const key =
      `${r.上蓋} ${r.固鎖}${r.軸}`;

    map[key] = (map[key] || 0) + 1;

  });

  const html =
    Object.entries(map)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([combo,count],idx)=>
        `
        <div style="
          padding:2px 0;
          text-align:center;
          font-size:14px;
        ">
          ${idx+1}. ${combo} (${count}次)
        </div>
        `
      )
      .join('');

  document.getElementById('topCombos').innerHTML =
    html || '無資料';
},

renderRankings(rows){

  const renderRanking = (target,key)=>{

    const total = rows.length || 1;

    const html =
      Analysis.countBy(rows,key)
      .slice(0,3)
      .map(([name,count])=>{

        const pct =
          (count/total*100).toFixed(1);

        return `
          <div style="margin-bottom:8px">

            <div style="
              display:flex;
              justify-content:center;
              gap:8px;
              margin-bottom:2px;
            ">
              <span>${name}</span>
              <span>${pct}%</span>
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

  renderRanking('bladeRanking','上蓋');
  renderRanking('ratchetRanking','固鎖');
  renderRanking('bitRanking','軸');

},

renderResults(rows){

  document.getElementById('resultList').innerHTML =
    rows.map(r=>`

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
          ${r.上蓋}
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

window.addEventListener('DOMContentLoaded',()=>{

  document.getElementById('keyword')
    .addEventListener('input',()=>UI.render());

  document.getElementById('bladeSelect')
    .addEventListener('change',()=>UI.render());

  document.getElementById('ratchetSelect')
    .addEventListener('change',()=>UI.render());

  document.getElementById('bitSelect')
    .addEventListener('change',()=>UI.render());

  document.getElementById('clearBlade')
    .addEventListener('click',()=>{

      document.getElementById('bladeSelect').value='';
      UI.render();

    });

  document.getElementById('clearRatchet')
    .addEventListener('click',()=>{

      document.getElementById('ratchetSelect').value='';
      UI.render();

    });

  document.getElementById('clearBit')
    .addEventListener('click',()=>{

      document.getElementById('bitSelect').value='';
      UI.render();

    });

  document.getElementById('clearAllButton')
    .addEventListener('click',()=>{

      document.getElementById('keyword').value='';
      document.getElementById('bladeSelect').value='';
      document.getElementById('ratchetSelect').value='';
      document.getElementById('bitSelect').value='';

      UI.render();

    });

  UI.render();

});
