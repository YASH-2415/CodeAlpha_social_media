require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Follow = require('./models/Follow');
const Notification = require('./models/Notification');
const Story = require('./models/Story');

// Data arrays for realistic content generation
const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson', 'Ella', 'Levi', 'Scarlett', 'Sebastian', 'Grace', 'Mateo', 'Chloe', 'Jack', 'Victoria', 'Owen', 'Riley', 'Theodore', 'Aria', 'Aiden', 'Lily', 'Samuel', 'Aubrey', 'Ryan', 'Zoey', 'Nathan'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const locations = ['New York, USA', 'Los Angeles, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 'Sydney, Australia', 'Toronto, Canada', 'Berlin, Germany', 'Barcelona, Spain', 'Mumbai, India', 'Dubai, UAE', 'Singapore', 'Amsterdam, Netherlands', 'Rome, Italy', 'Bangkok, Thailand', 'Istanbul, Turkey', 'Mexico City, Mexico', 'Rio de Janeiro, Brazil', 'Seoul, South Korea', 'Cape Town, South Africa', 'Stockholm, Sweden', 'Vienna, Austria', 'Prague, Czech Republic', 'Dublin, Ireland', 'Edinburgh, Scotland', 'Zurich, Switzerland', 'Lisbon, Portugal', 'Athens, Greece', 'Oslo, Norway', 'Helsinki, Finland', 'Copenhagen, Denmark', 'Warsaw, Poland', 'Budapest, Hungary', 'Krakow, Poland', 'Kyoto, Japan'];
const professions = ['Software Engineer', 'Photographer', 'Travel Blogger', 'Fitness Coach', 'Graphic Designer', 'Writer', 'Musician', 'Chef', 'Entrepreneur', 'Data Scientist', 'Marketing Manager', 'Architect', 'Doctor', 'Teacher', 'Journalist', 'Artist', 'YouTuber', 'Podcast Host', 'Fashion Designer', 'Web Developer', 'Product Manager', 'UX Designer', 'Real Estate Agent', 'Personal Trainer', 'Nutritionist', 'Financial Advisor', 'Lawyer', 'Filmmaker', 'Game Developer', 'Social Media Manager'];

const bios = [
  "Living life one adventure at a time",
  "Coffee enthusiast & code wizard",
  "Capturing moments, creating memories",
  "Fitness is not a destination, it's a way of life",
  "Exploring the world through my lens",
  "Dream big, work hard, stay focused",
  "Tech lover | Bookworm | Foodie",
  "Making the world a better place, one line of code at a time",
  "Adventure awaits around every corner",
  "Creating beautiful things every day",
  "Music is the universal language",
  "Building the future with technology",
  "Life is too short to be boring",
  "Passionate about health and wellness",
  "Storyteller at heart",
  "Learning something new every day",
  "Chasing sunsets and dreams",
  "Design is not just what it looks like, it's how it works",
  "Food is love made visible",
  "Turning ideas into reality",
  "Travel is the only thing you buy that makes you richer",
  "Code. Create. Repeat.",
  "Living proof that miracles happen",
  "Simplicity is the ultimate sophistication",
  "Making memories around the world",
  "Believer, dreamer, achiever",
  "Good vibes only",
  "Less perfection, more authenticity",
  "Creativity takes courage",
  "In love with the journey",
  "Spreading positivity one post at a time",
  "Curating life's beautiful moments",
  "Coffee first, worries later",
  "Be the change you wish to see",
  "Always exploring, always learning",
  "Passionate about what I do",
  "Finding beauty in the ordinary",
  "Adventure is worthwhile in itself",
  "Creating my own sunshine",
  "Life is what you make it",
  "Embracing the chaos",
  "Stay hungry, stay foolish",
  "Living my best life",
  "Making every moment count",
  "The best is yet to come",
  "Creating magic with pixels and code",
  "Just a human being having fun",
  "Grateful for every breath",
  "Turning dreams into plans",
  "Collecting experiences, not things",
];

const topics = ['travel', 'food', 'technology', 'fitness', 'photography', 'gaming', 'music', 'movies', 'education', 'coding', 'business', 'fashion', 'sports', 'pets', 'nature', 'motivation', 'daily life'];

const captionsByTopic = {
  travel: [
    "Just touched down in paradise! The views here are absolutely breathtaking. Can't wait to explore every corner of this beautiful place.",
    "Wanderlust mode: ON. There's something magical about discovering new places and cultures.",
    "Adventure is calling and I must go. This trip has been on my bucket list for years!",
    "Lost in the beauty of this place. Sometimes you just need to disconnect and enjoy the moment.",
    "Travel isn't always pretty or comfortable, but it's those unexpected moments that make the journey worthwhile.",
    "Chasing sunsets around the world. Each one is unique, just like the places I visit.",
    "This hidden gem exceeded all my expectations. The locals are incredibly welcoming!",
    "Early morning explorations hit different. The world feels so peaceful before everyone wakes up.",
    "Adding another stamp to my passport! Every destination teaches me something new.",
    "The architecture here tells stories from centuries ago. Walking through history!",
  ],
  food: [
    "Homemade dinner tonight! Sometimes the simplest meals bring the most joy.",
    "Foodie alert! Just discovered the most amazing restaurant. The flavors are incredible.",
    "Cooking is love made visible. Made this from scratch with fresh ingredients.",
    "Brunch goals! Weekend mornings are made for this.",
    "Trying a new recipe today. Fingers crossed it turns out as good as it looks!",
    "Street food adventures! The best meals often come from the smallest places.",
    "Sweet tooth satisfied! This dessert is absolutely divine.",
    "Farm to table at its finest. Fresh, local, and absolutely delicious.",
    "Coffee and a good book - my perfect afternoon.",
    "This recipe has been in my family for generations. Sharing it with you all!",
  ],
  technology: [
    "Just got my hands on the latest tech! The innovation in this field never stops amazing me.",
    "AI is changing everything. Excited to see where this technology takes us.",
    "New setup, who dis? Finally upgraded my workspace and I'm loving it!",
    "The future is here. Testing out some cutting-edge technology today.",
    "Tech review time! Been using this for a month and here are my thoughts.",
    "Automation is the key to productivity. Built this script to save hours of work.",
    "The evolution of smartphones is incredible. Can't wait to see what's next.",
    "Virtual reality is blowing my mind. The immersion is on another level!",
    "Smart home upgrade complete! Everything is connected and controlled by voice.",
    "Debugging at 3 AM - the programmer's life. But the satisfaction when it works is unmatched!",
  ],
  fitness: [
    "Rise and grind! Early morning workout completed. No excuses!",
    "Progress, not perfection. Been consistent for 6 months and feeling amazing.",
    "Leg day is the best day. Embrace the burn!",
    "New personal record today! Hard work really does pay off.",
    "Fitness isn't about being better than someone else. It's about being better than you used to be.",
    "Rest day but still staying active. Recovery is just as important as training.",
    "Meal prep Sunday! Nutrition is 80% of the battle.",
    "The body achieves what the mind believes. Pushed through a tough workout today.",
    "Started my fitness journey 1 year ago today. The transformation is real!",
    "Trying a new workout routine. Variety keeps things interesting!",
  ],
  photography: [
    "Captured the perfect golden hour shot. The lighting was absolutely magical.",
    "Photography is the story I fail to express in words.",
    "New lens, new perspectives! Can't stop shooting with this beauty.",
    "The best camera is the one you have with you. Phone photography has come so far!",
    "Long exposure magic. Sometimes you need to slow down to see the beauty.",
    "Street photography is all about capturing authentic moments.",
    "Portrait session today! There's nothing like capturing someone's true essence.",
    "The rule of thirds is just the beginning. Learning to break the rules creatively.",
    "Nature's canvas is endless. Every season brings new photo opportunities.",
    "Behind every great photo is a photographer who cared enough to press the shutter.",
  ],
  gaming: [
    "New game release day! Clearing my schedule for the next week.",
    "Finally hit max rank! The grind was real but totally worth it.",
    "Game night with friends. Nothing beats some good multiplayer action.",
    "The graphics in this game are absolutely stunning. Technology has come so far!",
    "Speedrun attempt! Trying to beat my personal best.",
    "Indie games deserve more love. This hidden gem blew me away!",
    "Streaming live tonight! Come hang out and chat.",
    "Retro gaming session. Sometimes the classics hit different.",
    "New gaming setup complete! Ready for some serious sessions.",
    "The storytelling in modern games rivals any movie or book.",
  ],
  music: [
    "New playlist just dropped! Perfect vibes for any occasion.",
    "Concert last night was absolutely incredible. Live music hits different!",
    "Learning a new song on guitar. Practice makes progress!",
    "Music production session today. Creating something from nothing is magical.",
    "This album is a masterpiece from start to finish.",
    "Found my new favorite artist. Their sound is so unique and refreshing.",
    "Karaoke night! Not sure if it was good but it was definitely fun.",
    "Vinyl collection growing. There's something special about analog sound.",
    "Jamming with friends. Music brings people together like nothing else.",
    "Morning tunes to start the day right. Music sets the tone for everything.",
  ],
  movies: [
    "Just watched the most mind-blowing plot twist. I did NOT see that coming!",
    "Movie marathon weekend! Sometimes you just need to binge watch everything.",
    "The cinematography in this film is absolutely stunning.",
    "New series alert! Already hooked after the first episode.",
    "Rewatching classics. Some movies just never get old.",
    "The director's cut is so much better than the theatrical version.",
    "Film festival vibes! Discovering amazing independent cinema.",
    "That ending though... I'm still processing everything.",
    "Animation has evolved so much. This movie proves it's an art form.",
    "Documentary night. Learning about the world through film.",
  ],
  education: [
    "Just finished an amazing online course. Never stop learning!",
    "Book recommendation: This changed my perspective on everything.",
    "Study session complete. The grind for knowledge never stops.",
    "Attended an incredible workshop today. So many new insights!",
    "Teaching is the best way to learn. Sharing what I know with others.",
    "New certification earned! Hard work pays off.",
    "The library is my happy place. So many worlds to explore.",
    "Education is the passport to the future. Investing in myself today.",
    "Study group session. Learning together makes everything easier.",
    "Just discovered a fascinating topic. Time to dive deep into research!",
  ],
  coding: [
    "Finally solved that bug that's been haunting me for days! The feeling is unmatched.",
    "New project launch! Months of hard work coming together.",
    "Clean code is happy code. Refactoring day!",
    "Learning a new programming language. The possibilities are endless!",
    "Open source contribution made! Giving back to the community.",
    "Code review time. Always learning from my teammates.",
    "Built a full API in one day. Feeling productive!",
    "The satisfaction when your code compiles on the first try.",
    "Documentation day. Future me will thank present me.",
    "Pair programming session. Two heads are better than one!",
  ],
  business: [
    "New venture launch! Excited to share what I've been working on.",
    "Networking event today. The connections you make can change your life.",
    "Productivity hack: Time blocking changed my workflow completely.",
    "Reading about successful entrepreneurs. Inspiration everywhere!",
    "Quarterly review done. Setting new goals for the next quarter!",
    "Startup life is challenging but incredibly rewarding.",
    "Investing in yourself is the best investment you can make.",
    "Team meeting brainstorm. The best ideas come from collaboration.",
    "Work-life balance is a journey, not a destination.",
    "Just hit a major milestone! Celebrating the small wins.",
  ],
  fashion: [
    "New outfit alert! Feeling confident in what I'm wearing.",
    "Thrift store finds are the best finds! Sustainable fashion wins.",
    "Style is a way to say who you are without having to speak.",
    "Fashion week vibes! The creativity on display is incredible.",
    "Wardrobe refresh complete. Less is more when it comes to style.",
    "Accessorizing is an art form. The right details make all the difference.",
    "Vintage fashion never goes out of style.",
    "Confidence is the best outfit. Wear it well!",
    "Color coordination game on point today.",
    "Fashion is about dressing according to what's fashionable. Style is more about being yourself.",
  ],
  sports: [
    "Game day! Let's go team!",
    "Training session complete. Getting stronger every day.",
    "The adrenaline rush during competition is unmatched.",
    "Watching the championship tonight. Sports bring people together!",
    "New personal best! Consistency is key.",
    "Team practice today. There's no I in team!",
    "Recovery day. Taking care of my body is just as important as training.",
    "Sports teach you so much about life. Discipline, teamwork, perseverance.",
    "Match results are in! Hard work paid off.",
    "Trying a new sport today. Always open to new challenges!",
  ],
  pets: [
    "My furry friend is the best companion. Unconditional love!",
    "Adopt don't shop! So grateful for my rescue pup.",
    "Pet photography session. They're naturally photogenic!",
    "Morning walk with my best friend. Starting the day right.",
    "Vet checkup day. Keeping my pet healthy and happy!",
    "Playtime is the best time! Their energy is contagious.",
    "Pets teach us so much about love and loyalty.",
    "New toy day! The excitement is real.",
    "Cuddling on the couch. The perfect way to spend an evening.",
    "Training session with my pet. Patience and consistency!",
  ],
  nature: [
    "Nature's beauty never ceases to amaze me. Perfect day for a hike!",
    "Sunrise from the mountaintop. Worth every step of the journey.",
    "Forest bathing is the best therapy. Disconnect to reconnect.",
    "The ocean has a way of putting everything into perspective.",
    "Wildlife photography requires patience but the results are magical.",
    "Seasons change and so do we. Embracing the beauty of each one.",
    "National parks are treasures. Protecting them for future generations.",
    "The sound of rain on leaves is the most peaceful sound.",
    "Stargazing night. The universe is absolutely breathtaking.",
    "Nature doesn't hurry, yet everything is accomplished.",
  ],
  motivation: [
    "Your only limit is you. Break through and achieve greatness!",
    "Success is not final, failure is not fatal. It's the courage to continue that counts.",
    "Believe in yourself and you're halfway there.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Don't watch the clock; do what it does. Keep going!",
    "Success usually comes to those who are too busy to be looking for it.",
    "The only way to do great work is to love what you do.",
    "Dream big. Start small. Act now.",
    "Your time is limited, don't waste it living someone else's life.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
  ],
  'daily life': [
    "Morning routine complete! Starting the day with intention.",
    "Sometimes the simple things bring the most joy.",
    "Weekend vibes. Taking time to recharge and do what I love.",
    "Grocery shopping day. Stocking up on all the essentials.",
    "Home improvement project in progress. Making my space my sanctuary.",
    "Sunday reset. Planning and preparing for the week ahead.",
    "Coffee shop work session. Sometimes a change of scenery helps.",
    "Self-care Sunday. Taking time for myself is not selfish.",
    "Trying a new hobby today. Life is too short to not try new things.",
    "Grateful for the little things that make life beautiful.",
  ],
};

const commentTexts = [
  "This is amazing! Love it!",
  "So inspiring! Keep it up!",
  "Wow, this is incredible!",
  "Absolutely beautiful!",
  "This made my day!",
  "I needed to see this today, thank you!",
  "You're crushing it!",
  "Goals!",
  "This is everything!",
  "So proud of you!",
  "Can't get enough of your content!",
  "This is next level!",
  "Keep shining!",
  "Love this so much!",
  "You inspire me!",
  "This is exactly what I needed!",
  "Amazing work!",
  "So talented!",
  "This is fire!",
  "Obsessed with this!",
  "The vibes are immaculate!",
  "This is pure gold!",
  "You never disappoint!",
  "Living your best life!",
  "This deserves all the likes!",
  "Iconic!",
  "This is a whole mood!",
  "Speechless! Just amazing!",
  "You're an inspiration!",
  "This is what it's all about!",
  "Perfection!",
  "This hit different!",
  "So wholesome!",
  "I'm here for this!",
  "This is legendary!",
  "Always delivering quality content!",
  "This is so you!",
  "Love everything about this!",
  "Keep being awesome!",
  "This is goals!",
  "Couldn't agree more!",
  "You're amazing at what you do!",
  "This is so relatable!",
  "Brilliant!",
  "This made me smile!",
  "You never cease to amaze!",
  "This is top tier!",
  "So well deserved!",
  "This is beautiful in every way!",
  "More of this please!",
];

const replyTexts = [
  "Thank you so much!",
  "Really appreciate that!",
  "That means a lot!",
  "Thanks for the kind words!",
  "Glad you like it!",
  "You're too kind!",
  "Appreciate you!",
  "Thanks for the support!",
  "That made my day!",
  "So grateful for your comment!",
  "Thank you! That's so nice of you!",
  "I really needed to hear this!",
  "You're amazing, thank you!",
  "Means the world to me!",
  "Thanks for always being here!",
];

const hashtags = ['#travel', '#coding', '#fitness', '#food', '#photography', '#music', '#gaming', '#nature', '#technology', '#motivation', '#lifestyle', '#inspiration', '#love', '#happy', '#beautiful', '#instagood', '#photooftheday', '#art', '#fashion', '#style'];

const storyCaptions = [
  "Behind the scenes",
  "Today's mood",
  "Quick update",
  "Look at this!",
  "Can't believe this is happening",
  "Good vibes only",
  "Making memories",
  "Living my best life",
  "This view though!",
  "Coffee first",
  "Work mode",
  "Weekend vibes",
  "Surprise!",
  "Thank you!",
  "New adventure",
  "Just chilling",
  "On my way",
  "Almost there",
  "So grateful",
  "Best day ever",
];

// Helper functions
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (daysAgo = 30) => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return past;
};
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Image generators using Unsplash
const getProfileImage = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
const getCoverPhoto = (i) => `https://picsum.photos/seed/cover${i}/1200/400`;
const getPostImage = (topic, index) => {
  const topicQueries = {
    travel: 'travel,landscape,adventure',
    food: 'food,restaurant,cooking',
    technology: 'technology,computer,tech',
    fitness: 'fitness,gym,workout',
    photography: 'camera,photo,portrait',
    gaming: 'gaming,console,videogame',
    music: 'music,concert,guitar',
    movies: 'cinema,movie,film',
    education: 'books,study,library',
    coding: 'programming,code,developer',
    business: 'business,office,meeting',
    fashion: 'fashion,style,clothing',
    sports: 'sports,athletics,competition',
    pets: 'pets,dog,cat',
    nature: 'nature,landscape,forest',
    motivation: 'success,inspiration,achievement',
    'daily life': 'lifestyle,daily,routine',
  };
  const query = topicQueries[topic] || 'lifestyle';
  const seed = `${topic}${index}`;
  return `https://picsum.photos/seed/${seed}/800/800`;
};
const getStoryImage = (i) => `https://picsum.photos/seed/story${i}/1080/1920`;

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Follow.deleteMany({});
    await Notification.deleteMany({});
    await Story.deleteMany({});
    console.log('Existing data cleared.');

    // Create 50 users
    console.log('Creating 50 users...');
    const users = [];
    const usedUsernames = new Set();
    const usedEmails = new Set();

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      let username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;

      // Ensure unique username
      let suffix = 1;
      while (usedUsernames.has(username)) {
        username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}`;
        suffix++;
      }
      usedUsernames.add(username);

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      suffix = 1;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@example.com`;
        suffix++;
      }
      usedEmails.add(email);

      const hashedPassword = await bcrypt.hash('password123', 10);

      const user = await User.create({
        username,
        fullName: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        profileImage: getProfileImage(username),
        coverPhoto: getCoverPhoto(i),
        bio: bios[i],
        location: locations[i % locations.length],
        profession: professions[i % professions.length],
        website: Math.random() > 0.5 ? `https://${username}.com` : '',
        isAdmin: i === 0, // First user is admin
      });

      users.push(user);
    }
    console.log(`Created ${users.length} users.`);

    // Create follows (each user follows 10-25 random other users)
    console.log('Creating follow relationships...');
    const followDocs = [];
    const userFollowersMap = {};
    const userFollowingMap = {};

    for (const user of users) {
      userFollowersMap[user._id.toString()] = [];
      userFollowingMap[user._id.toString()] = [];
    }

    for (const user of users) {
      const others = users.filter(u => u._id.toString() !== user._id.toString());
      const followingCount = randomInt(10, 25);
      const toFollow = pickN(others, followingCount);

      for (const target of toFollow) {
        followDocs.push({
          followerId: user._id,
          followingId: target._id,
        });
        userFollowingMap[user._id.toString()].push(target._id.toString());
        userFollowersMap[target._id.toString()].push(user._id.toString());
      }
    }

    await Follow.insertMany(followDocs);

    // Update user follower/following counts
    for (const user of users) {
      const userId = user._id.toString();
      await User.findByIdAndUpdate(user._id, {
        followers: userFollowersMap[userId],
        following: userFollowingMap[userId],
      });
    }
    console.log(`Created ${followDocs.length} follow relationships.`);

    // Create posts (5-15 per user)
    console.log('Creating posts...');
    const allPosts = [];
    const topicKeys = Object.keys(captionsByTopic);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const postCount = randomInt(5, 15);

      for (let j = 0; j < postCount; j++) {
        const topic = topicKeys[j % topicKeys.length];
        const captionPool = captionsByTopic[topic];
        let caption = captionPool[j % captionPool.length];

        // Add hashtags
        const postHashtags = pickN(hashtags, randomInt(2, 5)).join(' ');
        caption += '\n\n' + postHashtags;

        const hasImage = Math.random() > 0.15; // 85% of posts have images

        const post = await Post.create({
          userId: user._id,
          image: hasImage ? getPostImage(topic, i * 15 + j) : '',
          caption,
          likes: [],
          comments: [],
          createdAt: randomDate(30),
        });

        allPosts.push(post);
      }
    }
    console.log(`Created ${allPosts.length} posts.`);

    // Create likes (random 10-500 per post from random users)
    console.log('Creating likes...');
    const likeDocs = [];

    for (const post of allPosts) {
      const likeCount = randomInt(10, Math.min(500, users.length * 10));
      const likers = pickN(users, Math.min(likeCount, users.length));

      for (const liker of likers) {
        // Don't like your own post too often
        if (liker._id.toString() === post.userId.toString() && Math.random() > 0.3) continue;

        likeDocs.push({
          userId: liker._id,
          postId: post._id,
        });
      }

      // Update post likes array
      const likerIds = likeDocs.filter(l => l.postId.equals(post._id)).map(l => l.userId);
      await Post.findByIdAndUpdate(post._id, { likes: likerIds });
    }

    await Like.insertMany(likeDocs);
    console.log(`Created ${likeDocs.length} likes.`);

    // Create comments (2-15 per post) using bulk insert
    console.log('Creating comments...');
    const commentDocs = [];

    for (const post of allPosts) {
      const commentCount = randomInt(2, Math.min(15, users.length));
      const commenters = pickN(users, commentCount);

      for (const commenter of commenters) {
        commentDocs.push({
          userId: commenter._id,
          postId: post._id,
          text: pick(commentTexts),
          createdAt: new Date(post.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    const insertedComments = await Comment.insertMany(commentDocs);
    console.log(`Created ${insertedComments.length} comments.`);

    // Update posts with their comment IDs
    console.log('Updating posts with comment references...');
    const postCommentMap = {};
    for (const comment of insertedComments) {
      const postId = comment.postId.toString();
      if (!postCommentMap[postId]) postCommentMap[postId] = [];
      postCommentMap[postId].push(comment._id);
    }

    const postUpdateOps = Object.entries(postCommentMap).map(([postId, commentIds]) =>
      Post.findByIdAndUpdate(postId, { comments: commentIds })
    );
    await Promise.all(postUpdateOps);

    // Create replies to comments (about 20% of comments get replies)
    console.log('Creating comment replies...');
    const replyDocs = [];
    const replyCount = Math.floor(insertedComments.length * 0.2);
    const commentsToReply = pickN(insertedComments, replyCount);

    for (const comment of commentsToReply) {
      const replier = pick(users.filter(u => !u._id.equals(comment.userId)));
      replyDocs.push({
        userId: replier._id,
        postId: comment.postId,
        parentComment: comment._id,
        text: pick(replyTexts),
        createdAt: new Date(comment.createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000),
      });
    }

    const insertedReplies = await Comment.insertMany(replyDocs);
    console.log(`Created ${insertedReplies.length} comment replies.`);

    // Create notifications for follows, likes, and comments
    console.log('Creating notifications...');
    const notifDocs = [];

    // Follow notifications
    for (const follow of followDocs.slice(0, 200)) {
      notifDocs.push({
        userId: follow.followingId,
        type: 'follow',
        fromUser: follow.followerId,
        createdAt: randomDate(30),
      });
    }

    // Like notifications (sample)
    for (const like of likeDocs.slice(0, 300)) {
      const post = allPosts.find(p => p._id.equals(like.postId));
      if (post && !post.userId.equals(like.userId)) {
        notifDocs.push({
          userId: post.userId,
          type: 'like',
          fromUser: like.userId,
          postId: like.postId,
          createdAt: randomDate(30),
        });
      }
    }

    // Comment notifications (sample)
    for (const comment of insertedComments.slice(0, 200)) {
      const post = allPosts.find(p => p._id.equals(comment.postId));
      if (post && !post.userId.equals(comment.userId)) {
        notifDocs.push({
          userId: post.userId,
          type: 'comment',
          fromUser: comment.userId,
          postId: comment.postId,
          createdAt: randomDate(30),
        });
      }
    }

    await Notification.insertMany(notifDocs);
    console.log(`Created ${notifDocs.length} notifications.`);

    // Create stories for ~20 users
    console.log('Creating stories...');
    const storyUsers = pickN(users, 20);
    const storyDocs = [];

    for (let i = 0; i < storyUsers.length; i++) {
      const user = storyUsers[i];
      const storyCount = randomInt(1, 4);

      for (let j = 0; j < storyCount; j++) {
        storyDocs.push({
          userId: user._id,
          image: getStoryImage(i * 4 + j),
          caption: pick(storyCaptions),
          viewers: pickN(users.filter(u => !u._id.equals(user._id)), randomInt(5, 20)).map(u => u._id),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24 hours
          createdAt: randomDate(1),
        });
      }
    }

    await Story.insertMany(storyDocs);
    console.log(`Created ${storyDocs.length} stories for ${storyUsers.length} users.`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log(`Users: ${users.length}`);
    console.log(`Posts: ${allPosts.length}`);
    console.log(`Comments: ${insertedComments.length + insertedReplies.length}`);
    console.log(`Likes: ${likeDocs.length}`);
    console.log(`Follows: ${followDocs.length}`);
    console.log(`Notifications: ${notifDocs.length}`);
    console.log(`Stories: ${storyDocs.length}`);
    console.log('========================================');
    console.log('\nAdmin account: ' + users[0].username + ' (password: password123)');
    console.log('\nAll other accounts also use password: password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
