# How to make a class game

Kahoot-style games for class (Roger, 26 Oct 2026). The board runs on the projector; each student taps the answer on their Chromebook. The technical details for Claude are in `AGENTS.md`, "Class games"; this page is the readable version.

## How a game works in class

1. On the learning path page, signed in as the teacher, press **🎮 Start the class game** (only the teacher sees it). You can also open the board from the dashboard's Points box.
2. Choose the group. Every signed-in student of that group is taken into the game from whatever page they are on.
3. The board shows theory slides and questions. Students see only the question and four coloured tiles, and tap one. In a **written question** (✏️) they type the missing words instead and press Send. They can't see the right answer before the board shows it, and they never open the presentation.
4. The answer appears on the board with a short explanation once everyone has answered. After a written question the board also shows the wrong answers students wrote (without names), so you can talk about them. There is no timer: only right or wrong.
5. Points: +1 term point per right answer, the same points as the presentations. The best student in the group gets +0.5 on the term grade, the others proportionally down to 0. The dashboard exports them as CSV. The tester account can play and gets points, but never counts as the best.
6. Music plays on the projector only; the Chromebooks play only each student's tap and result sounds.
7. **Full screen (6 Nov 2026).** Students tap once to join the game, which then fills their screen; Esc does nothing (only holding it down leaves). If someone leaves full screen, their screen asks them to tap again and the board's top bar counts them as out: "✓ 18 in · ✗ 5 out". Out also means a Chromebook that lost the connection or a closed lid (within about two minutes) and students of the group who are not in the game. Tap the count to see the names, with why each one is out (they are hidden at first because the board is on the projector). The dashboard shows the same lists at the top right. After the game, a pull-up and its full screen are still on.
8. **📝 Take your notes (6 Nov 2026).** After the theory slides (one or several in a row) the board shows a **Take your notes** slide: the theory again in small on the projector and how many students are writing. On their Chromebooks students type their notes: **2 sentences of their own using the new words (vocabulary game) or the grammar structures (grammar game), and anything that helps them remember the theory** (10 Nov 2026); they are saved by themselves and appear on the LS page in **📝 Your notes**, grouped by learning path, read only (they write them only in the games) and printable. On the LS page each game also shows the student's result and **🎯 What to study** (the theory with mistakes, the questions to look at again), with a copy of the theory slides and their notes below; a student who missed the game gets the theory without notes. On their board, two circles (🧩 grammar, 📚 vocabulary) show their % right and open that page; you see the same circles next to each student on the dashboard. When you add or change a game, run `node tools/game-theory/build.mjs` (it copies the theory slides for the students). On **📊 Results**, choose the LS and click a student: you see every game with each question, what they answered, the right answer and their notes, all together. Press Next (Space) when you want to go on, or straight away to skip it. If the same game is played again, their notes come back so they can add to them.
9. **🔁 Playing a game again (12 Nov 2026).** When a group has already played a game (or you press Play again), the board skips the theory and 📝 notes slides and goes straight to the questions. The waiting screen says so ("🔁 Played on 10 Nov: no theory slides…"); press **📖 Show the theory** there to show it again this time. During any game, **⏭ Skip to the questions** (key S) still jumps over the theory of that part.
10. **🕵️ Code Breakers (12 Nov 2026).** A second way to play a learning path, like a hacking game (Roger: "can we make a game like a Blooket, hackers like?"). On the board's game list each learning path has a **🕵️ LPn · Code Breakers** button after its two games (also on a game's page: "Play LPn as Code Breakers"). It uses the questions of **both** games of the path, vocabulary and grammar mixed, with **no theory slides**, plus **new questions on the same words and grammar** shown first (written so far for 2 ESO LP3; the other paths use their class game questions until theirs are written). Choose the group and the time (5, 8, 10 or 15 minutes; **+2 min** and **■ End** while it runs). Students first choose a **secret password** from 3 words of the path. Then each one answers **at their own pace**: a right answer opens one of 3 files: 💾 bits, ⚡ double, 🛡️ firewall (90 s safe from hacks), 🦠 virus (loses some bits) or 💻 hack. To hack, they choose a player and crack their password: they see the clue (the word's sentence with a gap) and the 3 words, so knowing the vocabulary is what wins. The projector shows the ranking, the time and the news ("Ana hacked Marc: 40 bits!"). On a student's Chromebook, "someone hacked you" appears for 5 seconds in the top bar, between the bits and the time, never over the question (13 Nov 2026, 2 ESO A: "El texto no me deja leer"). Since 13 Nov 2026 (Roger, playing it in class): **👀 read first**, the answers stay greyed for 2–5 seconds (longer questions longer) while a bar fills under the question, so nobody can tap without reading; **✗ a wrong answer** shows the answer, the 💡 why and **📖 the theory** of that part of the game (Starter and Base: the slide's Catalan explanation first, then the English examples), and after 5 seconds **🔁 a similar question** (same game, same part of the theory, one not answered yet when possible); wrong again → the answer and why, and they go on (Next waits 2.5 s). **🤝 Fair play**: a player someone just tried to hack can't be hacked for 1 minute (2 after a hack that worked), and nobody can hack the same player twice in a row; the hack list greys them out with ✋ and the board blocks late attempts ("✋ … is protected for now"). **✏️ Typed answers** with more than the gap count: "are doing" or "what are you doing" for "What ___ you doing?" (words of the sentence in order, every word of the answer; a wrong form still fails). The bits are only for fun: every answer is saved as a vocabulary or grammar result (📊 Results shows "🕵️ Code Breakers", with each student's % over the questions **they** answered), counts in the 🧩📚 circles, My progress and the class games part of the mark next to the class game (a new round replaces only an earlier round), and each right answer is +1 term point.

## The rules for every game

- **Safe level.** Not easy: the first demo was too easy.
- **Plenty of learning-path vocabulary**, mainly the words that are not common at the students' level (the Safe and Daring words of the learning path, not the basic ones):
  - **passive:** the words appear in the question and theory texts;
  - **active:** some questions ask for a word directly (meaning, use, collocation or preposition).
- **Theory slides between the questions**: short, a few lines, with examples. The questions after each theory slide practise it.
- **Two games per learning path (5 Nov 2026):** a **vocabulary game** (only words: meaning, use, collocations, prepositions) and a **grammar game** (only the grammar of the path). Both are linked from the learning path page with teacher-only buttons (📚 Vocabulary game, 🧩 Grammar game). Done for LS2 LP1, LP2 and LP3 in 2 ESO and 4 ESO (LP3 on 6 Nov 2026, replacing its older mixed game).
- **The grammar game explains before it asks:** each grammar point starts with explanation slides (how it is made, when we use it, examples and the typical mistake, often in a table), then 4–6 questions on it. Press Space to show the explanation one part at a time, and **CA** (or the C key) to show a short Catalan help under the slide.
- Keep it lean: about 15–20 questions and 3 theory slides in a vocabulary game, about 16 questions and 3–4 explanation slides in a grammar game.

## Results

Every game you play is saved when it ends. Open **📊 Results** (on the board, at the end of a game, or from the dashboard's Points box and Materials) and choose a group:

- **The group, game by game:** one bar per game (blue vocabulary, orange grammar) with the % of right answers; click a bar to see which questions were hardest.
- **Each student:** % right in all games, in vocabulary games and in grammar games (red under 50 %), and how many games they played. Click a student to see their games next to the class average and the questions they should review.

Only the questions whose answer you showed count, and a student who joined but didn't answer one gets it wrong. Games played before 5 Nov 2026 were not saved.

## What a game is made of

A game is only content: the engine is not changed for a new game.

- A deck file `lab/game/decks/<course>-<topic>.js` (course is `2eso` or `4eso`).
- One line in `lab/game/decks/index.js`: id, title, course, emoji, learning situation and learning path. The board lists the games by course, then by learning situation and learning path.
- The Start button on the learning path page.

In the deck, slides go in order:

- **Theory:** a title, an emoji and a few lines.
- **Question:** the question, an emoji, 2–4 options and a "why" (the explanation shown with the answer). **The first option is the right one**; the board shuffles them.
- **Written question:** the question with a gap, an emoji, the accepted answers (the first one is shown; add the contracted forms too, e.g. *is cheering* and *'s cheering*) and a "why". Capital letters and a final full stop don't matter; spelling does.
- `**word**` is highlighted and `___` is a gap.

## How to ask for a new game

Tell Claude: "Make a class game for [course] [learning situation], [learning path]". Claude takes the vocabulary and grammar from that learning path, follows these rules, adds the Start button and opens a pull request.

## Games so far

| Game | Course | Learning path |
|---|---|---|
| Vocabulary · Free-time activities | 2 ESO | LS2 Free Time, Live!, LP1 Getting started (play / go / do, how often, hobbies) |
| Grammar · Present Simple: how often? | 2 ESO | LS2 Free Time, Live!, LP1 Getting started (he / she / it + -s, questions, adverbs of frequency) |
| Vocabulary · Clothes, kit and weather | 2 ESO | LS2 Free Time, Live!, LP2 What are they doing? (clothes and kit, weather, at the event) |
| Grammar · Present Continuous | 2 ESO | LS2 Free Time, Live!, LP2 What are they doing? (form, -ing spelling, negatives, questions) |
| Vocabulary · Now or usually? Time words and sport | 2 ESO | LS2 Free Time, Live!, LP3 Now or usually? (time words, how often, doing sport, state verbs and vlog words; replaces Now or usually? Choose it, write it) |
| Grammar · Present Simple or Present Continuous? | 2 ESO | LS2 Free Time, Live!, LP3 Now or usually? (usually or now, questions and negatives, state verbs, temporary situations) |
| Vocabulary · Autumn words | 4 ESO | LS2 Seasons & Celebrations, LP1 Getting started (replaces Autumn words: choose it, write it) |
| Grammar · Talking about change | 4 ESO | LS2 Seasons & Celebrations, LP1 Getting started (get + comparative, every autumn or right now, adjective + preposition + -ing) |
| Vocabulary · Celebrations around the world | 4 ESO | LS2 Seasons & Celebrations, LP2 Celebrations around the world (traditions, adjectives, words from four celebrations) |
| Grammar · Customs, dates and It is celebrated | 4 ESO | LS2 Seasons & Celebrations, LP2 Celebrations around the world (Present Simple for customs, on / in / at, It is celebrated / takes place / is held) |
| Vocabulary · Origins, comparing and change | 4 ESO | LS2 Seasons & Celebrations, LP3 Where traditions come from (verb + preposition, dates, comparing cultures, places, change and debate; replaces Where traditions come from: choose it, write it) |
| Grammar · Origins, relatives and contrast | 4 ESO | LS2 Seasons & Celebrations, LP3 Where traditions come from (Past Simple or used to, defining relatives, whereas / unlike / although / however, non-defining relatives) |

One known limit: the deck files are public on the site, so a student who knows the address could read the answers. Nothing on the student side links to them.
