# How to make a class game

Kahoot-style games for class (Roger, 26 Oct 2026). The board runs on the projector; each student taps the answer on their Chromebook. The technical details for Claude are in `AGENTS.md`, "Class games"; this page is the readable version.

## How a game works in class

1. On the learning path page, signed in as the teacher, press **🎮 Start the class game** (only the teacher sees it). You can also open the board from the dashboard's Points box.
2. Choose the group. Every signed-in student of that group is taken into the game from whatever page they are on.
3. The board shows theory slides and questions. Students see only the question and four coloured tiles, and tap one. In a **written question** (✏️) they type the missing words instead and press Send. They can't see the right answer before the board shows it, and they never open the presentation.
4. The answer appears on the board with a short explanation once everyone has answered. After a written question the board also shows the wrong answers students wrote (without names), so you can talk about them. There is no timer: only right or wrong.
5. Points: +1 term point per right answer, the same points as the presentations. The best student in the group gets +0.5 on the term grade, the others proportionally down to 0. The dashboard exports them as CSV. The tester account can play and gets points, but never counts as the best.
6. Music plays on the projector only; the Chromebooks play only each student's tap and result sounds.

## The rules for every game

- **Safe level.** Not easy: the first demo was too easy.
- **Plenty of learning-path vocabulary**, mainly the words that are not common at the students' level (the Safe and Daring words of the learning path, not the basic ones):
  - **passive:** the words appear in the question and theory texts;
  - **active:** some questions ask for a word directly (meaning, use, collocation or preposition).
- **Theory slides between the questions**: short, a few lines, with examples. The questions after each theory slide practise it.
- **One game per learning path**, linked from that page with the teacher-only Start button.
- Keep it lean: about 15–20 questions and 3 theory slides.

## What a game is made of

A game is only content: the engine is not changed for a new game.

- A deck file `lab/game/decks/<course>-<topic>.js` (course is `2eso` or `4eso`).
- One line in `lab/game/decks/index.js`: id, title, course, emoji and learning situation.
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
| Autumn words: choose it, write it | 4 ESO | LS2 Seasons & Celebrations, LP1 Getting started (choose and write questions alternate; replaces the Autumn words slides) |
| Free-time words & how often | 2 ESO | LS2 Free Time, Live!, LP1 Getting started |
| What are they doing? Choose it, write it | 2 ESO | LS2 Free Time, Live!, LP2 What are they doing? (choose and write questions alternate) |
| Celebrations around the world: choose it, write it | 4 ESO | LS2 Seasons & Celebrations, LP2 Celebrations around the world (choose and write questions alternate) |
| Where traditions come from: choose it, write it | 4 ESO | LS2 Seasons & Celebrations, LP3 Where traditions come from (choose and write questions alternate) |

One known limit: the deck files are public on the site, so a student who knows the address could read the answers. Nothing on the student side links to them.
