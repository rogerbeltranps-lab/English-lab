#!/usr/bin/env python3
import sys; sys.dont_write_bytecode = True
"""Build the LS2 vocabulary games pages from the LS1 games engine.

The six games (Alphabet Challenge, Jeopardy, Memory, Scramble, Word Rush, Mystery Picture) are the
ones in 4eso/my-real-routine/vocabulary-games.html. This script takes that page as the template,
adds the fourth route (Starter = beginners) with the route names students see now
(Starter · Base · Core · Plus), and puts in each LS's words from data/<course>-<ls folder>.py.

  python3 tools/vocab-games/build.py        # writes <course>/<ls folder>/vocabulary-games.html for every data file

Every replacement is checked: if the template changes, the build stops instead of writing a broken page.
"""
import html, importlib.util, json, random, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TEMPLATE = ROOT / '4eso/my-real-routine/vocabulary-games.html'
ROUTES = ['beginners', 'insecure', 'safe', 'daring']
NAMES = {'beginners': 'Starter', 'insecure': 'Base', 'safe': 'Core', 'daring': 'Plus'}


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), HERE / 'data' / (name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    m.NAME = name
    return m


def rep(text, old, new, count=1):
    n = text.count(old)
    if n != count:
        sys.exit('build.py: expected %d × %r in the template, found %d' % (count, old[:80], n))
    return text.replace(old, new)


def resub(text, pattern, new, count=1, flags=0):
    out, n = re.subn(pattern, lambda _m: new, text, flags=flags)
    if n != count:
        sys.exit('build.py: expected %d match(es) of %r, found %d' % (count, pattern[:80], n))
    return out


# ---------------------------------------------------------------- data
def build_data(m):
    bank = {}
    for row in m.BANK:
        term, ca, definition, example, gap = row[:5]
        inference = row[5] if len(row) > 5 and row[5] else definition
        distractors = list(row[6]) if len(row) > 6 else []
        aliases = list(row[7]) if len(row) > 7 else []
        assert '____' in gap, ('gap without ____', term)
        assert term not in bank, ('duplicate term', term)
        bank[term] = dict(term=term, ca=ca, definition=definition, example=example, gap=gap,
                          inference=inference, distractors=distractors, aliases=aliases)
    for e in bank.values():
        e['distractors'] = [d for d in e['distractors'] if d in bank and d != e['term']]

    routes = {}
    for r in ROUTES:
        rnd = random.Random('%s-%s' % (m.COURSE, r))
        rosco = []
        for part in m.ROSCO[r].split('|'):
            letter, term = part[0], part[2:]
            assert term in bank, ('rosco term not in bank', r, term)
            assert letter.lower() in term.lower(), ('letter not in term', r, letter, term)
            rosco.append({'letter': letter, 'term': term})
        pool = [x['term'] for x in rosco]
        assert len(set(pool)) == len(pool), ('repeated rosco term', r)

        # Jeopardy: Meaning, In context, Translation from the route's words; Use it written by hand.
        picked = rnd.sample(pool, 15)
        groups = [sorted(picked[i * 5:i * 5 + 5], key=len) for i in range(3)]
        nopt = {'beginners': 2, 'insecure': 3}.get(r, 0)

        def options(term):
            if not nopt:
                return []
            near = [d for d in bank[term]['distractors'] if d in pool]
            rest = [t for t in pool if t != term and t not in near]
            rnd.shuffle(rest)
            return [term] + (near + rest)[:nopt - 1]

        jeopardy = []
        for c, terms in enumerate(groups):
            for t in terms:
                e = bank[t]
                if c == 0:
                    prompt = ('Which expression fits? ' + e['inference']) if r == 'daring' else 'Which expression means: “%s”' % e['definition']
                elif c == 1:
                    prompt = 'Complete: ' + e['gap']
                else:
                    prompt = 'How do you say “%s” in English?' % e['ca']
                jeopardy.append({'prompt': prompt, 'answer': t, 'options': options(t), 'support': '', 'note': e['example'], 'aliases': e['aliases']})
        for row in m.USE_IT[r]:
            prompt, answer, opts, note = row[:4]
            aliases = list(row[4]) if len(row) > 4 else []
            if nopt:
                assert len(opts) == nopt and answer in opts, ('Use it options', r, prompt)
            jeopardy.append({'prompt': prompt, 'answer': answer, 'options': list(opts) if nopt else [], 'support': '', 'note': note, 'aliases': aliases})
        assert len(jeopardy) == 20

        scramble = []
        for row in m.SCRAMBLE[r]:
            if r == 'beginners':
                chunks = row[0].split('|')
                sentence = ' '.join(chunks)
                scramble.append({'sentence': sentence, 'prompt': 'Ordena la frase: «%s»' % row[1], 'hint': 'Comença per «%s».' % chunks[0],
                                 'chunks': chunks, 'extra': [], 'alternatives': []})
                continue
            sentence, more = row[0], list(row[1])
            first = sentence.split(' ')[0]
            if r == 'insecure':
                prompt, hint = 'Construeix la frase. Comença per «%s».' % first, ''
            elif r == 'safe':
                prompt, hint = 'Build the sentence. Begin with "%s".' % first, 'Check the word order: subject, verb and then the rest.'
            else:
                prompt, hint = 'Build the sentence. Begin with "%s". Two words are extra.' % first, 'Leave the two extra words in the bank.'
            scramble.append({'sentence': sentence, 'prompt': prompt, 'hint': hint, 'chunks': sentence.split(' '),
                             'extra': more if r == 'daring' else [], 'alternatives': [] if r == 'daring' else more})
        assert len(scramble) == 8, (r, len(scramble))
        routes[r] = {'rosco': rosco, 'jeopardy': jeopardy, 'scramble': scramble}

    return {'course': m.COURSE, 'ls': m.LS, 'title': m.TITLE, 'bank': bank, 'routes': routes,
            'categories': m.CATEGORIES, 'pictures': m.PICTURES, 'synonyms': m.SYNONYMS,
            'transfer': m.TRANSFER, 'preview': m.PREVIEW, 'routeDetail': m.ROUTE_DETAIL, 'source': 'index.html'}


# ---------------------------------------------------------------- texts for the engine
def route_info(m):
    short = {'beginners': 'Instruccions en català i opcions', 'insecure': 'Instruccions en català',
             'safe': 'More independence, optional hints', 'daring': 'Inference and less support'}
    return {r: {'short': short[r], 'detail': m.ROUTE_DETAIL[r]} for r in ROUTES}


GAMES = {
 'rosco': {'name': 'Alphabet Challenge', 'icon': 'rosco', 'tag': 'A word wheel from A to Z', 'desc': 'A wheel of studied expressions. Read the clue, find the answer or pass and return.',
           'badges': ['3 choices + a Catalan clue', 'Write the answer · letter hints', 'English clues + typed answers', 'Infer the expression from context']},
 'jeopardy': {'name': 'Vocabulary Jeopardy', 'icon': 'jeopardy', 'tag': '4 categories · 100–500 points', 'desc': 'Choose a category. Take a chance. Build your score one question at a time.',
              'badges': ['Two choices · easy questions', 'Three choices · Catalan instructions', 'Gaps + guided written answers', 'Precision, correction + nuance']},
 'memory': {'name': 'Memory Match', 'icon': 'memory', 'tag': 'Find the pairs', 'desc': 'Turn two cards. Connect the language, not just the position.',
            'badges': ['5 pairs: word ↔ Catalan', '6 pairs: word ↔ Catalan', 'Expression ↔ English definition', 'Expression ↔ contextual gap']},
 'scramble': {'name': 'Sentence Scramble', 'icon': 'scramble', 'tag': '8 sentences', 'desc': 'Make the pieces work together. Build a sentence you can actually use.',
              'badges': ['Chunk tiles + the Catalan sentence', 'Word tiles + 3 tries', 'Word tiles + grammar in context', 'Word tiles + 2 distractors']},
 'rush': {'name': 'Word Rush', 'icon': 'rush', 'tag': '12 quick decisions', 'desc': 'Think fast, choose carefully. Find the meaning before the clock runs out.',
          'badges': ['3 Catalan meanings · more time', '4 Catalan meanings', '4 expressions from a definition', '4 close choices in context']},
 'mystery': {'name': 'Mystery Picture', 'icon': 'mystery', 'tag': '9 hidden tiles · 4 scenes', 'desc': 'Earn a glimpse with each answer. Name the scene behind the picture.',
             'badges': ['Catalan clue + 3 choices', 'Definitions + 4 choices', 'Context gaps + a written guess', 'Infer, write + explain aloud']},
}

TIPS = {
 'rosco': {'beginners': 'Llegeix la pista (en anglès i en català) i tria entre 3 opcions que tenen la mateixa lletra.',
           'insecure': 'Escriu tu la paraula o expressió en anglès. Pots demanar una pista de lletres, però l’encert valdrà 5 punts.',
           'safe': 'Pista en anglès: escriu la paraula o expressió. Pots demanar una pista de lletres, però l’encert valdrà 5 punts.',
           'daring': 'Dedueix l’expressió a partir d’una situació i escriu-la en anglès. No hi ha banc de paraules ni pista.'},
 'jeopardy': {'beginners': 'Preguntes fàcils amb 2 opcions.', 'insecure': 'Preguntes amb 3 opcions per triar.',
              'safe': 'Completa buits o escriu una resposta guiada en anglès.', 'daring': 'Resol situacions i corregeix errors de forma i de significat.'},
 'memory': {'beginners': '5 parelles: paraula en anglès + significat en català.', 'insecure': '6 parelles: paraula en anglès + significat en català.',
            'safe': '8 parelles: expressió + definició en anglès.', 'daring': '8 parelles: expressió + frase amb un buit on encaixa l’expressió.'},
 'scramble': {'beginners': 'Blocs de paraules i la frase en català com a guia. Fins a 3 intents.', 'insecure': 'Paraules soltes i fins a 3 intents.',
              'safe': 'Paraules soltes i fins a 2 intents.', 'daring': 'Hi ha 2 peces que sobren. Deixa-les al banc. Només tens 1 intent.'},
 'rush': {'beginners': '3 significats en català i 25 segons per pregunta.', 'insecure': '4 significats en català i 22 segons per pregunta.',
          'safe': 'Definició en anglès, 4 expressions i 18 segons per pregunta.', 'daring': 'Frase amb un buit, 4 opcions properes i 18 segons per pregunta.'},
 'mystery': {'beginners': 'Pista en català i 3 opcions. Per endevinar la imatge, tria entre 4 escenes.', 'insecure': 'Definició en anglès i 4 opcions. Per endevinar la imatge, tria entre 4 escenes.',
             'safe': 'Completa buits amb opcions i escriu el nom de l’escena amb una pista.', 'daring': 'Dedueix i escriu les respostes. Per endevinar l’escena no hi ha banc de paraules.'},
}


def guide_html(m):
    t = html.escape(m.TITLE)
    rows = [
        ('Rosco', 'Pista en anglès + català; 3 opcions.', 'Definició en anglès; resposta escrita; pista de lletres opcional.', 'Definició en anglès; resposta escrita; pista de lletres opcional.', 'Situació o inferència; resposta escrita sense banc.'),
        ('Jeopardy', '2 opcions; preguntes fàcils.', '3 opcions.', 'Buits i respostes escrites guiades.', 'Inferència i correcció d’errors.'),
        ('Memory', '5 parelles: paraula / català.', '6 parelles: paraula / català.', '8 parelles: expressió / definició.', '8 parelles: expressió / frase amb buit.'),
        ('Scramble', 'Blocs + frase en català; 3 intents.', 'Paraules soltes; 3 intents.', 'Paraules soltes; 2 intents.', '2 paraules sobrants; 1 intent.'),
        ('Word Rush', 'Paraula / 3 significats en català; 25 s.', 'Paraula / 4 significats en català; 22 s.', 'Definició / 4 expressions; 18 s.', 'Buit / 4 opcions properes; 18 s.'),
        ('Mystery', 'Pista en català + 3 opcions; tria l’escena.', 'Definició + 4 opcions; tria l’escena.', 'Buits amb opcions; escriu l’escena amb pista.', 'Inferències escrites; escena sense banc.'),
    ]
    table = ''.join('<tr><th>%s</th>%s</tr>' % (r[0], ''.join('<td>%s</td>' % c for c in r[1:])) for r in rows)
    return ('<div class="guide-content" lang="ca"><p><strong>%s · %d ESO.</strong> Sis jocs de pràctica formativa amb el vocabulari de la LS. '
            'Les quatre rutes (Starter, Base, Core, Plus) canvien el suport, el tipus de resposta i les paraules; no només el nombre de preguntes. '
            'Starter i Base tenen les instruccions en català. Un alumne amb sessió iniciada només veu la seva ruta, la que li ha posat el docent (Pro juga a Plus).</p>'
            '<h3>Com organitzar la classe</h3><p><strong>Individual:</strong> cada alumne juga al seu dispositiu. <strong>Un equip / un Chromebook:</strong> els membres consensuen respostes i alternen lector, portaveu i teclat. '
            '<strong>Projector:</strong> el docent controla la partida per a 2–6 equips; el marcador i els torns es gestionen en aquest dispositiu.</p>'
            '<h3>Diferenciació</h3><div class="table-scroll"><table class="guide-table"><thead><tr><th>Joc</th><th>Starter</th><th>Base</th><th>Core</th><th>Plus</th></tr></thead><tbody>%s</tbody></table></div>'
            '<h3>Torns i puntuació</h3><p>Una resposta correcta suma <strong>10 punts</strong>. Memory: <strong>20 per parella</strong>. Jeopardy: el valor de la casella, de <strong>100 a 500</strong>. No hi ha punts negatius. '
            'Amb la pista de lletres (Base i Core), l’encert val la meitat. A Scramble, l’encert després de reintentar val 5 punts. A Mystery, encertar la imatge suma <strong>20 + 10 per cada casella encara tapada</strong>.</p>'
            '<h3>Correcció transparent</h3><p>No hi ha intel·ligència artificial: es comparen les respostes previstes i les alternatives programades, sense tenir en compte majúscules ni puntuació. '
            'En mode projector, <strong>Teacher: accept a valid alternative</strong> permet validar una resposta correcta que el comprovador no hagi reconegut. La tasca oral final <strong>Take it into real life</strong> no es corregeix automàticament.</p>'
            '<h3>Fitxer i privacitat</h3><p>Els jocs funcionen sense xarxa i no envien res: la configuració i fins a 30 resultats es desen només en aquest navegador. Utilitzeu sobrenoms. Es pot esborrar l’historial i exportar un CSV. '
            'No compten per a la nota. Les paraules surten dels panells de vocabulari de la LS; es generen amb <code>tools/vocab-games/build.py</code>.</p>'
            '<p><a href="index.html">Learning Situation %s ↗</a></p></div>') % (t, m.COURSE, table, t)


MAKE_VOCAB_TASK = r"""function makeVocabTask(entry,purpose,index,letter=''){
 const r=game.route,key=purpose+'-'+index,bank=chosenPool();let prompt,answer=entry.term,options=[],support='',aliases=entry.aliases||[];
 if(purpose==='rush'&&CA(r)){
  // Starter and Base: the English expression and its meaning in Catalan (3 or 4 options).
  prompt='What does “'+entry.term+'” mean?';answer=entry.ca;aliases=[];
  options=makeOptions(answer,[...entry.distractors.filter(t=>bank.some(e=>e.term===t)).map(t=>DATA.bank[t].ca),...bank.map(t=>t.ca)],r==='beginners'?3:4,key);
 }else{
  prompt=r==='daring'?(purpose==='rosco'||purpose==='mystery'?entry.inference:entry.gap):(r==='safe'&&purpose==='mystery'?entry.gap:entry.definition);
  if(r==='beginners'){
   // Starter always chooses: 3 options (in the rosco, all with the same letter) and the Catalan meaning as a clue.
   let candidates=bank.map(t=>t.term);if(purpose==='rosco'){const same=candidates.filter(t=>t.toLowerCase().includes(letter.toLowerCase()));if(same.length>=3)candidates=same;}
   options=makeOptions(answer,candidates,3,key);support='Pista: '+entry.ca;
  }else if(r==='insecure'){
   // Base types the rosco answers (letter hints available) and picks from 4 options in the other games.
   if(purpose!=='rosco')options=makeOptions(answer,bank.map(t=>t.term),4,key);
  }else if(purpose==='rush'||(purpose==='mystery'&&r==='safe')){
   // Plus distractors are deliberately close in meaning, not just random words.
   const close=entry.distractors.filter(x=>x!==answer&&bank.some(e=>e.term===x));
   const distractors=[...new Set([...mix(close,key+'-close'),...mix(bank.map(e=>e.term),key+'-extra')])].filter(x=>x!==answer).slice(0,3);
   options=mix([answer,...distractors],key+'-options');
  }
 }
 return {prompt,answer,aliases,options,support,note:entry.example,entry:entry.term,key,typed:!options.length};
}
"""


def build_page(m, out):
    src = TEMPLATE.read_text(encoding='utf-8')
    a = src.index('<script id="course-data" type="application/json">')
    b = src.index('</script>', a)
    head, engine = src[:a], src[b + len('</script>'):]
    c, title, title_h = m.COURSE, m.TITLE, html.escape(m.TITLE)

    # ---- head: names, links and the four-route grid
    head = rep(head, 'content="Six offline vocabulary games for My Real Routine. Three differentiated routes, individual practice and classroom team play."',
               'content="Six offline vocabulary games for %s (%d ESO). Four routes (Starter, Base, Core, Plus), individual practice and classroom team play."' % (title_h, c))
    head = rep(head, '<title>Vocabulary Games | 4 ESO | English Lab</title>', '<title>Vocabulary Games | %d ESO · %s | English Lab</title>' % (c, title_h))
    head = rep(head, '<body data-course="4">', '<body data-course="%d">' % c)
    head = rep(head, '4 ESO <span aria-hidden="true">/</span> My Real Routine', '%d ESO <span aria-hidden="true">/</span> %s' % (c, title_h))
    head = rep(head, 'href="https://rogerbeltranps-lab.github.io/English-lab/4eso/my-real-routine/index.html"', 'href="index.html"')
    head = rep(head, 'MY REAL ROUTINE &nbsp;', '%s &nbsp;' % title_h.upper())
    head = rep(head, '<span>3 rutes</span>', '<span>4 rutes</span>')
    head = rep(head, 'wind down.<span>', '%s<span>' % html.escape(m.HERO_WORD))
    head = rep(head, 'La mateixa idea, tres maneres d’aprendre.', 'La mateixa idea, quatre maneres d’aprendre.')
    head = rep(head, '4 ESO <b>&middot;</b> My Real Routine', '%d ESO <b>&middot;</b> %s' % (c, title_h))
    head = rep(head, '</style>', '/* Four routes: Starter, Base, Core, Plus (a signed-in student sees only their own). */\n'
               '.route-grid{grid-template-columns:repeat(4,minmax(0,1fr))}\n@media(max-width:780px){.route-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n</style>')
    head = rep(head, '<!-- EDITABLE CONTENT: all vocabulary, clues, accepted answers, sentences and routes are in this JSON. -->',
               '<!-- GENERATED by tools/vocab-games/build.py from tools/vocab-games/data/%s.py: edit the data there and rebuild, not this JSON. -->' % m.NAME)

    # ---- engine
    e = engine
    # Scenes for this LS (the helpers rooms, windows, plant and face stay).
    i, j = e.index(" let art='';"), e.index(" return '<svg xmlns=")
    e = e[:i] + " let art='';\n" + (HERE / 'data' / (m.NAME + '-scenes.js')).read_text(encoding='utf-8') + e[j:]
    e = rep(e, 'aria-label="Routine illustration; use', 'aria-label="Scene illustration; use')
    e = rep(e, '/* Original inline SVG icons and routine illustrations.', '/* Original inline SVG icons and scene illustrations.')
    # Routes, route texts and games.
    i, j = e.index('const ROUTE_NAMES='), e.index('let storageOK=true;')
    e = e[:i] + ('const ROUTES=%s;\nconst CA=r=>[\'beginners\',\'insecure\'].includes(r);   // Starter and Base read Catalan instructions\n'
                 'const ROUTE_NAMES=%s;\nconst ROUTE_INFO=%s;\nconst GAMES=%s;\n') % (
        json.dumps(ROUTES), json.dumps(NAMES), json.dumps(route_info(m), ensure_ascii=False), json.dumps(GAMES, ensure_ascii=False)) + e[j:]
    e = rep(e, "const STORE='english-lab-vocabulary-v1-'+DATA.course;", "const STORE='english-lab-vocabulary-v1-'+DATA.course+'-'+DATA.ls;")
    e = rep(e, '// Insecure provides Catalan scaffolding. Safe and Daring use English instructions.', '// Starter and Base provide Catalan scaffolding. Core and Plus use English instructions.')
    # Every "Insecure reads Catalan" check also covers Starter.
    e, n = re.subn(r"((?:game|settings)\.route|(?<![\w.])(?:route|key|r))===\'insecure\'", r"CA(\1)", e)
    e, n2 = re.subn(r"((?:game|settings)\.route|(?<![\w.])(?:route|key|r))!==\'insecure\'", r"!CA(\1)", e)
    assert n > 20 and n2 > 5, (n, n2)
    i, j = e.index('function makeVocabTask('), e.index('function updateSettings(){')
    e = e[:i] + MAKE_VOCAB_TASK + e[j:]
    e = rep(e, "['insecure','safe','daring'].indexOf(", 'ROUTES.indexOf(', 3)
    e = rep(e, 'setClock([480,420,360][ri])', 'setClock([540,480,420,360][ri])')
    e = rep(e, 'setClock([240,240,300][ri])', 'setClock([270,240,240,300][ri])')
    e = rep(e, '{jeopardy:[55,60,75],scramble:[80,90,105],rush:[22,18,18],mystery:[45,50,65]};setClock((limits[game.id]||[60,60,60])[i]);',
            '{jeopardy:[60,55,60,75],scramble:[90,80,90,105],rush:[25,22,18,18],mystery:[50,45,50,65]};setClock((limits[game.id]||[60,60,60,60])[i]);')
    e = rep(e, 'game.pairCount=CA(game.route)?6:8;', "game.pairCount=game.route==='beginners'?5:game.route==='insecure'?6:8;")
    e = rep(e, '(CA(game.route)?x.chunks:x.sentence.split(\' \'))', "(game.route==='beginners'&&x.chunks?.length?x.chunks:x.sentence.split(' '))")
    e = rep(e, '{insecure:3,safe:2,daring:1}[game.route]', '{beginners:3,insecure:3,safe:2,daring:1}[game.route]')
    # The Catalan clue (support) shows for Starter; Base has none.
    e = rep(e, '(!CA(game.route)&&t.support?', '(t.support?', 3)
    # Letter hints for Base too (half points).
    e = rep(e, "(game.route==='safe'&&!frozen?", "((game.route==='safe'||game.route==='insecure')&&!frozen?")
    e = rep(e, "game.route==='safe'){game.hints.add", "(game.route==='safe'||game.route==='insecure')){game.hints.add")
    # Starter scramble: the Catalan sentence is the prompt; the retry note points at it.
    e = resub(e, r"const groups=DATA\.course===4\?\[\[.*?\]\]:\[\];", 'const groups=DATA.synonyms||[];')
    # Final speaking task and the mystery wording: scenes, not routines.
    e = resub(e, r"DATA\.course===2\?\{insecure:'(?:[^'\\]|\\.)*',safe:'(?:[^'\\]|\\.)*',daring:'(?:[^'\\]|\\.)*'\}\[game\.route\]:\{insecure:'(?:[^'\\]|\\.)*',safe:'(?:[^'\\]|\\.)*',daring:'(?:[^'\\]|\\.)*'\}\[game\.route\]",
              'DATA.transfer[game.route]')
    for old, new, cnt in [
        ('Quina rutina s’amaga?', 'Quina escena s’amaga?', 2), ('Which routine is hidden?', 'Which scene is hidden?', 1),
        ('Escriu la rutina en anglès', 'Escriu l’escena en anglès', 2), ('Write the routine in English', 'Write the scene in English', 1),
        ('Tria la rutina / Choose the routine', 'Tria l’escena / Choose the scene', 2), ("'Choose the routine'", "'Choose the scene'", 1),
        ('Choose a routine...', 'Choose a scene...', 1), ('Name the routine first.', 'Name the scene first.', 1),
        ('Name the hidden routine', 'Name the hidden scene', 1), ('Not that routine.', 'Not that scene.', 1),
        ('use it in your real routine.', 'use it in real life.', 1), ('You found the hidden routine.', 'You found the hidden scene.', 1),
        ('The hidden routine: ', 'The hidden scene: ', 1), ('Use the revealed clues to identify the routine.', 'Use the revealed clues to identify the scene.', 1),
        ('Descobreix la rutina amagada sota', 'Descobreix l’escena amagada sota', 1), ('Endevina la rutina en angl\\u00e8s', 'Endevina l’escena en angl\\u00e8s', 1),
        ("'3 rutes':'3 routes'", "'4 rutes':'4 routes'", 1), ('La mateixa idea, tres maneres d’aprendre.', 'La mateixa idea, quatre maneres d’aprendre.', 1),
        ('One goal, three ways to learn.', 'One goal, four ways to learn.', 1),
    ]:
        e = rep(e, old, new, cnt)
    # Route tips in the "How to play" window: one per route.
    for game_id in ['rosco', 'jeopardy', 'memory', 'scramble', 'rush', 'mystery']:
        k = e.index('\n ' + game_id + ':{') if game_id != 'rosco' else e.index('\n rosco: {')
        tip = re.compile(r"tips:\{insecure:'(?:[^'\\]|\\.)*',safe:'(?:[^'\\]|\\.)*',daring:'(?:[^'\\]|\\.)*'\}")
        mt = tip.search(e, k)
        assert mt, game_id
        e = e[:mt.start()] + 'tips:' + json.dumps(TIPS[game_id], ensure_ascii=False) + e[mt.end():]
    # Teacher guide.
    e = resub(e, r"\n return '<div class=\"guide-content\" lang=\"ca\">.*?</div>';\n", '\n return ' + json.dumps(guide_html(m), ensure_ascii=False) + ';\n', flags=re.S)
    # Card previews use a word from this LS.
    e = rep(e, "const term=DATA.course===2?'wake up':'wind down';", 'const P=DATA.preview,term=P.term;')
    e = rep(e, "(DATA.course===2?'despertar-se':'relaxar-se')", 'esc(P.ca)')
    e = rep(e, "(DATA.course===2?'at seven.':'after school.')", 'esc(P.tail)', 2)
    e = rep(e, "(DATA.course===2?'get up':'wind down')", 'esc(P.verb)', 2)
    e = rep(e, "['WORDS','HABITS','CONTEXT']", "['WORDS','PHRASES','CONTEXT']")
    # Route buttons are drawn once, so the site can show a student only their own route (applyLevel in el-cloud.js
    # clicks the student's .route[data-level] button and hides the others).
    e = resub(e, r"\$\('route-grid'\)\.innerHTML=Object\.entries\(ROUTE_INFO\)\.map\(.*?\)\.join\(''\);",
              "const rg=$('route-grid');if(!rg.children.length)rg.innerHTML=ROUTES.map(key=>'<button class=\"route-button route\" type=\"button\" data-route=\"'+key+'\" data-level=\"'+key+'\" aria-pressed=\"false\"><span lang=\"'+(CA(key)?'ca':'en')+'\"><strong>'+ROUTE_NAMES[key]+'</strong><small>'+ROUTE_INFO[key].short+'</small></span><span class=\"check-dot\" aria-hidden=\"true\"></span></button>').join('');\n"
              " rg.querySelectorAll('[data-route]').forEach(b=>{const on=b.dataset.route===settings.route;b.setAttribute('aria-pressed',on);b.querySelector('.check-dot').textContent=on?'\\u2713':'';});")
    leftovers = [w for w in ("'insecure','safe','daring'", 'My Real Routine', 'routine', 'rutina', 'Insecure', 'Daring') if w in e]
    if leftovers:
        sys.exit('build.py: LS1 wording left in the engine: %s' % leftovers)

    data = json.dumps(build_data(m), ensure_ascii=False, indent=1).replace('</', '<\\/')
    page = head + '<script id="course-data" type="application/json">\n' + data + '\n</script>' + e
    out.write_text(page, encoding='utf-8')
    print('wrote', out.relative_to(ROOT), '%d KB' % (len(page.encode()) // 1024))


if __name__ == '__main__':
    # One data file per LS: data/<course>-<ls folder>.py (+ -scenes.js). The page goes to <course>/<ls folder>/vocabulary-games.html.
    for f in sorted((HERE / 'data').glob('*.py')):
        course, folder = f.stem.split('-', 1)
        build_page(load(f.stem), ROOT / course / folder / 'vocabulary-games.html')
