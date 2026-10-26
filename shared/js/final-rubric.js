/* Final-product rubric renderer. Data lives next to each course (final-rubric-data.js). */
var finalRubric = {
  routeNames: {beginners: 'Beginners', insecure: 'Insecure', safe: 'Safe', daring: 'Daring'},
  ui: {
    lang: 'ca', criterion: 'Criteri',
    levels: [['Nivell 4', 'Molt bé'], ['Nivell 3', 'Bé'], ['Nivell 2', 'Suficient'], ['Nivell 1', 'En procés']],
    heading: 'Rúbrica de la ruta {route}', label: 'Rúbrica {route}', req: 'Requisit de ruta:',
    calc: '<strong>Com es calcula la nota?</strong> Cada criteri rep un nivell, que es converteix en una puntuació: <span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> Després s’hi aplica el percentatge del criteri. Per exemple, un nivell 3 a Speaking aporta 7,5 sobre 10 en aquest criteri, i aquest criteri compta el 35% de la nota final.'
  },
  render: function (route) {
    var host = document.getElementById('rubricHost');
    var D = window.finalRubricData || {}, data = D[route] || (route === 'beginners' ? D.insecure : null);   // Beginners: its own rubric when the LS has one, else Insecure's
    if (!host || !data) return;
    var ui = data.ui || this.ui, name = this.routeNames[route];
    host.lang = ui.lang;
    var head = '<tr><th scope="col">' + ui.criterion + '</th>' + ui.levels.map(function (l) {
      return '<th scope="col"><span class="level-num">' + l[0] + '</span><span class="level-name">' + l[1] + '</span></th>';
    }).join('') + '</tr>';
    var rows = data.rows.map(function (r) {
      return '<tr><th scope="row">' + r.name + '<small>' + r.sub + '</small><span class="percent">' + (typeof r.pct === 'number' ? r.pct + '%' : r.pct) + '</span>' +
        (r.round && ui.rounds ? '<span class="round">' + ui.rounds[r.round] + '</span>' : '') + '</th>' +
        r.cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    host.innerHTML =
      '<h3>' + ui.heading.replace('{route}', name) + '</h3>' +
      '<p class="instruction">' + data.intro + '</p>' +
      '<div class="rubric-scroll" tabindex="0" role="region" aria-label="' + ui.label.replace('{route}', name) + '"><table class="rubric"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="callout"><strong>' + ui.req + '</strong> ' + data.note + '</div>' +
      '<div class="rubric-calc">' + ui.calc + '</div>';
  }
};
