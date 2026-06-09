const UI = {
  selectedPlace: "",

  render() {
    if (!Analysis.data.length) return;

    this.renderFilters();

    const rows = Analysis.filter({
      blade: document.getElementById("bladeSelect").value || "",
      ratchet: document.getElementById("ratchetSelect").value || "",
      bit: document.getElementById("bitSelect").value || "",
      place: this.selectedPlace || ""
    });

    document.getElementById("recordCount").textContent = `${rows.length} 筆`;

    this.renderTopCombos(rows);
    this.renderRankings(rows);
    this.renderResults(rows);
  },

  renderFilters() {
    const bladeSelect = document.getElementById("bladeSelect");
    const ratchetSelect = document.getElementById("ratchetSelect");
    const bitSelect = document.getElementById("bitSelect");

    const currentBlade = bladeSelect.value;
    const currentRatchet = ratchetSelect.value;
    const currentBit = bitSelect.value;

    const rowsForBlade = Analysis.filter({
      blade: "",
      ratchet: currentRatchet,
      bit: currentBit,
      place: this.selectedPlace
    });

    const rowsForRatchet = Analysis.filter({
      blade: currentBlade,
      ratchet: "",
      bit: currentBit,
      place: this.selectedPlace
    });

    const rowsForBit = Analysis.filter({
      blade: currentBlade,
      ratchet: currentRatchet,
      bit: "",
      place: this.selectedPlace
    });

    const bladeRanking = Analysis.getBladeRanking
      ? Analysis.getBladeRanking(rowsForBlade)
      : Analysis.countBy(rowsForBlade, "上蓋");

    bladeSelect.innerHTML =
      `<option value="">全部上蓋</option>` +
      bladeRanking.map(([name, count]) =>
        `<option value="${name}">${name} (${count})</option>`
      ).join("");

    const ratchetRanking = Analysis.getRatchetRanking
      ? Analysis.getRatchetRanking(rowsForRatchet)
      : Analysis.countBy(rowsForRatchet, "固鎖");

    ratchetSelect.innerHTML =
      `<option value="">全部固鎖</option>` +
      ratchetRanking.map(([name]) =>
        `<option value="${name}">${name}</option>`
      ).join("");

    const bitRanking = Analysis.getBitRanking
      ? Analysis.getBitRanking(rowsForBit)
      : Analysis.countBy(rowsForBit, "軸");

    bitSelect.innerHTML =
      `<option value="">全部軸心</option>` +
      bitRanking.map(([name, count]) =>
        `<option value="${name}">${name} (${count})</option>`
      ).join("");

    restoreValue(bladeSelect, currentBlade);
    restoreValue(ratchetSelect, currentRatchet);
    restoreValue(bitSelect, currentBit);
  },

  renderTopCombos(rows) {
    const combos = Analysis.getTopCombos
      ? Analysis.getTopCombos(rows, 3)
      : [];

    const medals = ["🥇", "🥈", "🥉"];

    document.getElementById("topCombos").innerHTML =
      combos.map((c, i) => `
        <div class="top-combo-row">
          <span>${medals[i]} ${c.blade}</span>
          <span class="combo-code">${c.ratchet}${c.bit}</span>
          <span>${c.count} 次</span>
        </div>
      `).join("") || `<div class="empty">無資料</div>`;
  },

  renderRankings(rows) {
    this.renderRanking("bladeRanking", Analysis.getBladeRanking(rows), rows.length);
    this.renderRanking("ratchetRanking", Analysis.getRatchetRanking(rows), rows.length);
    this.renderRanking("bitRanking", Analysis.getBitRanking(rows), rows.length);
  },

  renderRanking(target, ranking, total) {
    document.getElementById(target).innerHTML =
      ranking.slice(0, 3).map(([name, count], index) => {
        const pct = total ? ((count / total) * 100).toFixed(1) : "0.0";

        return `
          <div class="ranking-row">
            <span>${index + 1}. ${name}</span>
            <span>${pct}%</span>
          </div>
          <div class="ranking-bar">
            <div class="ranking-fill" style="width:${pct}%"></div>
          </div>
        `;
      }).join("") || `<div class="empty">無</div>`;
  },

  renderResults(rows) {
    document.getElementById("resultList").innerHTML =
      rows.map(r => {
        const blade =
          r.上蓋 && r.上蓋.trim()
            ? r.上蓋
            : `【待釐正】(${r.英文 || ""})`;

        const place =
          String(r.名次 || "").toUpperCase().includes("1ST")
            ? "🏆"
            : r.名次 || "";

        return `
          <div class="result-row">
            <span class="place">${place}</span>
            <span class="blade-name">${blade}</span>
            <span class="combo-code">${r.固鎖 || ""}${r.軸 || ""}</span>
            <span class="date">${formatDate(r.日期 || "")}</span>
          </div>
        `;
      }).join("") || `<div class="empty">沒有符合條件的賽果</div>`;
  }
};

window.addEventListener("DOMContentLoaded", () => {
  ["bladeSelect", "ratchetSelect", "bitSelect"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => UI.render());
  });

  document.getElementById("clearBlade").addEventListener("click", () => {
    document.getElementById("bladeSelect").value = "";
    UI.render();
  });

  document.getElementById("clearRatchet").addEventListener("click", () => {
    document.getElementById("ratchetSelect").value = "";
    UI.render();
  });

  document.getElementById("clearBit").addEventListener("click", () => {
    document.getElementById("bitSelect").value = "";
    UI.render();
  });

  document.querySelectorAll(".place-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".place-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      UI.selectedPlace = btn.dataset.place || "";
      UI.render();
    });
  });

  document.getElementById("clearAllButton").addEventListener("click", () => {
    document.getElementById("bladeSelect").value = "";
    document.getElementById("ratchetSelect").value = "";
    document.getElementById("bitSelect").value = "";

    UI.selectedPlace = "";

    document.querySelectorAll(".place-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('.place-btn[data-place=""]').classList.add("active");

    UI.render();
  });
});

document.addEventListener("dataLoaded", () => {
  UI.render();
});

function restoreValue(select, value) {
  if ([...select.options].some(o => o.value === value)) {
    select.value = value;
  } else {
    select.value = "";
  }
}

function formatDate(date) {
  const parts = String(date).split("/");
  if (parts.length < 3) return date;

  return `${String(parts[1]).padStart(2, "0")}/${String(parts[2]).padStart(2, "0")}`;
}
