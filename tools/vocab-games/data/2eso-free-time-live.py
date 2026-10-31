# 2 ESO · LS2 Free Time, Live! · vocabulary games content (built by build.py).
# Words come from the LS2 vocabulary panels (2eso/free-time-live/data/*.js, core lists per route).
# B(term, ca, definition, example, gap, inference=None, distractors=(), aliases=())
#   gap: a sentence with ____ where the term fits exactly. inference: the Plus clue (defaults to the definition).

COURSE = 2
LS = 'free-time-live'
TITLE = 'Free Time, Live!'
HERO_WORD = 'play football.'
PREVIEW = {'term': 'play football', 'ca': 'jugar a futbol', 'verb': 'play football', 'tail': 'at the weekend.'}
CATEGORIES = ['Meaning', 'In context', 'Translation', 'Use it']

BANK = [
 # Starter + Base basics
 ('always', 'sempre', 'Every time, 100 % of the time.', 'I always wear a helmet on my bike.', 'I ____ wear a helmet on my bike. Every single time!', None, ('usually', 'now', 'today')),
 ('usually', 'normalment', 'Most of the time, but not every time.', 'I usually go to the park on Sundays.', 'I ____ play football on Saturdays, but not every week.', None, ('always', 'now', 'every weekend')),
 ('now', 'ara', 'At this moment.', 'Look! It is raining now.', 'Shh! I am reading ____.', None, ('today', 'usually', 'at the moment')),
 ('today', 'avui', 'On this day.', 'Today is Saturday.', '____ I am wearing my new trainers.', None, ('now', 'usually', 'every weekend')),
 ('cap', 'gorra', 'A soft hat with a peak at the front.', 'I wear a cap when it is sunny.', 'It is sunny. Put on your ____!', None, ('helmet', 'tracksuit', 'wear a uniform')),
 ('draw', 'dibuixar', 'Make pictures with a pencil or a pen.', 'She draws comics in her free time.', 'I love art. I ____ pictures of animals.', None, ('read comics', 'listen to music', 'record a video')),
 ('play football', 'jugar a futbol', 'Kick a ball and try to score goals in a team game.', 'I play football on Saturday mornings.', 'I ____ with my team. I am the goalkeeper.', None, ('play basketball', 'watch a match', 'score a goal')),
 ('play basketball', 'jugar a bàsquet', 'Play a team game where you throw a ball into a high net.', 'We play basketball at the park.', 'We ____ at the park. I love throwing the ball into the basket.', None, ('play football', 'do gymnastics', 'go skating')),
 ('play the guitar', 'tocar la guitarra', 'Make music with an instrument with six strings.', 'She plays the guitar in a band.', 'I ____ in a band. My instrument has six strings.', None, ('play the piano', 'listen to music', 'draw')),
 ('play the piano', 'tocar el piano', 'Make music with a big instrument with black and white keys.', 'My brother plays the piano every evening.', 'I ____ at home. It has black and white keys.', None, ('play the guitar', 'listen to music', 'do yoga')),
 ("It's hot", 'fa calor', 'The weather is very warm.', "It's hot in summer: let's go swimming!", "____ today! Let's go to the beach.", None, ("It's sunny", "It's cloudy", "It's snowing"), ('it is hot',)),
 ("It's sunny", 'fa sol', 'The sun is shining.', "It's sunny, so I'm wearing my cap.", 'Wear your cap. ____ and the sky is blue.', None, ("It's hot", "It's cloudy", "It's snowing"), ('it is sunny',)),
 ("It's cloudy", 'està ennuvolat', 'There are a lot of clouds in the sky.', "It's cloudy, but it isn't raining.", 'I can\'t see the sun. ____.', None, ("It's sunny", "It's snowing", "It's hot"), ('it is cloudy',)),
 ("It's snowing", 'neva', 'White, cold flakes are falling from the sky.', "It's snowing! Let's make a snowman.", 'Look outside! ____ and everything is white.', None, ("It's cloudy", "It's sunny", 'freezing'), ('it is snowing',)),
 ('listen to music', 'escoltar música', 'Hear songs, for example with headphones.', 'We listen to music on the bus.', 'I put on my headphones and ____.', None, ('play the guitar', 'watch videos', 'read comics')),
 ('meet friends', 'quedar amb amics', 'See your friends and spend time with them.', 'I meet friends on Saturday afternoons.', 'On Saturday afternoons I ____ in the park.', None, ('send a message', 'join a club', 'take a break')),
 ('play video games', 'jugar a videojocs', 'Play games on a console, a computer or a phone.', 'He plays video games after dinner.', 'I ____ on my console after dinner.', None, ('watch videos', 'record a video', 'listen to music')),
 ('read comics', 'llegir còmics', 'Read stories told in pictures.', 'I read comics in bed.', 'I love Astèrix. I ____ in bed.', None, ('draw', 'watch videos', 'listen to music')),
 ('send a message', 'enviar un missatge', 'Write a text to someone on your phone.', 'I send a message to my mum after school.', "I'm late. I'll ____ to my mum.", None, ('record a video', 'meet friends', 'watch videos')),
 ('watch videos', 'mirar vídeos', 'Look at short films, for example on YouTube.', 'I watch videos about skateboarding.', 'I ____ on YouTube about animals.', None, ('play video games', 'record a video', 'upload a video')),
 ('at the moment', 'en aquest moment', 'Now, at this time.', "At the moment I'm doing my homework.", "I can't talk ____. I'm having a shower.", None, ('now', 'today', 'usually')),
 ('every weekend', 'cada cap de setmana', 'On every Saturday and Sunday.', 'We go cycling every weekend.', "There's no school on Saturdays and Sundays, so I play football ____.", None, ('every day', 'once a week', 'today')),
 ('do gymnastics', 'fer gimnàstica', 'Do a sport with jumps, rolls and balance exercises.', 'She does gymnastics at a club.', 'I can do a handstand because I ____ at a club.', None, ('do yoga', 'play basketball', 'go skating')),
 ('do yoga', 'fer ioga', 'Do slow stretching exercises to relax your body.', 'My mum does yoga in the morning.', 'I stretch and breathe slowly when I ____.', None, ('do gymnastics', 'take a break', 'play the piano')),
 ('my favourite', 'el meu preferit', 'The one you like the most.', 'Pizza is my favourite food.', 'Blue is ____ colour.', None, ("I don't mind", 'always', 'usually')),
 ('go skating', 'anar a patinar', 'Move on skates or a skateboard for fun.', 'They go skating at the skate park.', 'We take our skateboards and ____ at the skate park.', None, ('do gymnastics', 'play basketball', 'go outside')),
 ('helmet', 'casc', 'A hard hat that protects your head.', 'Always wear a helmet on your bike.', 'Put on your ____ before you ride your bike.', None, ('cap', 'tracksuit', 'wear a uniform')),
 ("I don't mind", "no m'importa", 'It is OK for me: I neither like it nor dislike it.', "I don't mind doing homework.", 'Football or basketball? ____. Both are OK.', None, ('my favourite', 'always', 'usually'), ('i do not mind',)),
 ('take a break', 'fer una pausa', 'Stop for a short time to rest.', 'Take a break and drink some water.', "You're tired. Stop and ____ for ten minutes.", None, ('switch off your phone', 'put your phone away', 'go outside'), ('have a break',)),
 ('put your phone away', 'guarda el mòbil', 'Put your phone in your bag or your pocket.', 'Put your phone away at dinner.', "We're having dinner. Please ____ in your bag.", None, ('switch off your phone', 'take a break', 'send a message')),
 ('switch off your phone', 'apaga el mòbil', 'Turn your phone off completely.', 'Switch off your phone at the cinema.', 'The film is starting. Please ____.', None, ('put your phone away', 'take a break', 'send a message'), ('turn off your phone',)),
 ('record a video', 'gravar un vídeo', 'Film something with a camera or a phone.', 'I record a video for my vlog.', 'Hold the phone still and ____ of the concert.', None, ('watch videos', 'upload a video', 'send a message')),
 ('tracksuit', 'xandall', 'Comfortable trousers and a jacket for doing sport.', 'I wear a tracksuit for PE.', 'For PE I wear my ____ and my trainers.', None, ('wear a uniform', 'helmet', 'cap')),
 ('wear a uniform', 'portar uniforme', 'Put on the same clothes as the rest of your team or school.', 'Football players wear a uniform.', 'All the players in my team ____: red shirts and white shorts.', None, ('wear a costume', 'tracksuit', 'helmet')),
 ('wear a costume', 'portar una disfressa', 'Put on special clothes to look like someone else.', 'At carnival I wear a costume.', 'At carnival I ____ and look like a pirate.', None, ('wear a uniform', 'tracksuit', 'cap')),
 # Core
 ('at the weekend', 'el cap de setmana', 'On Saturday and Sunday.', 'I meet friends at the weekend.', "I don't have school ____, so I play football.", None, ('every day', 'once a week', 'in my free time')),
 ('be good at', 'ser bo en', 'Do something very well.', 'She is good at drawing.', 'You need a lot of practice to ____ tennis.', 'Your friend always wins at chess. She is very… it.', ('get better at', 'practise', 'train hard')),
 ('check a website', 'consultar una web', 'Look at a page on the internet to find information.', 'I check a website for the weather.', 'Before the trip, I ____ to see the bus timetable.', None, ('search online', 'follow a channel', 'download an app')),
 ('download an app', 'descarregar una app', 'Put a new program on your phone from the internet.', 'I download an app to learn English.', 'I ____ from the app store. It is free.', None, ('upload a video', 'search online', 'check a website')),
 ('degrees', 'graus', 'The unit we use to measure temperature.', "It's 30 degrees today!", "It's hot: it's 32 ____ today.", None, ('temperature', 'freezing', 'every day')),
 ('follow a channel', 'seguir un canal', 'Subscribe to see all the new videos of a YouTuber.', 'I follow a channel about football.', 'I ____ about cooking on YouTube. I watch every new video.', None, ('upload a video', 'social media', 'check a website')),
 ('get better at', 'millorar en', 'Improve: become better at doing something.', 'I practise every day to get better at the guitar.', 'I practise every day to ____ the guitar.', 'You practise and every month you play a little better. You… the guitar.', ('be good at', 'practise', 'train hard')),
 ('train hard', 'entrenar fort', 'Practise a sport a lot and with a lot of effort.', 'We train hard before a big match.', 'We want to win the tournament, so we ____ every day.', None, ('practise', 'get better at', 'watch a match')),
 ('in my free time', 'en el meu temps lliure', "When I'm not at school and have no homework.", 'In my free time I draw.', '____ I read comics and play the guitar.', None, ('at the weekend', 'once a week', 'every day')),
 ('join a club', 'apuntar-se a un club', 'Become a member of a group that does an activity.', 'He wants to join a climbing club.', 'I love chess, so I want to ____ at school.', 'You become a member of a climbing group. You…', ('take part in', 'meet friends', 'train hard')),
 ('sleep well', 'dormir bé', 'Have a good, long sleep at night.', 'Keep your phone out of your bedroom to sleep well.', "Don't use your phone in bed if you want to ____.", None, ('take a break', 'train hard', 'practise')),
 ('social media', 'xarxes socials', 'Apps and websites where people share photos and messages, like Instagram.', "I don't use social media at night.", 'My sister posts photos on ____ every day.', None, ('follow a channel', 'check a website', 'upload a video')),
 ('a tournament', 'un torneig', 'A competition with a lot of teams and matches.', 'Our team is playing in a tournament.', 'Sixteen teams are playing in ____ this weekend.', None, ('score a goal', 'watch a match', 'join a club'), ('tournament',)),
 ('once a week', 'un cop per setmana', 'One time every week.', 'I go swimming once a week.', 'I only go swimming ____: on Mondays.', None, ('every day', 'at the weekend', 'in my free time')),
 ('practise', 'practicar', 'Do something again and again to improve.', 'They practise after school.', 'To play the guitar well, you need to ____ a lot.', None, ('train hard', 'get better at', 'be good at'), ('practice',)),
 ('search online', 'buscar en línia', 'Look for information on the internet.', 'I search online for skateboard tips.', "I don't know the answer. Let's ____.", None, ('check a website', 'download an app', 'follow a channel')),
 ('score a goal', 'marcar un gol', 'Put the ball in the net in football.', 'She scores a goal in every match.', 'Kick the ball into the net to ____!', None, ('watch a match', 'a tournament', 'play football')),
 ('temperature', 'temperatura', 'How hot or cold something is.', 'The temperature is 5 degrees.', 'The ____ is very low today: only 2 degrees.', None, ('degrees', 'freezing', 'at the moment')),
 ('upload a video', 'pujar un vídeo', 'Put a video from your phone onto the internet.', 'I upload a video to my channel every Friday.', 'I ____ to my channel every Friday.', None, ('record a video', 'download an app', 'follow a channel')),
 ('watch a match', 'mirar un partit', 'Look at a game, for example on TV or in a stadium.', 'We watch a match on TV on Sundays.', 'We go to the stadium to ____.', None, ('score a goal', 'a tournament', 'play football')),
 ('every day', 'cada dia', 'On all the days of the week.', 'He practises every day.', 'I brush my teeth ____: from Monday to Sunday.', None, ('once a week', 'at the weekend', 'in my free time')),
 ('freezing', 'gèlid', 'Extremely cold.', "It's freezing: wear a coat!", "It's minus five degrees. It's ____!", None, ('degrees', 'temperature', "It's snowing")),
 # Plus
 ('addictive', 'addictiu', 'So hard to stop that you want it all the time.', 'This game is really addictive.', "I can't stop playing this game. It's very ____.", 'You open the app for five minutes, and two hours later you still can\'t stop. The app is…', ('healthy', 'a habit', 'concentrate')),
 ('believe', 'creure', 'Think that something is true.', 'I believe this source is reliable.', 'I ____ that you can win. You are very good!', 'You are sure that a story is true. You… it. (A state verb: no -ing.)', ('know', 'understand', 'prefer')),
 ('concentrate', 'concentrar-se', 'Think carefully about one thing only.', "I can't concentrate with my phone next to me.", 'Turn off notifications so you can ____ on your homework.', "Notifications keep beeping, and you can't think about your homework. You can't…", ('understand', 'take part in', 'a habit')),
 ('up to date', 'actualitzat', 'New, with the latest information.', 'Check that the website is up to date.', "This website is from 2010. It isn't ____.", 'A website was changed yesterday, so its information is…', ('a reliable source', 'the author', 'an advert'), ('up-to-date',)),
 ('cheer', 'animar', 'Shout to support a team or a player.', 'The fans cheer when we score.', 'The fans ____ when their team scores.', 'You shout "Come on!" and clap for your team. You…', ('warm up', 'the crowd', 'take part in')),
 ('instead of', 'en lloc de', 'In the place of something else.', 'Read a book instead of using your phone.', 'Go outside ____ playing video games all day.', "You don't watch TV: you read a book. You read a book… watching TV.", ('a habit', 'healthy', 'spend time')),
 ('a habit', 'un hàbit', 'Something you do regularly, often without thinking.', 'Reading before bed is a good habit.', 'Reading every night is ____ I want to keep.', 'You check your phone every morning without thinking about it. It is…', ('addictive', 'healthy', 'instead of'), ('habit',)),
 ('take part in', 'participar en', 'Be one of the people who do an activity.', 'I take part in a dance competition.', 'Twenty schools ____ the tournament every year.', "You aren't watching the race: you are one of the runners. You… the race.", ('join a club', 'cheer', 'warm up')),
 ('know', 'saber, conèixer', 'Have information in your head.', 'I know the answer.', "I ____ the answer: it's Paris!", 'A state verb: you have the information in your head. "I… the answer."', ('understand', 'believe', 'need')),
 ('mean', 'voler dir', 'Have a meaning; express an idea.', 'What does "helmet" mean?', 'What does this word ____?', 'You ask: "What does vlog…?"', ('understand', 'know', 'believe')),
 ('need', 'necessitar', 'Must have something.', 'I need a helmet for my bike.', 'I ____ a new helmet: mine is broken.', "Without a racket you can't play tennis. You… a racket.", ('prefer', 'know', 'believe')),
 ('the crowd', 'el públic', 'A big group of people watching an event.', 'The crowd cheers the players.', '____ is shouting and clapping in the stadium.', 'Thousands of people in the stadium watching the match.', ('cheer', 'the author', 'take part in'), ('crowd',)),
 ('prefer', 'preferir', 'Like one thing more than another.', 'I prefer football to basketball.', 'I ____ books to films.', 'You like football, but you like tennis more. You… tennis to football.', ('need', 'believe', 'know')),
 ('a reliable source', 'una font fiable', 'A place with information you can trust.', 'An encyclopedia is a reliable source.', 'Check the facts with ____, not a random post.', 'A website written by experts, with dates and references.', ('up to date', 'the author', 'an advert'), ('reliable source',)),
 ('spend time', 'passar temps', 'Use your time doing something.', 'I spend time playing the guitar.', 'I like to ____ with my grandparents.', 'You use two hours of your Saturday on chess. You… playing chess.', ('take part in', 'instead of', 'a habit')),
 ('the author', "l'autor/a", 'The person who wrote a text.', 'Who is the author of this post?', 'Check who ____ of the article is.', 'The person who wrote the article.', ('a reliable source', 'the crowd', 'an advert'), ('author',)),
 ('understand', 'entendre', 'Know what something means.', "I don't understand this word.", "Can you repeat, please? I don't ____.", 'Your teacher explains it twice, and now it is clear. Now you… it.', ('know', 'mean', 'believe')),
 ('an advert', 'un anunci', 'A short text or video that wants you to buy something.', 'That video is really an advert for trainers.', "This isn't a news story. It's ____ for a new phone.", 'A video that tells you to buy new trainers.', ('a reliable source', 'the author', 'up to date'), ('advert', 'an ad', 'an advertisement')),
 ('warm up', 'escalfar', 'Do light exercise before sport.', 'We warm up before the match.', 'Before the match, we run slowly and ____.', 'Ten minutes of easy running and stretching before training.', ('train hard', 'cheer', 'take part in')),
 ('healthy', 'saludable', 'Good for your body and your mind.', 'Going outside is healthy.', 'Going for a walk is a ____ habit.', 'Fruit, sleep and sport are good for you. They are…', ('addictive', 'a habit', 'instead of')),
]

ROSCO = {
 'beginners': 'A always|C cap|D draw|F play football|G play the guitar|H It\'s hot|I It\'s sunny|L listen to music|M meet friends|N now|P play video games|R read comics|S send a message|T today|U usually|W watch videos',
 'insecure': "A at the moment|B play basketball|C It's cloudy|D do gymnastics|E every weekend|F my favourite|G go skating|H helmet|I I don't mind|K take a break|L listen to music|M meet friends|N It's snowing|O put your phone away|P play the piano|R record a video|S switch off your phone|T tracksuit|U wear a uniform|V play video games|W wear a costume|Y do yoga",
 'safe': 'A at the weekend|B be good at|C check a website|D download an app|E degrees|F follow a channel|G get better at|H train hard|I in my free time|J join a club|L sleep well|M social media|N a tournament|O once a week|P practise|R search online|S score a goal|T temperature|U upload a video|W watch a match|Y every day|Z freezing',
 'daring': 'A addictive|B believe|C concentrate|D up to date|E cheer|F instead of|G get better at|H a habit|I take part in|J join a club|K know|M mean|N need|O the crowd|P prefer|R a reliable source|S spend time|T the author|U understand|V an advert|W warm up|Y healthy',
}

# Jeopardy "Use it" column (5 per route, 100→500). (prompt, answer, options, note, aliases)
USE_IT = {
 'beginners': [
  ('Look! Maria ____ football now.', 'is playing', ['is playing', 'plays'], 'Now → Present Continuous: is playing.'),
  ('I ____ play video games on Sundays.', 'usually', ['usually', 'now'], 'A habit → usually + Present Simple.'),
  ('I love ____ comics.', 'reading', ['reading', 'read'], 'love + -ing: I love reading.'),
  ('____ sunny today.', "It's", ["It's", 'It'], "Weather: It's sunny / It's hot."),
  ('He ____ the guitar every day.', 'plays', ['plays', 'play'], 'he / she / it + -s: he plays.'),
 ],
 'insecure': [
  ('Listen! My sister ____ the piano.', 'is playing', ['is playing', 'plays', 'play'], 'Listen! → it is happening now: is playing.'),
  ('We ____ basketball every weekend.', 'play', ['play', 'are playing', 'plays'], 'every weekend → Present Simple: we play.'),
  ("I don't mind ____ a uniform.", 'wearing', ['wearing', 'wear', 'to wearing'], "don't mind + -ing."),
  ('____ your phone away, please!', 'Put', ['Put', 'Puts', 'Putting'], 'Imperative: the verb with no subject.'),
  ('What ____ you doing at the moment?', 'are', ['are', 'do', 'is'], 'Present Continuous question: What are you doing?'),
 ],
 'safe': [
  ("Complete: I'm good ____ drawing.", 'at', [], 'be good at + -ing.'),
  ('Write the -ing form: They are ____ (train) for the tournament.', 'training', [], 'train → training.'),
  ('Present Simple or Continuous? He usually ____ (practise) after school.', 'practises', [], 'usually → Present Simple, he → -s.', ('practices',)),
  ('Plans: I ____ (go) to a concert this weekend.', 'am going', [], 'A plan for this weekend → Present Continuous.', ("'m going", 'i am going', "i'm going")),
  ('Screen tip, imperative: ____ notifications before bed. (turn off)', 'Turn off', [], 'Imperative: Turn off notifications.', ('switch off',)),
 ],
 'daring': [
  ('Correct the mistake: "I am knowing the answer."', 'I know the answer.', [], 'know is a state verb: no -ing.'),
  ('Correct the mistake: "She is preferring football."', 'She prefers football.', [], 'prefer is a state verb: she prefers.'),
  ('Correct the mistake: "I spend time to play the guitar."', 'I spend time playing the guitar.', [], 'spend time + -ing.'),
  ('Correct the mistake: "We are needing a new helmet."', 'We need a new helmet.', [], 'need is a state verb: we need.'),
  ('Correct the mistake: "He takes part on a tournament."', 'He takes part in a tournament.', [], 'take part in.'),
 ],
}

# Sentence Scramble: Starter uses the chunks (|) and sees the Catalan sentence; Plus gets 2 extra tiles.
SCRAMBLE = {
 'beginners': [
  ('I|play football|at the weekend.', 'Jo jugo a futbol el cap de setmana.'),
  ('She|is listening|to music|now.', 'Ella està escoltant música ara.'),
  ("It's|sunny|today.", 'Avui fa sol.'),
  ('I|love|reading comics.', "M'encanta llegir còmics."),
  ('We|meet friends|on Saturdays.', 'Quedem amb amics els dissabtes.'),
  ('He|is wearing|a cap.', 'Ell porta una gorra (ara).'),
  ('I|usually|watch videos|after school.', "Normalment miro vídeos després de l'escola."),
  ('Take a break|and|go outside.', 'Fes una pausa i surt a fora.'),
 ],
 'insecure': [
  ('Look! They are playing basketball.', ()),
  ("I don't mind wearing a uniform.", ()),
  ('My sister plays the piano every weekend.', ('Every weekend my sister plays the piano.',)),
  ('Put your phone away at dinner.', ('At dinner put your phone away.',)),
  ("It's snowing at the moment.", ("At the moment it's snowing.",)),
  ('Do you go skating on Saturdays?', ()),
  ('I hate doing homework on Sundays.', ('On Sundays I hate doing homework.',)),
  ('He is recording a video for his vlog.', ()),
 ],
 'safe': [
  ('I go swimming once a week.', ('Once a week I go swimming.',)),
  ('She is good at drawing comics.', ()),
  ('We are training hard for the tournament.', ()),
  ('Set a time limit for social media.', ()),
  ('I upload a video to my channel every Friday.', ('Every Friday I upload a video to my channel.',)),
  ("What's the weather like today?", ()),
  ('He wants to get better at the guitar.', ()),
  ('Keep your phone out of your bedroom to sleep well.', ()),
 ],
 'daring': [
  ('I prefer reading to watching videos.', ('am', 'read')),
  ('She spends time practising the guitar.', ('to', 'practise')),
  ('Check the author before you share a post.', ('checking', 'on')),
  ('Read a book instead of using your phone.', ('use', 'to')),
  ('We take part in a tournament every year.', ('on', 'takes')),
  ("I don't need my phone in bed.", ('am', 'needing')),
  ('The crowd cheers when we score a goal.', ('cheering', 'scores')),
  ('Is this website a reliable source?', ('Does', 'reliability')),
 ],
}

SYNONYMS = [['now', 'at the moment'], ['switch off your phone', 'put your phone away'], ['practise', 'train hard'], ['be good at', 'get better at'], ['always', 'every day'], ['at the weekend', 'every weekend'], ['know', 'understand']]

TRANSFER = {
 'beginners': 'Say one thing you love doing in your free time: "I love + -ing…"',
 'insecure': 'Tell a partner two free-time activities: one you usually do and one you are doing this week.',
 'safe': 'Describe your favourite hobby: how often you do it, where you do it, and how you can get better at it.',
 'daring': 'Compare your screen time with a partner. Give one tip and explain why it matters with I think, I believe or I need.',
}

PICTURES = [
 {'id': 'football', 'answer': 'playing football', 'aliases': ['play football', 'football', 'playing soccer', 'soccer', 'scoring a goal', 'score a goal'], 'hint': 'A team sport with a ball and a goal.', 'clues': ['There is a green pitch.', 'Someone is kicking a ball.', 'There is a goal with a net.'], 'transfer': 'Say when and where you play a sport, and how often you play it.'},
 {'id': 'guitar', 'answer': 'playing the guitar', 'aliases': ['play the guitar', 'guitar', 'playing guitar', 'play guitar', 'playing music', 'making music'], 'hint': 'Music with six strings.', 'clues': ['Someone is sitting in a bedroom.', 'There are musical notes in the air.', 'The instrument has six strings.'], 'transfer': 'Tell a partner about an instrument or a hobby you would like to try, and why.'},
 {'id': 'vlog', 'answer': 'recording a video', 'aliases': ['record a video', 'making a vlog', 'make a vlog', 'recording a vlog', 'filming', 'filming a video', 'vlogging'], 'hint': 'A phone on a stand films a person.', 'clues': ['A phone is on a small stand.', 'A person is waving at the camera.', 'There is a red REC light.'], 'transfer': 'Start your own vlog out loud: "Hi everyone! Welcome to my vlog. Today I\'m…"'},
 {'id': 'skating', 'answer': 'going skating', 'aliases': ['go skating', 'skating', 'skateboarding', 'riding a skateboard', 'skate'], 'hint': 'Wheels, a board and a helmet.', 'clues': ['It is sunny at the skate park.', 'Someone is wearing a helmet.', 'The board has four wheels.'], 'transfer': 'Describe what you are wearing for your favourite sport and what the weather is like.'},
]

ROUTE_DETAIL = {
 'beginners': "Les paraules bàsiques de la LS (temps lliure, roba, temps, pantalles), amb una pista en català i sempre amb opcions per triar. Frases en blocs.",
 'insecure': "Totes les paraules de la LS. Al Rosco escrius la resposta (pots demanar pista de lletres); a la resta tries entre 3 o 4 opcions i ordenes paraules soltes.",
 'safe': 'English definitions and written answers: events, sport, online life and healthy screen habits. Present Simple or Continuous in context.',
 'daring': 'Infer words from situations, fix state-verb mistakes (know, need, prefer) and build sentences with extra words.',
}
