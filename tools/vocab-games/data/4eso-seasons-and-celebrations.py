# 4 ESO · LS2 Seasons & Celebrations · vocabulary games content (built by build.py).
# Words come from the LS2 vocabulary panels (4eso/seasons-and-celebrations/data/*.js, core lists per route;
# Starter words from the Getting started Beginners groups and the beginners core lists).
# B(term, ca, definition, example, gap, inference=None, distractors=(), aliases=())

COURSE = 4
LS = 'seasons-and-celebrations'
TITLE = 'Seasons & Celebrations'
HERO_WORD = 'dress up.'
PREVIEW = {'term': 'dress up', 'ca': 'disfressar-se', 'verb': 'dress up', 'tail': 'at Halloween.'}
CATEGORIES = ['Meaning', 'In context', 'Translation', 'Use it']

BANK = [
 # Starter
 ('autumn', 'tardor', 'The season after summer, when leaves fall.', 'Autumn is my favourite season.', 'In ____ the leaves change colour and fall.', None, ('winter', 'rainy', 'in November'), ('fall',)),
 ('winter', 'hivern', 'The coldest season of the year.', "It's very cold in winter.", 'Christmas is in ____, when it is cold.', None, ('autumn', 'rainy', 'happy')),
 ('rainy', 'plujós', 'With a lot of rain.', "Take an umbrella: it's rainy.", "Take an umbrella. It's cold and ____ today.", None, ('winter', 'autumn', 'excited')),
 ('chestnuts', 'castanyes', 'Brown nuts that people roast in autumn.', 'We roast chestnuts at the Castanyada.', 'At the Castanyada we roast ____ and eat panellets.', None, ('sweet potatoes', 'pumpkins', 'gift')),
 ('sweet potatoes', 'moniatos', 'Orange vegetables that people roast in autumn.', 'Sweet potatoes are delicious.', 'We eat roasted ____ and chestnuts on 31 October.', None, ('chestnuts', 'pumpkins', 'gift')),
 ('pumpkins', 'carbasses', 'Big orange vegetables. People carve faces in them at Halloween.', 'People carve pumpkins at Halloween.', 'At Halloween people carve faces in ____.', None, ('chestnuts', 'sweet potatoes', 'candles')),
 ('fireworks', 'focs artificials', 'Colourful explosions of light in the night sky.', 'We watch the fireworks on New Year\'s Eve.', 'At midnight there are loud, colourful ____ in the sky.', None, ('candles', 'lights', 'parade')),
 ('candles', 'espelmes', 'Sticks of wax that give light when you light them.', 'We put candles on the birthday cake.', 'There are ten ____ on my birthday cake.', None, ('fireworks', 'lights', 'gift')),
 ('light candles', 'encendre espelmes', 'Start a small flame on candles.', 'We light candles at Diwali.', 'At Diwali families ____ and put them by the windows.', None, ('give presents', 'decorations', 'dress up')),
 ('gift', 'regal', 'Something you give to someone on a special day.', 'This gift is for my sister.', 'I wrap a ____ for my friend\'s birthday.', None, ('present', 'candles', 'chestnuts'), ('a gift', 'present')),
 ('dress up', 'disfressar-se, mudar-se', 'Wear a costume or special clothes.', 'Children dress up at Halloween.', 'At carnival we ____ as pirates.', None, ('decorate', 'celebrate', 'light candles')),
 ('excited', 'il·lusionat/da', 'Very happy because something good is going to happen.', "I'm excited about the party.", 'The party is tomorrow! I\'m so ____!', None, ('happy', 'rainy', 'tradition')),
 ('happy', 'content/a', 'Feeling good.', "I'm happy at Christmas.", 'We are ____ because all the family is here.', None, ('excited', 'rainy', 'winter')),
 ('invite people', 'convidar gent', 'Ask people to come to your party or event.', 'We invite people to our festival.', 'We send a message to ____ to our party.', None, ('meet friends', 'buy tickets', 'give presents')),
 ('meet friends', 'quedar amb amics', 'See your friends and spend time with them.', 'I meet friends in the town square.', 'On Saturday I ____ at the festival.', None, ('invite people', 'buy tickets', 'visit relatives')),
 ('buy tickets', 'comprar entrades', 'Pay to go to a concert, a match or a show.', 'We buy tickets for the concert online.', 'We want to see the concert, so we ____ online.', None, ('book a room', 'invite people', 'meet friends')),
 ('in November', 'al novembre', 'During the eleventh month of the year.', 'All Saints\' Day is in November.', 'All Saints\' Day is ____, on the first.', None, ('at night', 'every year', 'once a year'), ('in november',)),
 ('tradition', 'tradició', 'Something people have done in the same way for a long time.', 'The Castanyada is a Catalan tradition.', 'Eating panellets on 31 October is a Catalan ____.', None, ('custom', 'festival', 'holiday')),
 # Base
 ('at night', 'a la nit', 'When it is dark, after the evening.', 'We watch the fireworks at night.', 'You can see the lights ____, when it is dark.', None, ('every year', 'in November', 'the night before')),
 ('celebrate', 'celebrar', 'Do something special for an important day.', 'We celebrate Diwali with lights.', 'How do you ____ your birthday?', None, ('decorate', 'dress up', 'visit relatives')),
 ('decorations', 'decoració', 'Things you put up to make a place look nice for a party.', 'We put up decorations for Christmas.', 'The streets are full of lights and ____ at Christmas.', None, ('lights', 'candles', 'parade'), ('decoration',)),
 ('every year', 'cada any', 'Once in each year, again and again.', 'We celebrate the Castanyada every year.', 'My birthday party is ____ in June.', None, ('once a year', 'at night', 'in November')),
 ('festival', 'festival, festa', 'A big public celebration with music, food or shows.', 'There is a music festival in summer.', 'The town has a summer ____ with music and food stalls.', None, ('holiday', 'parade', 'tradition')),
 ('give presents', 'fer regals', 'Give gifts to people you love.', 'We give presents at Christmas.', 'On birthdays we ____ to our friends.', None, ('visit relatives', 'light candles', 'celebrate'), ('give gifts', 'give a present')),
 ('holiday', 'festiu, vacances', 'A day with no school or work.', 'The first of November is a holiday.', 'There is no school on Monday because it\'s a ____.', None, ('festival', 'tradition', 'custom')),
 ('I am writing to', 'Us escric per', 'A formal way to start an email and say why you write.', 'I am writing to ask for the school hall.', 'Dear Mr Roca, ____ ask about the festival.', None, ('We would like to', 'Yours sincerely', 'invite people'), ("i'm writing to",)),
 ('book a room', 'reservar una sala', 'Ask to use a room on a date.', 'We need to book a room for the party.', 'For the party we ____ at the community centre.', None, ('buy tickets', 'invite people', 'give presents')),
 ('lights', 'llums', 'Small lamps that shine, often in colours.', 'There are lights in the streets at Christmas.', 'At Diwali, houses are full of colourful ____.', None, ('candles', 'decorations', 'fireworks')),
 ('custom', 'costum', 'A usual way of doing things in a place.', "It's a custom to eat grapes at midnight.", "It's a ____ to eat twelve grapes on New Year's Eve.", None, ('tradition', 'holiday', 'festival')),
 ('once a year', 'un cop l\'any', 'One time every year.', 'Carnival happens once a year.', 'Carnival only happens ____, in February.', None, ('every year', 'the night before', 'at night')),
 ('present', 'regal', 'A gift.', 'I open my presents on 6 January.', 'This ____ is for you. Happy birthday!', None, ('gift', 'candles', 'decorations'), ('a present', 'gift')),
 ('parade', 'desfilada', 'A line of people, music and floats moving through the streets.', 'The carnival parade goes through the town.', 'Thousands of people watch the carnival ____ in the street.', None, ('festival', 'fireworks', 'decorations')),
 ('special meal', 'àpat especial', 'A big, nice lunch or dinner for a celebration.', 'We have a special meal at Christmas.', 'On Christmas Day we have a ____ with all the family.', None, ('give presents', 'visit relatives', 'celebrate'), ('a special meal',)),
 ('the night before', 'la nit abans', 'The evening before a special day.', 'Children are excited the night before Christmas.', 'We prepare everything ____ the party.', None, ('at night', 'once a year', 'every year')),
 ('visit relatives', 'visitar familiars', 'Go to see your family members, like your cousins or your grandparents.', 'We visit relatives at Christmas.', 'At Christmas we ____ in Girona: my aunt and my cousins.', None, ('give presents', 'meet friends', 'celebrate')),
 ('We would like to', 'Ens agradaria', 'A polite, formal way to say what you want.', 'We would like to organise a festival.', '____ use the school hall on Friday.', None, ('I am writing to', 'Yours sincerely', 'Kind regards'), ("we'd like to",)),
 ('Yours sincerely', 'Atentament', 'A formal way to end a letter or an email.', 'Yours sincerely, Anna', '…Thank you for your help. ____, Pau', None, ('Kind regards', 'We would like to', 'I am writing to')),
 ('decorate', 'decorar', 'Make something look nice with decorations.', 'We decorate the tree in December.', 'We ____ the classroom with pumpkins.', None, ('celebrate', 'dress up', 'light candles')),
 # Core
 ('pass down', 'transmetre (de generació en generació)', 'Give a tradition or knowledge to younger people in your family.', 'My grandma passes down her panellets recipe.', 'Grandparents ____ old songs to their grandchildren.', 'Your grandmother taught your mum the recipe, and now your mum teaches you. The recipe is…', ('share a meal', 'gather', 'keep a tradition alive')),
 ('be held', 'celebrar-se, fer-se', 'Take place (passive): an event is organised in a place.', 'The festival is held in the town square.', 'The concert will ____ in the school hall.', 'Nobody says who organises it: "The fair… in the main square every May."', ('take place', 'organise', 'gather')),
 ('crowded', 'ple de gent', 'Full of people.', 'The streets are crowded during the parade.', 'The square is very ____: there are thousands of people.', None, ('cosy', 'meaningful', 'religious')),
 ('different from', 'diferent de', 'Not the same as.', 'Halloween is different from the Castanyada.', 'Our Christmas is ____ Christmas in Australia: it\'s cold here.', None, ('similar to', 'unlike', 'whereas')),
 ('exchange gifts', 'intercanviar regals', 'Give a present and receive one back.', 'Friends exchange gifts at Christmas.', 'At the end of term, we ____ with our classmates.', None, ('share a meal', 'send invitations', 'pass down')),
 ('frost', 'gebre, glaçada', 'A thin white layer of ice on cold mornings.', "There's frost on the car.", "There's ____ on the grass this morning: it's white.", None, ('cosy', 'crowded', 'religious')),
 ('gather', 'reunir-se', 'Come together in a group.', 'Families gather for a special meal.', 'People ____ in the square to watch the fireworks.', None, ('get together', 'share a meal', 'be held')),
 ('get together', 'reunir-se, trobar-se', 'Meet as a group.', 'We get together with our cousins at New Year.', 'We always ____ with my cousins on 26 December.', None, ('gather', 'share a meal', 'organise')),
 ('share a meal', 'compartir un àpat', 'Eat lunch or dinner together.', 'At Eid, families share a meal.', 'Neighbours ____ in the street on the festival day.', None, ('exchange gifts', 'gather', 'pass down')),
 ('in the same way', 'de la mateixa manera', 'Like something else; similarly.', 'In the same way, people light lamps at Diwali.', 'People light candles at Christmas. ____, people light lamps at Diwali.', None, ('whereas', 'unlike', 'similar to')),
 ('Kind regards', 'Salutacions cordials', 'A friendly but formal way to end an email.', 'Kind regards, Marta', 'Thank you for reading our proposal. ____, Year 10', None, ('Yours sincerely', 'I look forward to hearing from you', 'We would like to')),
 ('look forward to', 'tenir ganes de', 'Feel happy about something that is going to happen.', "I'm looking forward to the parade.", "I'm really looking ____ the holidays." , None, ('pass down', 'take part in', 'gather')),
 ('meaningful', 'significatiu', 'Important for you, with a special meaning.', 'This tradition is very meaningful for my family.', 'The ceremony is very ____ for us: it reminds us of our grandparents.', None, ('religious', 'traditional', 'crowded')),
 ('send invitations', 'enviar invitacions', 'Ask people in writing to come to your event.', 'We send invitations to all the families.', 'Two weeks before the party, we ____ to the parents.', None, ('put up decorations', 'organise', 'exchange gifts')),
 ('organise', 'organitzar', 'Plan and prepare an event.', 'We organise a Celebration Day at school.', 'Our class wants to ____ a festival for the whole school.', None, ('send invitations', 'be held', 'put up decorations'), ('organize',)),
 ('put up decorations', 'penjar decoració', 'Hang decorations on walls, trees or streets.', 'We put up decorations in the hall.', 'Before the party, we ____ on the walls.', None, ('send invitations', 'organise', 'share a meal')),
 ('religious', 'religiós', 'Connected with a religion or with God.', 'Easter is a religious celebration.', 'Ramadan is a ____ month for Muslims.', None, ('meaningful', 'traditional', 'crowded')),
 ('traditional', 'tradicional', 'Done in the same way for a long time.', 'Panellets are a traditional sweet.', 'We wear ____ clothes for the local dance.', None, ('religious', 'meaningful', 'crowded')),
 ('similar to', 'semblant a', 'Almost the same as.', 'Halloween is similar to the Castanyada in some ways.', 'Día de Muertos is ____ All Saints\' Day: both remember the dead.', None, ('different from', 'unlike', 'in the same way')),
 ('the town square', 'la plaça del poble', 'The main open space in the centre of a town.', 'The festival is held in the town square.', 'Everybody dances in ____ on the festival day.', None, ('the community centre', 'crowded', 'parade'), ('town square',)),
 ('unlike', 'a diferència de', 'Different from (used to compare).', 'Unlike Halloween, the Castanyada is about family.', '____ Christmas in Catalonia, Christmas in Australia is hot.', None, ('different from', 'whereas', 'similar to')),
 ('whereas', 'mentre que', 'A word that links two different ideas.', 'Halloween is spooky, whereas the Castanyada is cosy.', 'In Spain we eat grapes, ____ in Denmark people jump off chairs.', None, ('unlike', 'in the same way', 'different from'), ('while',)),
 ('cosy', 'acollidor', 'Warm, comfortable and relaxing.', 'Our living room is cosy in winter.', "It's cold outside, but the kitchen is warm and ____.", None, ('crowded', 'frost', 'meaningful'), ('cozy',)),
 # Plus
 ('adapt', 'adaptar(-se)', 'Change something so that it works in a new situation.', 'Traditions adapt when families move abroad.', 'When families move abroad, they ____ their traditions to the new country.', 'A family moves to Norway and cooks panellets with local ingredients. They… the tradition.', ('evolve', 'die out', 'keep a tradition alive')),
 ('belonging', 'pertinença', 'The feeling that you are part of a group.', 'Festivals give people a sense of belonging.', 'Local festivals give people a sense of ____.', 'You sing the town song with everyone and feel that you are part of the group.', ('community', 'heritage', 'gratitude')),
 ('commemorate', 'commemorar', 'Remember an important event or person in a special way.', 'The monument commemorates the war.', 'Every 11 September, Catalans ____ the events of 1714.', 'A ceremony every year on the date of an important historical event.', ('mark an occasion', 'celebrate', 'honour the dead')),
 ('die out', 'desaparèixer', 'Stop existing slowly, little by little.', 'Some old customs die out.', 'If young people do not take part, the tradition will ____.', 'Nobody does the old dance any more, and soon nobody will remember it. It is going to…', ('evolve', 'adapt', 'keep a tradition alive')),
 ('evolve', 'evolucionar', 'Change slowly over a long time.', 'Halloween has evolved a lot.', 'Celebrations ____ over the centuries.', 'Over two hundred years, a festival slowly gets new music, food and costumes. It…', ('adapt', 'die out', 'date back to')),
 ('take something for granted', 'donar per fet', 'Think that something will always be there, so you do not value it.', 'We often take our traditions for granted.', "Don't ____: not everyone can celebrate with their family.", 'You never think about your family meal because it always happens. You…', ('keep a tradition alive', 'gratitude', 'appreciate'), ('take it for granted', 'take things for granted')),
 ('gratitude', 'gratitud', 'The feeling of being thankful.', 'Thanksgiving is about gratitude.', 'At Thanksgiving, people show ____ for what they have.', 'You say "thank you" and feel thankful for your food and family.', ('belonging', 'heritage', 'appreciate')),
 ('heritage', 'patrimoni, herència cultural', 'The traditions, buildings and culture a country has from the past.', 'The castells are part of Catalan heritage.', 'Human towers are part of our cultural ____.', 'UNESCO protects traditions and old buildings that a community receives from the past.', ('roots', 'belonging', 'community')),
 ('inclusive', 'inclusiu', 'Open to everyone, so nobody feels left out.', 'Our Celebration Day must be inclusive.', 'The school party should be ____: everyone is welcome.', 'A party where everybody is welcome, whatever their religion or culture.', ('secular', 'religious', 'meaningful')),
 ('keep a tradition alive', 'mantenir viva una tradició', 'Make sure a tradition continues.', 'Young people help to keep the tradition alive.', 'Children dance the sardana to ____.', 'Teenagers learn the old dance so that it doesn\'t disappear. They…', ('pass down', 'die out', 'adapt')),
 ('secular', 'laic, no religiós', 'Not connected with religion.', 'New Year is a secular celebration.', 'New Year\'s Eve is a ____ celebration: it isn\'t religious.', 'A celebration that has nothing to do with any religion.', ('religious', 'inclusive', 'sacred')),
 ('mark an occasion', 'commemorar una ocasió', 'Do something special because a day is important.', 'We have a special meal to mark the occasion.', 'We light candles to ____.', 'It\'s your grandparents\' 50th anniversary, so the family has a big lunch. They…', ('commemorate', 'celebrate', 'honour the dead')),
 ('ensure', 'garantir', 'Make certain that something happens.', 'We will ensure that the hall is clean.', 'We will ____ that everybody is safe.', 'In a formal email: "We promise that the hall will be clean." → "We will… the hall is clean."', ('propose', 'request', 'appreciate')),
 ('roots', 'arrels', 'The place and culture your family comes from.', 'Festivals connect us with our roots.', 'My family is from Morocco: Eid connects me with my ____.', 'The country and culture where your family comes from.', ('heritage', 'belonging', 'community')),
 ('propose', 'proposar', 'Suggest an idea or a plan formally.', 'I am writing to propose a Celebration Day.', 'In our email we ____ a Celebration Day in May.', 'In a formal email you suggest a plan to the head teacher. You…', ('request', 'ensure', 'consider')),
 ('request', "sol·licitar, petició", 'Ask for something formally.', 'We request the use of the hall.', 'We would like to ____ the use of the school hall.', 'A formal word for "ask for".', ('propose', 'ensure', 'appreciate')),
 ('ritual', 'ritual', 'A set of actions always done in the same order, often in a ceremony.', 'Lighting the lamps is a Diwali ritual.', 'Lighting a candle for the dead is an old ____.', 'Every year the family does the same steps in the same order during the ceremony.', ('tradition', 'heritage', 'community')),
 ('stereotype', 'estereotip', 'A fixed, simple and often wrong idea about a group of people.', 'Not all Mexicans wear sombreros: that\'s a stereotype.', '"All British people drink tea." That\'s a ____.', 'A simple, unfair idea about all the people from a country.', ('heritage', 'ritual', 'consumerism')),
 ('date back to', 'remuntar-se a', 'Started at a time in the past.', 'This tradition dates back to the Middle Ages.', 'The festival is very old: it ____ the 14th century.', 'This celebration started 600 years ago. It… the 15th century.', ('evolve', 'commemorate', 'die out'), ('dates back to',)),
 ('consumerism', 'consumisme', 'Buying too many things that people do not need.', 'Black Friday is a symbol of consumerism.', 'Some people think Christmas is now about ____, not family.', 'People buy and buy at Christmas, much more than they need.', ('stereotype', 'gratitude', 'heritage')),
 ('the festive season', 'les festes (de Nadal)', 'The Christmas and New Year period.', 'Shops are busy during the festive season.', 'Streets are full of lights during ____.', 'The weeks of Christmas and New Year.', ('mark an occasion', 'secular', 'ritual'), ('festive season',)),
 ('community', 'comunitat', 'A group of people who live in the same place or share something.', 'The festival brings the community together.', 'The whole ____ helps to organise the town festival.', 'All the neighbours of a town who help each other and share things.', ('belonging', 'heritage', 'roots')),
]

ROSCO = {
 'beginners': 'A autumn|B buy tickets|C chestnuts|D dress up|E excited|F fireworks|G gift|H happy|I invite people|L light candles|M meet friends|N in November|P pumpkins|R rainy|S sweet potatoes|T tradition|W winter',
 'insecure': 'A at night|B buy tickets|C celebrate|D decorations|E every year|F festival|G give presents|H holiday|I I am writing to|K book a room|L lights|M custom|N in November|O once a year|P present|R parade|S special meal|T the night before|U dress up|V visit relatives|W We would like to|Y Yours sincerely',
 'safe': 'A pass down|B be held|C crowded|D different from|E exchange gifts|F frost|G gather|H share a meal|I in the same way|K Kind regards|L look forward to|M meaningful|N send invitations|O organise|P put up decorations|R religious|S similar to|T the town square|U unlike|W whereas|Y cosy',
 'daring': 'A adapt|B belonging|C commemorate|D die out|E evolve|F take something for granted|G gratitude|H heritage|I inclusive|K keep a tradition alive|L secular|M mark an occasion|N ensure|O roots|P propose|Q request|R ritual|S stereotype|T date back to|U consumerism|V the festive season|Y community',
}

USE_IT = {
 'beginners': [
  ('Halloween is ____ 31 October.', 'on', ['on', 'in'], 'Dates → on: on 31 October.'),
  ('We roast chestnuts ____ November.', 'in', ['in', 'on'], 'Months → in: in November.'),
  ('People ____ pumpkins at Halloween.', 'carve', ['carve', 'carves'], 'People (they) → carve, without -s.'),
  ("I'm ____ about the party!", 'excited', ['excited', 'exciting'], 'How you feel → excited.'),
  ('End of a formal email: "____ sincerely, Anna"', 'Yours', ['Yours', 'Your'], 'Yours sincerely.'),
 ],
 'insecure': [
  ('Christmas is ____ 25 December.', 'on', ['on', 'in', 'at'], 'Dates → on.'),
  ('We visit relatives ____ Christmas.', 'at', ['at', 'on', 'in'], 'Festivals → at Christmas, at Easter.'),
  ('Diwali ____ celebrated in India.', 'is', ['is', 'are', 'does'], 'Passive: is celebrated.'),
  ('Look! They ____ the streets now.', 'are decorating', ['are decorating', 'decorate', 'decorates'], 'Look! … now → Present Continuous.'),
  ('I am writing ____ ask for the school hall.', 'to', ['to', 'for', 'of'], 'I am writing to + verb.'),
 ],
 'safe': [
  ('Passive: The festival ____ (hold) in the town square every year.', 'is held', [], 'Present passive: is + past participle.'),
  ("Complete: I'm looking forward ____ the parade.", 'to', [], 'look forward to.'),
  ('Complete: Halloween is similar ____ the Castanyada in some ways.', 'to', [], 'similar to.'),
  ('Complete: The Castanyada is different ____ Halloween.', 'from', [], 'different from.'),
  ('Formal email: I look forward to ____ (hear) from you.', 'hearing', [], 'look forward to + -ing.'),
 ],
 'daring': [
  ('Correct the mistake: "This tradition dates back from the 19th century."', 'This tradition dates back to the 19th century.', [], 'date back to.'),
  ('Correct the mistake: "Many people take for granted their traditions."', 'Many people take their traditions for granted.', [], 'take something for granted: the object goes in the middle.'),
  ('Correct the mistake: "I would be grateful if you can help us."', 'I would be grateful if you could help us.', [], 'I would be grateful if you could…'),
  ('Correct the mistake: "The festival is associated to the harvest."', 'The festival is associated with the harvest.', [], 'be associated with.'),
  ('Correct the mistake: "Some traditions are dying off."', 'Some traditions are dying out.', [], 'die out.'),
 ],
}

SCRAMBLE = {
 'beginners': [
  ('We|roast chestnuts|in November.', 'Torrem castanyes al novembre.'),
  ('Halloween|is|on 31 October.', "Halloween és el 31 d'octubre."),
  ("I'm|excited|about the party.", 'Tinc moltes ganes de la festa.'),
  ('People|carve pumpkins|at Halloween.', 'La gent buida carbasses per Halloween.'),
  ("It's|cold and rainy|in winter.", "A l'hivern fa fred i plou."),
  ('We|meet friends|and|buy tickets.', 'Quedem amb amics i comprem entrades.'),
  ('Children|dress up|in costumes.', 'Els nens es disfressen.'),
  ('We|would like to|invite people.', "Ens agradaria convidar gent."),
 ],
 'insecure': [
  ('We visit relatives at Christmas.', ('At Christmas we visit relatives.',)),
  ('Diwali is celebrated with lights and candles.', ()),
  ('People give presents on special days.', ('On special days people give presents.',)),
  ('The parade takes place once a year.', ()),
  ('Look! They are decorating the town.', ()),
  ('We have a special meal the night before.', ('The night before we have a special meal.',)),
  ('I am writing to invite you to the festival.', ()),
  ('Children dress up and go to parties.', ()),
 ],
 'safe': [
  ('The festival is held in the town square.', ()),
  ('Families gather to share a meal.', ()),
  ("I'm looking forward to the parade.", ()),
  ('Halloween is different from the Castanyada.', ()),
  ('Traditions are passed down from parents to children.', ()),
  ('Could we use the school hall on Friday?', ()),
  ('We will put up decorations and send invitations.', ('We will send invitations and put up decorations.',)),
  ('I look forward to hearing from you.', ()),
 ],
 'daring': [
  ('This tradition dates back to the Middle Ages.', ('from', 'dated')),
  ('Young people help to keep the tradition alive.', ('living', 'keeps')),
  ('We often take our traditions for granted.', ('granting', 'by')),
  ('The festival is associated with the harvest.', ('to', 'associates')),
  ('Some customs die out when cities grow.', ('dying', 'off')),
  ('I would be grateful if you could help us.', ('can', 'gratitude')),
  ('Festivals give people a sense of belonging.', ('belong', 'sensing')),
  ('Many festivals have become commercialised.', ('commerce', 'became')),
 ],
}

SYNONYMS = [['gift', 'present', 'give presents', 'exchange gifts'], ['gather', 'get together'], ['commemorate', 'mark an occasion', 'celebrate'], ['tradition', 'custom', 'traditional'], ['every year', 'once a year'], ['different from', 'unlike', 'whereas'], ['heritage', 'roots'], ['excited', 'happy'], ['Yours sincerely', 'Kind regards'], ['propose', 'request'], ['candles', 'light candles', 'lights']]

TRANSFER = {
 'beginners': 'Say how you celebrate the Castanyada: "On 31 October we…"',
 'insecure': 'Tell a partner about a celebration in your family: when it is and what you do.',
 'safe': 'Compare two celebrations with similar to, different from or whereas.',
 'daring': 'Explain why a tradition matters to your community and how it is changing.',
}

PICTURES = [
 {'id': 'pumpkin', 'answer': 'carving a pumpkin', 'aliases': ['carve a pumpkin', 'carving pumpkins', 'carve pumpkins', 'making a jack-o-lantern', 'jack-o-lantern', 'halloween', 'decorating a pumpkin'], 'hint': 'An orange vegetable with a face.', 'clues': ['It is dark outside the window.', 'Someone is at a table with a big orange vegetable.', 'The vegetable has eyes and a smile cut into it.'], 'transfer': 'Describe Halloween in your town: what people wear and what they do.'},
 {'id': 'chestnuts', 'answer': 'roasting chestnuts', 'aliases': ['roast chestnuts', 'chestnuts', 'castanyada', 'the castanyada', 'eating chestnuts', 'cooking chestnuts'], 'hint': 'Hot brown nuts in a paper cone.', 'clues': ['It is an autumn evening.', 'There is smoke over a hot pan.', 'Someone is holding a paper cone of brown nuts.'], 'transfer': 'Explain the Castanyada to a visitor: the date, the food and who you celebrate it with.'},
 {'id': 'fireworks', 'answer': 'watching fireworks', 'aliases': ['watch fireworks', 'fireworks', 'watching the fireworks', "new year's eve", 'new year'], 'hint': 'Colours explode in the night sky.', 'clues': ['It is midnight.', 'A crowd is looking up at the sky.', 'There are bright explosions of colour.'], 'transfer': 'Tell a partner how your family celebrates New Year\'s Eve.'},
 {'id': 'candles', 'answer': 'lighting candles', 'aliases': ['light candles', 'candles', 'lighting a candle', 'light a candle', 'diwali', 'lighting lamps'], 'hint': 'Small flames for a festival of lights.', 'clues': ['There is a row of small lamps on a table.', 'Someone is holding a match.', 'Some of the flames are already burning.'], 'transfer': 'Compare a festival of lights (Diwali, Hanukkah or Christmas) with a celebration you know.'},
]

ROUTE_DETAIL = {
 'beginners': "Les paraules bàsiques de la LS (estacions, menjar de tardor, festes i dates), amb una pista en català i sempre amb opcions per triar. Frases en blocs.",
 'insecure': "Totes les paraules bàsiques de les celebracions, dates i correus. Al Rosco escrius la resposta (pots demanar pista de lletres); a la resta tries entre 3 o 4 opcions i ordenes paraules soltes.",
 'safe': 'English definitions and context gaps: traditions, comparing cultures, planning an event, the passive and formal emails.',
 'daring': 'Infer meaning from situations, fix collocation mistakes and use the language of heritage, identity and change.',
}
