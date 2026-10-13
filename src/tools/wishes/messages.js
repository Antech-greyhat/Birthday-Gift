// Who the wish is for, with the word used when no name is given
export const RECIPIENTS = [
  { id: 'anyone', label: 'Anyone', emoji: '🎈', fallback: '' },
  { id: 'mom', label: 'Mom', emoji: '👩', fallback: 'Mom' },
  { id: 'dad', label: 'Dad', emoji: '👨', fallback: 'Dad' },
  { id: 'wife', label: 'Wife', emoji: '💍', fallback: 'my love' },
  { id: 'husband', label: 'Husband', emoji: '💑', fallback: 'my love' },
  { id: 'partner', label: 'Partner', emoji: '💖', fallback: 'babe' },
  { id: 'bestie', label: 'Best friend', emoji: '👯', fallback: 'bestie' },
  { id: 'friend', label: 'Friend', emoji: '🤝', fallback: 'my friend' },
  { id: 'sister', label: 'Sister', emoji: '👧', fallback: 'Sis' },
  { id: 'brother', label: 'Brother', emoji: '👦', fallback: 'Bro' },
  { id: 'daughter', label: 'Daughter', emoji: '🌸', fallback: 'sweetheart' },
  { id: 'son', label: 'Son', emoji: '⚽', fallback: 'son' },
  { id: 'grandparent', label: 'Grandparent', emoji: '👵', fallback: '' },
  { id: 'coworker', label: 'Coworker', emoji: '💼', fallback: '' },
  { id: 'boss', label: 'Boss', emoji: '📈', fallback: '' },
]

export const TONES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'heartfelt', label: 'Heartfelt', emoji: '❤️' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'short', label: 'Short', emoji: '⚡' },
  { id: 'inspirational', label: 'Inspiring', emoji: '🌟' },
]

const DATA = {
  anyone: {
    heartfelt: [
      'Happy birthday, {name}! May this year wrap you in the same kindness you give everyone else. You deserve every bit of joy coming your way.',
      "Wishing you a birthday as warm and wonderful as you are, {name}. Here's to laughter, love and all the little moments that make life sweet.",
      'Happy birthday, {name}! The world is brighter with you in it, and today is the perfect day to celebrate that.',
      "On your special day, {name}, I hope you feel how deeply you're appreciated. Thank you for being exactly who you are.",
      'Happy birthday, {name}! May your heart be full, your days be gentle and your year be packed with reasons to smile.',
      'Another year of you is a gift to everyone who knows you. Happy birthday, {name}, and enjoy every moment.',
      'Sending you a birthday hug wrapped in gratitude, {name}. May this new chapter be your most beautiful yet.',
      'Happy birthday, {name}! I hope today reminds you how loved you are, today and every day.',
      'May your birthday be filled with people who make you laugh, food that makes you happy and wishes that come true. Happy birthday, {name}!',
      "Here's to you, {name}, and to a year of dreams fulfilled, friendships deepened and joy that lingers. Happy birthday!",
      "Some people make the world softer just by being in it. You're one of them, {name}. Happy birthday!",
      'Happy birthday, {name}! Wishing you peace in your heart, light on your path and love all around you.',
    ],
    funny: [
      "Happy birthday, {name}! Don't worry about getting older. You're still way younger than you'll be next year.",
      'Age is just a number. In your case, a pretty big one. Happy birthday, {name}! 🎂',
      "Happy birthday, {name}! Remember, you're not old, you're vintage. And vintage is very expensive.",
      'They say with age comes wisdom. You must be a genius by now, {name}. Happy birthday!',
      "Happy birthday, {name}! Today you're allowed to eat cake for breakfast. Honestly, you'd do it anyway.",
      'Cheers to another trip around the sun, {name}! No wonder you look a little dizzy. Happy birthday!',
      'Happy birthday, {name}! I was going to get you something amazing, then I remembered you already have me.',
      "Don't count the candles, {name}. The fire department says it's a safety issue. Happy birthday!",
      "Happy birthday, {name}! You're officially one year closer to telling kids 'back in my day…'",
      'Studies show that people who have more birthdays live longer. Keep it up, {name}! Happy birthday!',
      'Happy birthday, {name}! May your cake be big, your calories be invisible and your phone stay on silent.',
      "At your age, {name}, you've earned the right to nap anytime, anywhere. Happy birthday!",
    ],
    short: [
      'Happy birthday, {name}! Shine bright today. ✨',
      'Cheers to you, {name}! Have the best day ever.',
      'Happy birthday, {name}! Eat cake, make wishes, repeat.',
      'Wishing you a day as awesome as you, {name}!',
      "Happy birthday, {name}! Here's to a fabulous year.",
      'Another year older, another year wiser. Happy birthday, {name}!',
      "Hip hip hooray, it's your day, {name}! 🎉",
      'Big hugs and happy birthday, {name}!',
      'Happy birthday, {name}! Make it sparkle.',
      'May all your wishes come true, {name}. Happy birthday!',
      'Happy birthday, {name}! You deserve all the cake.',
      "Celebrate big, {name}. It's your day!",
    ],
    inspirational: [
      'Happy birthday, {name}! May this be the year you chase every dream that makes your heart race.',
      "A new year of life is a blank page, {name}. Write a story you'll love to read. Happy birthday!",
      "Happy birthday, {name}! Never forget how far you've come, and get excited for how far you'll go.",
      "Here's to growing bolder, braver and brighter with every year, {name}. Happy birthday!",
      'Happy birthday, {name}! May you find courage in your challenges and joy in your journey.',
      "Every birthday is a reminder that it's never too late to begin again. Make this year count, {name}!",
      'Happy birthday, {name}! Keep believing in yourself. The best is still ahead.',
      'Life is measured in moments, not years. Wishing you a year full of unforgettable ones, {name}.',
      'Happy birthday, {name}! May you bloom where you are planted and keep growing toward the light.',
      "Your potential has no expiry date, {name}. Happy birthday, and here's to your next big leap!",
      'Happy birthday, {name}! Dream big, start small and begin today.',
      'Another year, another chance to become who you want to be. Go get it, {name}! Happy birthday!',
    ],
  },
  mom: {
    heartfelt: [
      'Happy birthday, {name}! You gave me roots to grow and wings to fly. Everything good in me started with you.',
      "{name}, your love is the home I always come back to. Thank you for every hug, every sacrifice and every 'I'm proud of you.' Happy birthday!",
      'To the woman who taught me kindness by example, happy birthday, {name}. I love you more than words can hold.',
    ],
    funny: [
      'Happy birthday, {name}! Thanks for not selling me during my teenage years.',
      "{name}, you're the reason I'm so fabulous. It's genetic, I checked. Happy birthday!",
      'Happy birthday to the only person who knows what I think before I do. A little scary, {name}, but I love you!',
    ],
    short: [
      "Happy birthday, {name}! You're my forever hero. ❤️",
      'Best mom ever? Obviously. Happy birthday, {name}!',
      'Happy birthday, {name}! Love you to the moon and back.',
    ],
    inspirational: [
      "Happy birthday, {name}! Your strength showed me that anything is possible. May this year give back everything you've given us.",
      "{name}, you've spent years making our dreams come true. This year, I hope you chase your own. Happy birthday!",
      'Happy birthday, {name}! Your grace and courage light the way for all of us.',
    ],
  },
  dad: {
    heartfelt: [
      'Happy birthday, {name}! Thank you for being my first hero, my steady rock and my biggest fan.',
      '{name}, every lesson you taught me, patience, hard work and kindness, I carry with me every day. Happy birthday, with all my love.',
      'Happy birthday, {name}! I hope you know how much your quiet strength means to all of us.',
    ],
    funny: [
      "Happy birthday, {name}! I got you this card instead of another tie. You're welcome.",
      "{name}, I'd tell you a dad joke for your birthday, but you already know them all. Happy birthday!",
      "Happy birthday, {name}! Don't worry, nobody touched the thermostat today.",
    ],
    short: [
      'Happy birthday to the best dad ever, {name}!',
      'Cheers to you, {name}! Love you always.',
      'Happy birthday, {name}! Still my superhero.',
    ],
    inspirational: [
      'Happy birthday, {name}! You showed me that real strength is gentle. May your year be as great as your heart.',
      "{name}, you taught me to never give up. Here's to a year where your dreams get the spotlight. Happy birthday!",
      'Happy birthday, {name}! The best is yet to come, and you deserve every bit of it.',
    ],
  },
  wife: {
    heartfelt: [
      'Happy birthday, {name}! Every day with you feels like a gift, and today I get to celebrate the greatest one.',
      '{name}, you are my home, my heart and my favorite hello. Happy birthday to the love of my life.',
      'Happy birthday, {name}! I fall for you a little more every year, and this year is no different.',
    ],
    funny: [
      "Happy birthday, {name}! I still can't believe you said yes. Please don't reconsider.",
      '{name}, you get to choose the movie tonight. Happy birthday, and enjoy that power while it lasts!',
      'Happy birthday, {name}! Thanks for putting up with me for another year. You deserve a medal, and cake.',
    ],
    short: [
      "Happy birthday, {name}! You're my everything. ❤️",
      'To my favorite person, happy birthday, {name}!',
      'Happy birthday, {name}! Forever yours.',
    ],
    inspirational: [
      'Happy birthday, {name}! Your strength and grace inspire me every single day.',
      "{name}, may this year bring every dream you've been holding close. I'll be right beside you. Happy birthday!",
      "Happy birthday, {name}! Here's to growing, laughing and building our dreams together.",
    ],
  },
  husband: {
    heartfelt: [
      "Happy birthday, {name}! You're my best friend, my partner and my favorite place to land.",
      '{name}, life with you is my favorite story. Happy birthday to the one who makes every day better.',
      "Happy birthday, {name}! I'm so grateful the universe led me to you.",
    ],
    funny: [
      "Happy birthday, {name}! You're aging like fine wine, especially in the snoring department.",
      "{name}, today you get the remote all day. Happy birthday, and don't get used to it!",
      'Happy birthday, {name}! I love you even more than you love the last slice of pizza.',
    ],
    short: [
      'Happy birthday, {name}! My one and only. ❤️',
      'Cheers to you, {name}! Love you endlessly.',
      'Happy birthday, {name}! Lucky me.',
    ],
    inspirational: [
      'Happy birthday, {name}! Your kindness and determination inspire me every day.',
      '{name}, may this year bring new adventures and dreams worth chasing, together. Happy birthday!',
      "Happy birthday, {name}! I can't wait to see everything you'll achieve this year.",
    ],
  },
  partner: {
    heartfelt: [
      "Happy birthday, {name}! You make ordinary days feel magical, and I'm so lucky to be yours.",
      '{name}, my favorite moments all have you in them. Happy birthday, my love.',
      'Happy birthday, {name}! Thank you for the laughter, the late night talks and the way you look at me.',
    ],
    funny: [
      'Happy birthday, {name}! I promise to like all your birthday photos, even the blurry ones.',
      "{name}, you're my favorite notification. Happy birthday!",
      "Happy birthday, {name}! I was going to wrap myself up as your gift, but I couldn't find a big enough bow.",
    ],
    short: [
      "Happy birthday, {name}! You're my favorite. 💖",
      'Happy birthday to my person, {name}!',
      'Happy birthday, {name}! Kisses and cake.',
    ],
    inspirational: [
      "Happy birthday, {name}! I can't wait to watch you chase your dreams this year, and I'll be cheering the loudest.",
      "{name}, here's to new memories, bold adventures and growing together. Happy birthday!",
      'Happy birthday, {name}! You make me want to be better every day.',
    ],
  },
  bestie: {
    heartfelt: [
      "Happy birthday, {name}! Friends like you are rare treasures, and I'm keeping you forever.",
      "{name}, you've seen me at my best and my worst and stayed anyway. That's love. Happy birthday!",
      'Happy birthday, {name}! Life is so much better with you as my sidekick.',
    ],
    funny: [
      'Happy birthday, {name}! You know too much, so we have to stay friends forever.',
      "{name}, we'll be friends until we're old and forgetful. Then we'll be new friends. Happy birthday!",
      'Happy birthday, {name}! Thanks for being the reason I laugh at the worst possible moments.',
    ],
    short: [
      'Happy birthday, {name}! Besties forever. 👯',
      'Happy birthday to my favorite human, {name}!',
      "Happy birthday, {name}! Let's celebrate like legends.",
    ],
    inspirational: [
      "Happy birthday, {name}! I'm so proud of you. This is your year to shine.",
      '{name}, you make me braver. May this year make your wildest dreams come true. Happy birthday!',
      'Happy birthday, {name}! Keep being fearless, funny and fabulous.',
    ],
  },
  friend: {
    heartfelt: [
      "Happy birthday, {name}! I'm so thankful our paths crossed. Here's to many more memories together.",
      "{name}, your friendship is one of life's sweetest gifts. Happy birthday!",
      'Happy birthday, {name}! Wishing you a day as kind and genuine as you are.',
    ],
    funny: [
      "Happy birthday, {name}! I'd share my wisdom with you, but you'd ignore it like always.",
      "{name}, it's your birthday, so you can blame everything on your age today. Enjoy it!",
      "Happy birthday, {name}! Calories don't count today. I checked.",
    ],
    short: [
      'Happy birthday, {name}! Have a blast. 🎈',
      'Cheers to you, {name}! Enjoy your day.',
      "Happy birthday, {name}! Hope it's a great one.",
    ],
    inspirational: [
      'Happy birthday, {name}! May this year bring new opportunities and big wins.',
      '{name}, keep going after whatever lights you up. Happy birthday!',
      "Happy birthday, {name}! Here's to a year of growth and good vibes.",
    ],
  },
  sister: {
    heartfelt: [
      "Happy birthday, {name}! You're my built in best friend, my secret keeper and my favorite person to laugh with.",
      "{name}, life gave me a sister, and luckily it was you. Happy birthday, I'm so grateful for us.",
      "Happy birthday, {name}! No matter how far apart we are, you're always close to my heart.",
    ],
    funny: [
      "Happy birthday, {name}! I'm still the favorite, but you're a close second.",
      '{name}, thanks for all the clothes I borrowed and never returned. Happy birthday!',
      "Happy birthday, {name}! You're getting older, but I'll always be the cooler one.",
    ],
    short: [
      'Happy birthday, {name}! Sisters forever. 💕',
      'To my partner in crime, happy birthday, {name}!',
      'Happy birthday, {name}! Love you lots.',
    ],
    inspirational: [
      'Happy birthday, {name}! Watching you become who you are has been my greatest inspiration.',
      "{name}, may this year bring you the courage to chase every dream. I'm cheering for you always. Happy birthday!",
      'Happy birthday, {name}! Keep shining your light. The world needs it.',
    ],
  },
  brother: {
    heartfelt: [
      "Happy birthday, {name}! Growing up with you was the best adventure, and I'm proud to call you my brother.",
      "{name}, you've always had my back. Today I've got yours. Happy birthday!",
      'Happy birthday, {name}! Thank you for the laughs, the fights and the forever friendship.',
    ],
    funny: [
      "Happy birthday, {name}! I'd say you're my favorite brother, but let's not get carried away.",
      "{name}, you're lucky to have a sibling as awesome as me. Happy birthday!",
      "Happy birthday, {name}! Don't worry about getting older. You never really grew up anyway.",
    ],
    short: [
      'Happy birthday, {name}! Have an epic one. 🎉',
      'Cheers, {name}! Brothers for life.',
      'Happy birthday, {name}! Party hard.',
    ],
    inspirational: [
      'Happy birthday, {name}! Go after this year like you used to go after the last slice of pizza.',
      "{name}, I believe in you more than you know. Here's to your best year yet. Happy birthday!",
      'Happy birthday, {name}! Keep building, keep dreaming, keep being you.',
    ],
  },
  daughter: {
    heartfelt: [
      'Happy birthday, {name}! You fill our home with light and our hearts with love.',
      "{name}, you are my greatest blessing. Watching you grow is the best gift I've ever received. Happy birthday!",
      "Happy birthday, {name}! I'll always be your biggest fan, your safe place and your forever cheerleader.",
    ],
    funny: [
      "Happy birthday, {name}! I'll stop calling you my baby when you stop being adorable. So, never.",
      '{name}, you get your sense of humor from me. And your style. Mostly from me. Happy birthday!',
      'Happy birthday, {name}! You can borrow my things today. Today only.',
    ],
    short: [
      "Happy birthday, {name}! You're my sunshine. 🌸",
      'Happy birthday, {name}! Love you endlessly.',
      'Happy birthday, {name}! Shine bright, little star.',
    ],
    inspirational: [
      'Happy birthday, {name}! Be brave, be kind and never let anyone dim your sparkle.',
      "{name}, there's nothing you can't do. Here's to your brightest year yet. Happy birthday!",
      "Happy birthday, {name}! Chase your dreams, I'll be cheering every step of the way.",
    ],
  },
  son: {
    heartfelt: [
      'Happy birthday, {name}! From the moment you arrived, you made our world complete.',
      '{name}, watching you grow has been the greatest joy of my life. Happy birthday, I love you always.',
      "Happy birthday, {name}! I'm proud of the person you are and the person you're becoming.",
    ],
    funny: [
      "Happy birthday, {name}! You get your good looks from me. You're welcome.",
      "{name}, you're one year older, which means one more year of me embarrassing you. Happy birthday!",
      'Happy birthday, {name}! Yes, you can have cake for dinner. Just this once.',
    ],
    short: [
      'Happy birthday, {name}! So proud of you. 💙',
      'Happy birthday, {name}! Love you to bits.',
      'Happy birthday, {name}! Have the best day.',
    ],
    inspirational: [
      'Happy birthday, {name}! Dream big, work hard and never stop being kind.',
      '{name}, the world is yours. Go make it amazing. Happy birthday!',
      'Happy birthday, {name}! Believe in yourself the way I believe in you.',
    ],
  },
  grandparent: {
    heartfelt: [
      'Happy birthday, {name}! Your love is the foundation our whole family is built on.',
      '{name}, thank you for the stories, the wisdom and the warmest hugs in the world. Happy birthday!',
      'Happy birthday, {name}! Every memory with you is one I treasure.',
    ],
    funny: [
      "Happy birthday, {name}! You're not old, you're a classic.",
      "{name}, you've got more wisdom than the internet and better cookies too. Happy birthday!",
      "Happy birthday, {name}! Let's celebrate your way, with an early dinner and a long nap.",
    ],
    short: [
      'Happy birthday, {name}! Love you so much. 💐',
      "Happy birthday, {name}! You're the best.",
      'Happy birthday, {name}! Hugs from all of us.',
    ],
    inspirational: [
      'Happy birthday, {name}! Your life is a beautiful example of love, grace and resilience.',
      "{name}, you've taught us that age is just a number and joy is a choice. Happy birthday!",
      "Happy birthday, {name}! Here's to more years of laughter, stories and love.",
    ],
  },
  coworker: {
    heartfelt: [
      'Happy birthday, {name}! Working with you makes even Mondays better. Hope your day is fantastic.',
      '{name}, thanks for being such a great teammate and an even better person. Happy birthday!',
      'Happy birthday, {name}! Wishing you a year of success, balance and plenty of celebrations.',
    ],
    funny: [
      'Happy birthday, {name}! Your gift is me not scheduling a meeting today.',
      '{name}, may your inbox be empty and your cake be plentiful. Happy birthday!',
      "Happy birthday, {name}! Let's pretend we're working while we eat cake.",
    ],
    short: [
      'Happy birthday, {name}! Enjoy your day. 🎂',
      'Happy birthday, {name}! Cheers from the team.',
      'Happy birthday, {name}! Have a great one.',
    ],
    inspirational: [
      'Happy birthday, {name}! May this year bring big wins and bold ideas.',
      "{name}, here's to new goals and great achievements. Happy birthday!",
      'Happy birthday, {name}! Keep inspiring us all.',
    ],
  },
  boss: {
    heartfelt: [
      'Happy birthday, {name}! Thank you for leading with kindness and believing in our team.',
      '{name}, your guidance makes a real difference every day. Wishing you a wonderful birthday!',
      "Happy birthday, {name}! We're grateful for your support and leadership.",
    ],
    funny: [
      'Happy birthday, {name}! Feel free to celebrate by giving us all the afternoon off.',
      "{name}, you're the best boss, and no, I'm not just saying that because it's your birthday. Mostly. Happy birthday!",
      'Happy birthday, {name}! We got you a cake. It was approved in the budget.',
    ],
    short: [
      'Happy birthday, {name}! Best wishes from all of us.',
      'Happy birthday, {name}! Enjoy your special day.',
      'Happy birthday, {name}! Cheers to you.',
    ],
    inspirational: [
      'Happy birthday, {name}! Your vision inspires us to aim higher every day.',
      '{name}, may this year bring new heights and great success. Happy birthday!',
      'Happy birthday, {name}! Thank you for showing us what great leadership looks like.',
    ],
  },
}

// Flattened list with stable ids
export const MESSAGES = Object.entries(DATA).flatMap(([to, tones]) =>
  Object.entries(tones).flatMap(([tone, list]) => list.map((text, i) => ({ id: `${to}-${tone}-${i}`, to, tone, text }))),
)

export const getRecipient = (id) => RECIPIENTS.find((r) => r.id === id) || RECIPIENTS[0]

// Messages for a recipient plus the universal ones
export function filterMessages(to, tone, query = '') {
  const q = query.trim().toLowerCase()
  return MESSAGES.filter((m) => (m.to === to || m.to === 'anyone') && (tone === 'all' || m.tone === tone) && (!q || m.text.toLowerCase().includes(q))).sort(
    (a, b) => (a.to === to ? 0 : 1) - (b.to === to ? 0 : 1),
  )
}

// Fills in the name, or removes the placeholder gracefully when there is none
export function personalize(text, name, recipientId) {
  const who = name.trim() || getRecipient(recipientId).fallback
  const out = who
    ? text.replaceAll('{name}', who)
    : text
        .replace(/,\s*\{name\}/g, '')
        .replace(/\{name\},\s*/g, '')
        .replace(/\{name\}/g, 'you')
  return out.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
}
