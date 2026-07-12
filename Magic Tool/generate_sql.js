const fs = require('fs');

const goldenTriangle = `tattoo pain chart | 27,100 | KD 15 | WEEK 1
tattoo removal near me | 27,100 | KD 9 | WEEK 1
how long does it take for a tattoo to heal | 14,800 | KD 15 | WEEK 1
tattoo meaning of a semicolon | 14,800 | KD 14 | WEEK 1
tattoo styles | 14,800 | KD 14 | WEEK 2
tattoo aftercare instructions | 9,900 | KD 10 | WEEK 1
tattoo of a butterfly meaning | 9,900 | KD 5 | WEEK 1
tattoo of butterfly meaning | 9,900 | KD 5 | WEEK 1
mild soap for tattoo aftercare | 9,900 | KD 11 | WEEK 2
tattoo healing process | 9,900 | KD 14 | WEEK 2
butterfly tattoo definition | 9,900 | KD 6 | WEEK 1
snake tattoo meaning | 8,100 | KD 7 | WEEK 1
tattoo aftercare cream | 6,600 | KD 8 | WEEK 2
tattoo lotion | 6,600 | KD 10 | WEEK 2
tattoo prices | 6,600 | KD 13 | WEEK 3
tattoo hurt scale | 6,600 | KD 14 | WEEK 3
tattoo aftercare products | 6,600 | KD 14 | WEEK 3
how much do tattoos cost | 6,600 | KD 14 | WEEK 3
tattoo peeling | 5,400 | KD 15 | WEEK 4
best numbing cream for tattoos | 5,400 | KD 15 | WEEK 4
tattoo shark meaning | 4,400 | KD 5 | WEEK 2
walk in tattoos near me | 3,600 | KD 5 | WEEK 2
least painful tattoo spots | 2,400 | KD 6 | WEEK 3
places tattoos hurt least | 2,400 | KD 6 | WEEK 3
blackwork tattoo style | 880 | KD 2 | WEEK 4`;

const meaningCluster = `medusa tattoo meaning | 40,500 | KD 25 | MONTH 2
semicolon tattoo significance | 14,800 | KD 15 | MONTH 2
butterfly tattoo meaning | 22,200 | KD 27 | MONTH 3
tattoo of a butterfly meaning | 9,900 | KD 5 | WEEK 1
snake tattoo meaning | 8,100 | KD 7 | WEEK 1
lotus tattoo meaning | 3,600 | KD 14 | MONTH 2
rose tattoo meaning | 3,600 | KD 14 | MONTH 2
scorpion tattoo meaning | 2,900 | KD 13 | MONTH 2
swallow tattoo meaning | 3,600 | KD 11 | MONTH 2
dragon tattoo meaning | 2,900 | KD 9 | MONTH 2
meaningful tattoos | 8,100 | KD 21 | MONTH 3
dandelion tattoo meaning | 6,600 | KD 23 | MONTH 3
lotus flower tattoo meaning | 6,600 | KD 22 | MONTH 3
444 tattoo meaning | 9,900 | KD 26 | MONTH 4
koi fish and dragon tattoo meaning | 2,900 | KD 14 | MONTH 2
spider web tattoo meaning | 2,900 | KD 14 | MONTH 2
rose tattoo colour meaning | 2,400 | KD 13 | MONTH 2
tribal tattoos designs and meanings | 1,900 | KD 12 | MONTH 3
skeleton hand tattoo meaning | 1,300 | KD 13 | MONTH 3
meaningful front thigh tattoos | 1,300 | KD 12 | MONTH 3`;

const aftercareCluster = `tattoo numbing cream | 33,100 | KD 23 | MONTH 4
numbing cream for tattoos | 18,100 | KD 28 | MONTH 4
tattoo aftercare tattoo | 18,100 | KD 20 | MONTH 3
how long does it take for a tattoo to heal | 14,800 | KD 15 | WEEK 1
tattoo aftercare instructions | 9,900 | KD 10 | WEEK 1
mild soap for tattoo aftercare | 9,900 | KD 11 | WEEK 2
tattoo healing process | 9,900 | KD 14 | WEEK 2
how long do tattoos take to heal | 8,100 | KD 24 | MONTH 4
tattoo aftercare cream | 6,600 | KD 8 | WEEK 2
fragrance free lotion for tattoo aftercare | 6,600 | KD 24 | MONTH 4
tattoo aftercare products | 6,600 | KD 14 | WEEK 3
tattoo lotion | 6,600 | KD 10 | WEEK 2
best tattoo numbing cream | 6,600 | KD 29 | MONTH 5
tattoo peeling | 5,400 | KD 15 | WEEK 4
aquaphor for tattoo aftercare | 5,400 | KD 27 | MONTH 5
best numbing cream for tattoos | 5,400 | KD 15 | WEEK 4
tattoo aftercare derm shield patch | 5,400 | KD 19 | MONTH 4
tattoo cream | 4,400 | KD 15 | MONTH 3
tattoo aftercare with aquaphor | 4,400 | KD 27 | MONTH 5
scentless lotion for tattoos | 4,400 | KD 25 | MONTH 5`;

const placementCluster = `tattoo pain chart | 27,100 | KD 15 | WEEK 1
tattoo hurt scale | 6,600 | KD 14 | WEEK 3
tattoo placement | 2,900 | KD 14 | MONTH 4
tattoo placement chart | 1,300 | KD 7 | MONTH 4
tattoo pain chart female | 4,400 | KD 19 | MONTH 4
most painful tattoo spots | 3,600 | KD 11 | MONTH 3
least painful tattoo spots | 2,400 | KD 6 | WEEK 3
places tattoos hurt least | 2,400 | KD 6 | WEEK 3
most painful places to get a tattoo | 2,400 | KD 19 | MONTH 4
tattoo placements | 1,300 | KD 14 | MONTH 4
meaningful front thigh tattoos | 1,300 | KD 12 | MONTH 3
tattoo ideas on shoulder for women | 1,000 | KD 10 | MONTH 3
tattoo pain chart men | 2,400 | KD 16 | MONTH 4
pain scale of tattoos | 1,900 | KD 16 | MONTH 4
first tattoo ideas | 3,600 | KD 29 | MONTH 6`;

const commercialCluster = `tattoo removal near me | 27,100 | KD 9 | MONTH 6
walk in tattoo shops near me | 18,100 | KD 25 | MONTH 9
body piercing and tattoo near me | 12,100 | KD 12 | MONTH 6
laser tattoo removal near me | 9,900 | KD 9 | MONTH 6
henna tattoo near me | 9,900 | KD 22 | MONTH 9
tattoo and piercing shops near me | 9,900 | KD 22 | MONTH 9
walk in tattoos near me | 3,600 | KD 5 | MONTH 6
eyebrow tattoo near me | 6,600 | KD 18 | MONTH 9
female tattoo artists | 2,900 | KD 16 | MONTH 6
tattoo apprenticeship near me | 2,900 | KD 9 | MONTH 9
friday the 13th tattoos near me | 2,400 | KD 10 | MONTH 9
american traditional tattoo artists near me | 720 | KD 4 | MONTH 6
book tattoo | 2,900 | KD 25 | MONTH 9
tattoo studio | 4,400 | KD 28 | YEAR 2
how much to tip tattoo artist | 5,400 | KD 21 | MONTH 6`;

const uniqueKeywords = new Set();
let inserts = [];

function process(clusterStr, clusterName) {
  clusterStr.split('\n').filter(l => l.trim()).forEach(line => {
    let [kw, vol, kdStr, pri] = line.split('|').map(s => s.trim());
    
    // strip the extra info from priority if it's there (like "(already in Golden Triangle)")
    pri = pri.split('(')[0].trim();
    // remove commas from vol
    vol = parseInt(vol.replace(/,/g, ''), 10);
    // remove "KD" from kdStr
    const kd = parseInt(kdStr.replace('KD', '').trim(), 10);

    if (!uniqueKeywords.has(kw)) {
      uniqueKeywords.add(kw);
      inserts.push(`('${kw.replace(/'/g, "''")}', '${clusterName}', ${vol}, ${kd}, '${pri}', 'pending')`);
    }
  });
}

process(goldenTriangle, 'Golden Triangle');
process(meaningCluster, 'Meaning');
process(aftercareCluster, 'Aftercare');
process(placementCluster, 'Placement');
process(commercialCluster, 'Commercial');

let output = `CREATE TABLE IF NOT EXISTS keyword_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  cluster TEXT NOT NULL,
  monthly_volume INTEGER,
  keyword_difficulty INTEGER,
  priority_period TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'ranking', 'page1')),
  published_date TIMESTAMPTZ,
  ranking_position INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE keyword_progress ADD COLUMN IF NOT EXISTS cluster TEXT;
ALTER TABLE keyword_progress ADD COLUMN IF NOT EXISTS priority_period TEXT;

CREATE INDEX IF NOT EXISTS keyword_progress_cluster_idx ON keyword_progress(cluster);
CREATE INDEX IF NOT EXISTS keyword_progress_status_idx ON keyword_progress(status);

INSERT INTO keyword_progress (keyword, cluster, monthly_volume, keyword_difficulty, priority_period, status)
VALUES
${inserts.join(',\n')}
ON CONFLICT (keyword) DO NOTHING;
`;

fs.writeFileSync('seed_keywords.sql', output, 'utf-8');
console.log('SQL generated to seed_keywords.sql');
