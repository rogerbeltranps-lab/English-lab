# English Lab project guidance

Planned clean-up of the code structure: see [the roadmap](docs/roadmap.md).

## Start from working examples
- Before implementing a page or feature, inspect the closest successful page in the repository and reuse its structure, styles and interaction patterns where appropriate.
- Use each course’s `my-real-routine/getting-started.html` as the shell/topbar reference. Reuse `shared/css/layout.css`, `topbar.css`, `activities.css` and existing shared helpers rather than creating a new visual system.
- Keep the existing course palettes: **2ESO green**, **4ESO blue**. Copy the reference page’s exact theme variables, tinted backgrounds, borders, shadows, typography and card treatment; do not approximate colours.
- Preserve responsive layouts, navigation, scoring, feedback and route-specific progress unless the requested change requires otherwise. Keep edits focused.

## Route language and scaffolding
- **Insecure:** pedagogical instructions, explanations, strategy tips, checklists, step-by-step guidance and corrective feedback are in **Catalan**. Use clear scaffolding and worked examples; explain briefly what went wrong and what to notice.
- **Safe:** instructions and explanations are in **English**. Catalan may appear only as limited vocabulary support, such as hover/focus meanings.
- **Daring:** English-first, with greater learner autonomy and less scaffolding.
- **English remains the target language** for vocabulary, listening/reading input, model sentences, interview questions where appropriate, slide content and student production. Do not translate these into Catalan when adding scaffolding.
- Reuse route-aware support such as `shared/js/learning-path-support.js` where appropriate; verify language updates correctly when switching routes.

## Levels, listenings, videos and readings
- Each route has the level agreed in the levels document of the teaching programme:

  | Course | Year horizon | Insecure | Safe | Daring |
  | --- | --- | --- | --- | --- |
  | 1ESO | A1 consolidated; starting A2 tasks | A1 with a lot of support | A1 consolidated | A1+ / early A2 |
  | 2ESO | Functional A2 | A1+ / early A2 with scaffolding | Functional A2 | A2+ / emerging B1 |
  | 3ESO | More autonomous A2; towards B1 | A2 with support | More autonomous A2 | Emerging B1 |
  | 4ESO | B1 as the final horizon | A2 / A2+ with support | Indicative B1 | B1 / B1+ |

  Content marked as an extension of the next level (for example B1+ in 4ESO) goes only to Daring. This school year the site covers **2ESO and 4ESO** only.
- **Listenings and videos are pitched at the Safe level**, and every route hears the same input. Do not write separate scripts per route.
- **The activities around that input adapt to each route's level:** questions, tasks, support, hints and the language of instructions. Insecure gets easier questions, support in Catalan and, where possible, a slower version of the audio. Daring gets the more demanding questions (inference, comparison, opinion).
- **Reading texts are different: they vary by route.** Each route reads a version written at its own level (for 4ESO: A2 / A2+ for Insecure, B1 for Safe, B1 / B1+ for Daring), on the same topic and with the same key information, so the whole class can share the content. Adapt length, sentence complexity, vocabulary and grammar to the level; the questions follow the route's text.
- Mix real, level-appropriate listenings with generated ones. Never call a paid generation service (for example ElevenLabs) or spend its credits without the user's explicit permission for that specific generation. An approved script is not permission to generate.
- **Generated audio files:** MP3s live in the LS folder's `audio/` (for example `4eso/seasons-and-celebrations/audio/culture-bites-origins.mp3`) and are referenced from the LS data as `media.audio`. The slow version for Insecure sits next to it with a `-slow` suffix (`culture-bites-origins-slow.mp3`).
- **ElevenLabs settings:** model `eleven_multilingual_v2`, one call per script line (one premade voice per character), lines joined with 0.45 s pauses and loudness-normalised (`loudnorm=I=-16:TP=-1.5`, mono, 96 kbps). Keep the same voice for a character across an LS (LS2: Emma = Alice, Sam = George, Laia = Jessica, Omar = Liam, radio presenter = Daniel).
- **Slow versions are always made locally, never with a second paid generation:** apply ffmpeg `atempo=0.85` to the same line clips and join them with 0.9 s pauses.

## Grammar
- Grammar content is specific to each Learning Situation. Do not assume the same grammar across future Learning Situations.
- Follow the grammar requirements defined for the current LS.
- Differentiate routes mainly through scaffolding, complexity, amount of support and learner independence.

## Vocabulary and matching
- Vocabulary reference: `2eso/my-real-routine/a-day-in-my-life.html`. Reuse thematic groups (`.vocab-group`), compact expression pills (`.chip`) and hover **and keyboard-focus** support (`.chip-tooltip`) showing a Catalan meaning plus an English example. Adapt through the existing course palette.
- Matching tests only expressions explicitly studied in the route, cumulatively where appropriate. Do not accept untaught combinations merely because they sound natural in English.
- Judge the studied expression, not the original item ID or position. Identical left-side tiles must be interchangeable.
- Curate or validate generated sets so every round remains completable and pedagogically unambiguous; cumulative routes must meaningfully cover newly introduced vocabulary.
- Represent alternatives explicitly and naturally; avoid generic slash-splitting, awkward fragments and incomplete expression templates.
- Tell students to match studied Learning Path expressions even when other English combinations sound natural, and that identical tiles can be used interchangeably. Apply the route-language rules above.

## Flashcards
- Flashcard practice uses a **random set of up to 10 cards** (all cards if the deck has fewer). Do not make students work through the whole deck.
- The student **flips** the card, then chooses **Got it** or **Again**. The rating buttons stay disabled until the card is flipped. An **Again** card comes back before the student moves on, and the step is complete when every card in the set is **Got it**.
- "New set" gives a different random set. The counter keeps the format `Card 6 of 10 · Practising · 5/10 known`; Insecure shows it and the instructions in Catalan.
- Reuse the existing implementations (`flashcard-set` logic in the vocabulary pages and `shared/js/flashcard-set.js`) instead of writing a new one.

## Answer options
- **Randomize the answer options, never the questions.** Multiple-choice options and dropdown options are shuffled every time a question is shown, so the correct answer is not always in the same position. Question order stays as written.
- Use `learningSupport.shuffled()` / `learningSupport.shuffledIndexes()` from `shared/js/learning-path-support.js` (include that file in every page that renders questions). Keep each option's original value so scoring and feedback do not change.
- Do not change the wording of questions or options when shuffling.

## Final Product
- Before working on My Real Routine in either 2ESO or 4ESO, read [its LS guidance](docs/learning-situations/my-real-routine.md).
- Before working on 4ESO Seasons & Celebrations, read [its LS guidance](docs/learning-situations/seasons-and-celebrations.md).
- Follow the current LS’s route requirements and submission format.
- Required task elements must be explicit and must not be added to routes that do not require them. Language criteria support the task rather than obscure it.

## Content-first workflow
- Read the applicable LS guidance and current course overview (containing all three routes). Implement only content explicitly approved by the user; website content and extracted drafts are not automatically approved. Preserve previously agreed requirements and the last approved content separately from proposed revisions. Flag missing information or contradictions and resolve them with the user before implementing the affected part. Technical and layout decisions may follow existing project rules, but agents must not invent or change pedagogical content during implementation. See [My Real Routine's review workflow](docs/learning-situations/my-real-routine.md#content-review-and-approval).

## Verification and repository hygiene
- Check affected routes, route switching, interactive feedback and progress. For matching changes, verify duplicate interchangeability, alternatives, round completion and route coverage.
- Check changed JavaScript syntax and run `git diff --check`. Use isolated browser automation when available; do not require macOS App Management or broader system permissions. Report programmatic-only verification honestly when browser automation is unavailable.
- Preserve existing user changes. **Do not commit or push unless explicitly asked.**
