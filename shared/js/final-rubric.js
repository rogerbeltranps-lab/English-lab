/* Final-product rubric renderer. Data lives next to each course (final-rubric-data.js). */
var finalRubric = {
  routeNames: {insecure: 'Insecure', safe: 'Safe', daring: 'Daring'},
  levels: [['Nivell 4', 'Molt bé'], ['Nivell 3', 'Bé'], ['Nivell 2', 'Suficient'], ['Nivell 1', 'En procés']],
  render: function (route) {
    var host = document.getElementById('rubricHost');
    var data = window.finalRubricData && window.finalRubricData[route];
    if (!host || !data) return;
    var esc = function (s) { return s; }; // data is trusted, authored in this repo
    var head = '<tr><th scope="col">Criteri</th>' + this.levels.map(function (l) {
      return '<th scope="col"><span class="level-num">' + l[0] + '</span><span class="level-name">' + l[1] + '</span></th>';
    }).join('') + '</tr>';
    var rows = data.rows.map(function (r) {
      return '<tr><th scope="row">' + r.name + '<small>' + r.sub + '</small><span class="percent">' + r.pct + '%</span></th>' +
        r.cells.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
    host.innerHTML =
      '<h3>Rúbrica de la ruta ' + this.routeNames[route] + '</h3>' +
      '<p class="instruction">' + data.intro + '</p>' +
      '<div class="rubric-scroll" tabindex="0" role="region" aria-label="Rúbrica ' + this.routeNames[route] + '"><table class="rubric"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="callout"><strong>Requisit de ruta:</strong> ' + data.note + '</div>' +
      '<div class="rubric-calc"><strong>Com es calcula la nota?</strong> Cada criteri rep un nivell, que es converteix en una puntuació: ' +
      '<span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> ' +
      'Després s’hi aplica el percentatge del criteri. Per exemple, un nivell 3 a Speaking aporta 7,5 sobre 10 en aquest criteri, i aquest criteri compta el 35% de la nota final.</div>';
  }
};
