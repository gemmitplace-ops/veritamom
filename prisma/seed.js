const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

const milestones = [
  { week: 4, title: 'The beginning', description: 'Your baby is a tiny cluster of cells called a blastocyst, implanting into your uterine wall. Major development of the neural tube, heart, and other organs begins.', babySize: 'poppy seed', babySizeComparison: '🌱', developmentHighlights: 'Neural tube forming, heart cells developing, basic body structure establishing. Your embryo is about 2mm long.' },
  { week: 5, title: 'Heart beating', description: 'Your baby\'s heart begins to beat. The neural tube, which becomes the brain and spinal cord, is closing.', babySize: 'sesame seed', babySizeComparison: '🫘', developmentHighlights: 'Heart begins beating, brain sections forming, eyes and ears starting to develop.' },
  { week: 6, title: 'Facial features forming', description: 'Your baby is developing facial features including the eyes, nose, ears, and mouth. The heart is beating at about 100-160 beats per minute.', babySize: 'sweet pea', babySizeComparison: '🟢', developmentHighlights: 'Eyes and ears forming, arm and leg buds appearing, heart chambers developing.' },
  { week: 7, title: 'Joints forming', description: 'Elbows and knees are forming. The face is becoming more defined. Hands and feet look like paddles but are starting to differentiate.', babySize: 'blueberry', babySizeComparison: '🫐', developmentHighlights: 'Joint formation, brain growing rapidly, digestive system developing.' },
  { week: 8, title: 'All essential organs present', description: 'All essential organs have begun to develop. Your baby is now officially called a fetus. Fingers and toes are beginning to form.', babySize: 'raspberry', babySizeComparison: '🍓', developmentHighlights: 'Fingers and toes forming, taste buds developing, facial muscles forming.' },
  { week: 9, title: 'Moving around', description: 'Your baby can make small movements, though you won\'t feel them yet. Reproductive organs are developing.', babySize: 'cherry', babySizeComparison: '🍒', developmentHighlights: 'Spontaneous movements beginning, teeth buds forming, all joints now present.' },
  { week: 10, title: 'Vital organs working', description: 'Your baby\'s vital organs — heart, brain, liver, and kidneys — are all working. Fingernails and hair are beginning to form.', babySize: 'prune', babySizeComparison: '🫐', developmentHighlights: 'All vital organs functioning, fingernails forming, swallowing developing.' },
  { week: 11, title: 'Kicks and somersaults', description: 'Your baby is somersaulting and kicking inside the womb. The head is nearly half the body length.', babySize: 'lime', babySizeComparison: '🍋', developmentHighlights: 'Kicks and stretches, fingers separated, genitals beginning to differentiate.' },
  { week: 12, title: 'First trimester ends', description: 'The risk of miscarriage drops significantly. Your baby has developed all major organs.', babySize: 'plum', babySizeComparison: '🍑', developmentHighlights: 'Major organ development complete, reflexes developing, bone tissue forming.' },
  { week: 13, title: 'Into the second trimester', description: 'Your baby can now make sucking motions. Intestines have moved back in. Your baby can sense light.', babySize: 'peach', babySizeComparison: '🍑', developmentHighlights: 'Intestines in place, sucking reflex, fingerprints forming.' },
  { week: 14, title: 'Tiny facial expressions', description: 'Your baby can squint, frown, and grimace. The kidneys are producing urine. Fine lanugo hair is covering the body.', babySize: 'lemon', babySizeComparison: '🍋', developmentHighlights: 'Facial expressions, lanugo forming, kidneys producing urine.' },
  { week: 15, title: 'Bones hardening', description: 'Bones are hardening and becoming visible on ultrasound. Your baby is growing quickly.', babySize: 'apple', babySizeComparison: '🍎', developmentHighlights: 'Bones ossifying, taste buds active, amniotic fluid being swallowed.' },
  { week: 16, title: 'Eyes moving', description: 'Your baby\'s eyes can now move side to side. You may start feeling flutters — those are your baby\'s first movements you can feel!', babySize: 'avocado', babySizeComparison: '🥑', developmentHighlights: 'Eye movement, first felt movements possible, nervous system maturing.' },
  { week: 17, title: 'Fat developing', description: 'Your baby is developing fat stores, which will help regulate body temperature after birth.', babySize: 'pear', babySizeComparison: '🍐', developmentHighlights: 'Fat stores building, skeleton hardening, sweat glands forming.' },
  { week: 18, title: 'Hearing begins', description: 'Your baby can now hear sounds from outside the womb — your voice, music, and heartbeat.', babySize: 'bell pepper', babySizeComparison: '🫑', developmentHighlights: 'Hearing developing, nerve myelination, gender visible on ultrasound.' },
  { week: 19, title: 'Almost halfway!', description: 'Your baby\'s senses — taste, smell, sight, hearing, and touch — are all developing. A waxy vernix coating is forming.', babySize: 'tomato', babySizeComparison: '🍅', developmentHighlights: 'All five senses developing, vernix forming, brain developing specialized areas.' },
  { week: 20, title: 'Halfway point', description: 'Your baby is halfway to arrival! This week often marks the anatomy scan. Your baby is swallowing amniotic fluid.', babySize: 'banana', babySizeComparison: '🍌', developmentHighlights: 'Anatomy scan time, swallowing fluid, fingerprints complete, hair growing.' },
  { week: 21, title: 'Kicks and punches', description: 'You\'ll really be feeling those movements now! Your baby\'s eyebrows and eyelids are fully formed.', babySize: 'carrot', babySizeComparison: '🥕', developmentHighlights: 'Bone marrow producing blood cells, defined sleep cycles, strong kicks.' },
  { week: 22, title: 'Sense of touch', description: 'Your baby has a strong sense of touch now. The eyes have formed. Your baby may start responding to your voice.', babySize: 'papaya', babySizeComparison: '🫐', developmentHighlights: 'Touch sensitivity, responding to voice, brain developing senses.' },
  { week: 23, title: 'Listening and recognizing', description: 'Your baby is listening to everything going on outside and starting to recognize voices. Rapid brain development continues.', babySize: 'mango', babySizeComparison: '🥭', developmentHighlights: 'Voice recognition, lung surfactant starting, nipple formation.' },
  { week: 24, title: 'Viability milestone', description: 'A major milestone — babies born this week have a chance of survival with medical help. The lungs are developing rapidly.', babySize: 'ear of corn', babySizeComparison: '🌽', developmentHighlights: 'Lung development, viability milestone, taste buds maturing.' },
  { week: 25, title: 'Hair appearing', description: 'Hair color and texture is starting to show. Your baby is gaining weight and fat.', babySize: 'rutabaga', babySizeComparison: '🫒', developmentHighlights: 'Hair growing in, startle reflex, capillaries under skin.' },
  { week: 26, title: 'Eyes opening', description: 'Your baby\'s eyes are opening for the first time! They can see light and shadow.', babySize: 'scallion', babySizeComparison: '🌿', developmentHighlights: 'Eyes opening, responds to light, immune system developing.' },
  { week: 27, title: 'Third trimester begins', description: 'Welcome to the third trimester! Your baby sleeps and wakes on a regular schedule.', babySize: 'cauliflower', babySizeComparison: '🥦', developmentHighlights: 'Regular sleep cycles, brain more active, lung development continues.' },
  { week: 28, title: 'Brain folding', description: 'Your baby\'s brain is developing characteristic grooves and indentations. The lungs are maturing rapidly.', babySize: 'eggplant', babySizeComparison: '🍆', developmentHighlights: 'Brain folds forming, REM sleep beginning, fat deposits increasing.' },
  { week: 29, title: 'Muscle and bone development', description: 'Your baby\'s bones are fully developed but still soft. Muscles are growing stronger.', babySize: 'butternut squash', babySizeComparison: '🎃', developmentHighlights: 'Bones fully formed but soft, strong kicks, practicing breathing.' },
  { week: 30, title: 'Brain growth spurt', description: 'Your baby\'s brain is undergoing a major growth spurt. Lanugo hair is disappearing.', babySize: 'cabbage', babySizeComparison: '🥬', developmentHighlights: 'Major brain growth, bone marrow active, lanugo reducing.' },
  { week: 31, title: 'Rapid growth continues', description: 'Your baby is rapidly gaining weight and putting on fat. Major development is complete.', babySize: 'coconut', babySizeComparison: '🥥', developmentHighlights: 'Rapid weight gain, nails fully formed, liver and kidneys fully functional.' },
  { week: 32, title: 'Practice breathing', description: 'Your baby is practicing breathing movements. All five senses are working.', babySize: 'squash', babySizeComparison: '🥒', developmentHighlights: 'Breathing practice, head-down position likely, iron stores building.' },
  { week: 33, title: 'Bones firming', description: 'Your baby\'s skull bones are not yet fused, allowing them to compress for birth. Eyes open while awake.', babySize: 'pineapple', babySizeComparison: '🍍', developmentHighlights: 'Skull flexible for birth, eyes open when awake, immune system strengthening.' },
  { week: 34, title: 'Preparing for the world', description: 'Your baby is fattening up for life outside. The protective vernix coating is thickening.', babySize: 'cantaloupe', babySizeComparison: '🍈', developmentHighlights: 'Fat stores increasing, vernix thickening, nearly all organs ready.' },
  { week: 35, title: 'Almost ready', description: 'Your baby\'s kidneys and liver are fully functional. Most physical development is complete.', babySize: 'honeydew melon', babySizeComparison: '🫐', developmentHighlights: 'All organs functional, less room to move, gaining about 250g per week.' },
  { week: 36, title: 'Settling in', description: 'Your baby is likely in the head-down position now. Considered "late preterm" if born now.', babySize: 'romaine lettuce', babySizeComparison: '🥬', developmentHighlights: 'Head-down position, shedding lanugo, nearly full term.' },
  { week: 37, title: 'Full term!', description: 'Your baby is now considered full term! All organs are ready for the outside world.', babySize: 'Swiss chard', babySizeComparison: '🌿', developmentHighlights: 'Full term achieved, all organs mature, final fat deposits.' },
  { week: 38, title: 'Ready for birth', description: 'Your baby is fully ready for birth. The skull remains unfused for delivery.', babySize: 'leek', babySizeComparison: '🌿', developmentHighlights: 'Fully ready for birth, grasping reflex strong, possibly full head of hair.' },
  { week: 39, title: 'Due any time now', description: 'Your baby\'s brain and lungs are fully mature. The placenta is still providing nutrients and antibodies.', babySize: 'mini watermelon', babySizeComparison: '🍉', developmentHighlights: 'Brain and lungs fully mature, final antibody transfer from placenta.' },
  { week: 40, title: 'Due date week!', description: 'Your baby is here or arriving any moment! The average baby is about 3.4kg and 51cm at birth.', babySize: 'small pumpkin', babySizeComparison: '🎃', developmentHighlights: 'Fully developed and ready! Average birth weight 2.7-4kg.' },
];

async function main() {
  console.log('Seeding database...');

  for (const milestone of milestones) {
    await prisma.milestoneWeek.upsert({
      where: { week: milestone.week },
      update: milestone,
      create: milestone,
    });
  }
  console.log(`✓ Seeded ${milestones.length} milestone weeks`);

  const tags = [
    { name: 'Nutrition', slug: 'nutrition' },
    { name: 'Mental Health', slug: 'mental-health' },
    { name: 'Sleep', slug: 'sleep' },
    { name: 'Exercise', slug: 'exercise' },
    { name: 'Breastfeeding', slug: 'breastfeeding' },
    { name: 'Fetal Development', slug: 'fetal-development' },
    { name: 'Postpartum', slug: 'postpartum' },
    { name: 'Labor & Birth', slug: 'labor-birth' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({ where: { slug: tag.slug }, update: {}, create: tag });
  }
  console.log(`✓ Seeded ${tags.length} tags`);

  const password = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      passwordHash: password,
      name: 'Sarah Chen',
      username: 'sarahchen',
      language: 'EN',
      country: 'Singapore',
      city: 'Singapore',
      pregnancyStatus: 'PREGNANT',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      isOnboardingComplete: true,
      bio: 'First-time mum, 28 weeks along. Love evidence-based parenting!',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'min@example.com' },
    update: {},
    create: {
      email: 'min@example.com',
      passwordHash: password,
      name: 'Min-Ji Park',
      username: 'minji_park',
      language: 'KO',
      country: 'South Korea',
      city: 'Seoul',
      pregnancyStatus: 'PARENT',
      childBirthdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      isOnboardingComplete: true,
      bio: 'New mum to a 4-month old. Sleep deprived but happy!',
    },
  });

  const user1 = await prisma.user.findUnique({ where: { email: 'sarah@example.com' } });

  await prisma.user.upsert({
    where: { email: 'admin@veritamom.com' },
    update: {},
    create: {
      email: 'admin@veritamom.com',
      passwordHash: password,
      name: 'Veritamom Admin',
      username: 'admin',
      role: 'ADMIN',
      language: 'EN',
      country: 'Singapore',
      pregnancyStatus: 'PROFESSIONAL',
      isOnboardingComplete: true,
    },
  });

  console.log('✓ Seeded 3 users');

  const nutritionTag = await prisma.tag.findUnique({ where: { slug: 'nutrition' } });
  const mentalHealthTag = await prisma.tag.findUnique({ where: { slug: 'mental-health' } });
  const breastfeedingTag = await prisma.tag.findUnique({ where: { slug: 'breastfeeding' } });

  const papers = [
    {
      title: 'Omega-3 Fatty Acid Supplementation During Pregnancy and Child Cognitive Development',
      citation: 'Braarud, H.C., et al. (2018)',
      journalName: 'Pediatrics',
      publishedYear: 2018,
      summary: 'Taking omega-3 fish oil supplements during pregnancy may support your baby\'s brain development. This study found that children whose mothers took omega-3 supplements showed slightly better problem-solving skills at 18 months. The supplements were safe and well-tolerated.',
      summaryZh: '孕期补充欧米伽-3鱼油可能有助于宝宝的大脑发育。该研究发现，母亲在孕期服用欧米伽-3补充剂的孩子，在18个月时解决问题的能力略优。补充剂安全且耐受性良好。',
      summaryKo: '임신 중 오메가-3 어유 보충제를 복용하면 아기의 뇌 발달에 도움이 될 수 있습니다. 이 연구에 따르면 임신 중 오메가-3 보충제를 복용한 어머니의 아이들이 18개월에 문제 해결 능력이 약간 더 우수했습니다.',
      fullPaperUrl: 'https://doi.org/10.1542/peds.2017-4125',
      trimesterRelevance: 'FIRST,SECOND,THIRD',
      isPublished: true,
      tagId: nutritionTag ? nutritionTag.id : null,
    },
    {
      title: 'Perinatal Depression and Anxiety: Prevalence, Risk Factors, and Treatment Options',
      citation: 'Wisner, K.L., et al. (2013)',
      journalName: 'JAMA Psychiatry',
      publishedYear: 2013,
      summary: 'Approximately 1 in 7 women experiences depression during or after pregnancy. Many cases go undiagnosed. Both therapy and medication are safe and effective. If you\'re feeling persistently sad or overwhelmed, please talk to your healthcare provider — help is available.',
      summaryZh: '约1/7的女性在孕期或产后会经历抑郁。许多病例未被诊断。心理治疗和药物治疗都是安全有效的选择。如果您持续感到悲伤，请与您的医疗提供者交谈。',
      summaryKo: '약 7명 중 1명의 여성이 임신 중 또는 출산 후 우울증을 경험합니다. 많은 경우가 진단되지 않습니다. 심리치료와 약물치료 모두 안전하고 효과적입니다.',
      fullPaperUrl: 'https://doi.org/10.1001/jamapsychiatry.2013.2213',
      trimesterRelevance: 'THIRD,POSTPARTUM',
      isPublished: true,
      tagId: mentalHealthTag ? mentalHealthTag.id : null,
    },
    {
      title: 'Breastfeeding and Long-term Health Outcomes for Mother and Child: A Systematic Review',
      citation: 'Victora, C.G., et al. (2016)',
      journalName: 'The Lancet',
      publishedYear: 2016,
      summary: 'Breastfeeding has significant long-term benefits for both babies and mothers. Babies who are breastfed have lower risk of infections and obesity. For mothers, it reduces the risk of breast cancer. Even partial or short-term breastfeeding provides meaningful advantages.',
      summaryZh: '母乳喂养对婴儿和母亲都有显著的长期益处。母乳喂养的婴儿感染和肥胖的风险较低。对母亲而言，可降低乳腺癌的风险。即使是部分或短期母乳喂养也有显著优势。',
      summaryKo: '모유 수유는 아기와 어머니 모두에게 장기적인 이점이 있습니다. 모유 수유를 받은 아기는 감염과 비만의 위험이 낮습니다. 부분적이거나 단기 모유 수유도 의미 있는 이점을 제공합니다.',
      fullPaperUrl: 'https://doi.org/10.1016/S0140-6736(15)01024-7',
      trimesterRelevance: 'POSTPARTUM',
      isPublished: true,
      tagId: breastfeedingTag ? breastfeedingTag.id : null,
    },
  ];

  for (const paper of papers) {
    const { tagId, ...paperData } = paper;
    const existing = await prisma.researchPaper.findFirst({ where: { title: paper.title } });
    if (!existing) {
      await prisma.researchPaper.create({
        data: {
          ...paperData,
          tags: tagId ? { create: [{ tagId }] } : undefined,
        },
      });
    }
  }
  console.log('✓ Seeded 3 research papers');

  const postData = [
    { title: 'What helped with your morning sickness?', body: 'I\'m 9 weeks and struggling so much with nausea. I\'ve tried ginger tea but it\'s not really working. What has actually helped you?', category: 'QUESTION', authorId: user1.id },
    { title: 'Finally felt baby move for the first time! 🎉', body: 'I\'m 18 weeks and felt those flutters for the first time last night! I cried happy tears. Just wanted to share this moment.', category: 'WIN', authorId: user1.id },
    { title: 'Worried about my low PAPP-A results', body: 'My first trimester screening came back with low PAPP-A (0.3 MoM). My doctor mentioned increased monitoring but I\'m really anxious. Has anyone else had this?', category: 'CONCERN', authorId: user2.id },
    { title: 'Honest review: Haakaa silicone breast pump', body: 'Six months in and I have thoughts! The Haakaa is genuinely one of the most useful things I bought. I use it on the letdown of the opposite breast while feeding and easily get 60-90ml each session.', category: 'PRODUCT_REVIEW', authorId: user2.id },
    { title: 'High-protein pregnancy smoothie recipe', body: 'Made this smoothie every morning in my third trimester!\n\n1 cup spinach, 1 banana, 1 cup Greek yogurt, 1/2 cup frozen mango, 1 tbsp almond butter, 1 tsp blackstrap molasses.\n\nBlend with a splash of milk. About 20g protein. Enjoy!', category: 'RECIPE', authorId: user1.id },
  ];

  for (const post of postData) {
    const existing = await prisma.post.findFirst({ where: { title: post.title } });
    if (!existing) await prisma.post.create({ data: post });
  }
  console.log('✓ Seeded 5 community posts');

  console.log('\n✅ Database seeded successfully!');
  console.log('Test accounts: sarah@example.com / min@example.com / admin@veritamom.com (all password: password123)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
