export const STRATEGY_EXTRAS: Record<string, any> = {
  'launch-month': {
    task: "Publish one blog post today targeting a KD-under-12 keyword from the Golden Triangle list. Link it to 3 designs in the gallery.",
    contentTargetTitle: "GOLDEN TRIANGLE",
    contentTarget: "Attack KD under 12 this week. Top targets: butterfly tattoo meaning (KD 5, 9.9K), snake tattoo meaning (KD 7, 8.1K), tattoo of butterfly meaning (KD 5, 9.9K)",
    metricKey: 'users',
    targetValue: 75,
    doRoutine: "EVERY MORNING (60 minutes):\nWrite one blog post targeting a Golden Triangle keyword (KD under 12).\nMinimum 1,500 words. Scientific and authoritative.\nEnd every post with a CTA linking to 3 related designs in the gallery.\nPublish and submit URL to Google Search Console for indexing.\n\nEVERY AFTERNOON (30 minutes):\nCreate one TikTok or Instagram Reel on the same topic as today's blog post.\nFormat: 45 seconds, visual first, text overlay explains the key point.\nCTA in caption: \"Full guide at tattoosmap.com\" with link in bio.\n\nEVERY EVENING (15 minutes):\nCheck Google Search Console for new impressions on published posts.\nCheck Supabase for new user signups and whether they completed style preferences.\nLog the day's output in a notes file: post title, keyword, word count, published URL.\n\nWEEKLY (Friday, 30 minutes):\nComplete the weekly check-in in this dashboard.\nCount: total posts published, total users registered, total designs saved, total complete profiles.\nCompare to phase targets. Adjust next week's content plan if behind.",
    doNotRoutine: "DO NOT DO THIS WEEK:\nDo not contact any artists.\nDo not run paid ads.\nDo not build new features.\nDo not check competitor websites.\nFocus is 100% on content publishing and user profile completion rate."
  },
  'early-traction': {
    task: "Write one meaning page today at /meaning/[subject] for a keyword with KD under 10. Embed the AR try-on on the page.",
    contentTargetTitle: "MEANING CLUSTER",
    contentTarget: "Build programmatic meaning pages. Top targets: tattoo meaning of a semicolon (KD 14, 14.8K), tattoo of a butterfly meaning (KD 5, 9.9K), rose tattoo meaning (KD 14, 3.6K)",
    metricKey: 'users',
    targetValue: 200,
    doRoutine: "EVERY MORNING (90 minutes):\nContinue publishing one blog post per day.\nNow alternate between: Golden Triangle blog posts (Day 1, 3, 5) and\nprogrammatic meaning pages at /meaning/[subject] (Day 2, 4, 6).\nMeaning pages target KD under 10 keywords from the meaning cluster.\nEach meaning page embeds the AR try-on and links to related designs in the gallery.\n\nEVERY AFTERNOON (30 minutes):\nPost one TikTok. This week's format: show a specific tattoo design and explain its meaning.\n\"This butterfly design means X in Japanese culture — save it on TattoosMap to show your artist.\"\nTrack which content format drives the most completed user profile signups.\n\nEVERY EVENING (15 minutes):\nCheck Day-7 return rate in Supabase: SELECT COUNT(DISTINCT user_id) FROM design_views\nWHERE created_at > NOW() - INTERVAL '7 days' divided by total registered users.\nIf below 25%, the onboarding flow needs to be changed before publishing more content.\n\nWEEKLY (Friday, 45 minutes):\nComplete the weekly check-in.\nSpecifically count: how many users have completed location AND style preferences.\nThis is the demand database quality metric. Below 40% completion rate means\nthe onboarding flow is not compelling enough — fix it before next week.",
    doNotRoutine: "DO NOT DO THIS WEEK:\nDo not approach any artists.\nDo not introduce paid features yet.\nDo not expand to a second platform or social channel.\nDo not build any new product features."
  },
  'pmf-hunt': {
    task: "Check your Day-30 retention cohort in Supabase. If below 20% stop all content and interview 5 churned users today.",
    contentTargetTitle: "AFTERCARE CLUSTER",
    contentTarget: "Establish medical authority. Top targets: tattoo aftercare instructions (KD 10, 9.9K), mild soap for tattoo aftercare (KD 11, 9.9K), tattoo aftercare cream (KD 8, 6.6K)",
    metricKey: 'mau',
    targetValue: 400,
    doRoutine: "EVERY MORNING (90 minutes):\nNow publishing in three content formats simultaneously:\nMonday and Thursday: Aftercare science blog posts targeting KD under 15.\nTuesday and Friday: Meaning programmatic pages for new subjects.\nWednesday: Placement guide content (pain chart, body placement guides).\nSaturday: One long-form pillar post (2,500 words minimum) targeting a higher-volume keyword.\nSunday: Rest. No content. Review the week's analytics only.\n\nEVERY AFTERNOON (30 minutes):\nPost one TikTok. This week's priority format: aftercare science content.\n\"Your artist probably didn't tell you this about tattoo healing\" performs best in this niche.\nUse the exact aftercare cluster keywords as video titles for searchability on TikTok.\n\nEVERY WEEK — RETENTION CHECK (mandatory before any other work):\nPull the Day-30 retention cohort from Supabase.\nIf below 20%: STOP all content. Spend the entire week doing exit interviews.\nMessage 10 churned users directly. Ask: what would have made you come back?\nDo not publish new content until the retention problem is diagnosed.\n\nMONTH 5 SPECIFIC — First monetization attempt:\nLaunch the consultation brief at $9.99.\nAnnounce it only to the email list — not publicly.\nTarget: 10 paying users in the first week.\nIf zero conversions after 2 weeks, change the price to $4.99 and try again.",
    doNotRoutine: "DO NOT THIS PHASE:\nDo not approach artists until you have 200 complete profiles in one city.\nDo not tell anyone publicly how many users you have — strategic redaction.\nDo not introduce a subscription model yet — one-time purchase only."
  },
  'growth-stage': {
    task: "Identify the 3 users with the highest save counts in your target city and send them a personal match message to an onboarded artist.",
    contentTargetTitle: "COMMERCIAL CLUSTER",
    contentTarget: "Local artist pages. Top targets: tattoo removal near me (KD 9, 27.1K), walk in tattoos near me (KD 5, 3.6K), female tattoo artists (KD 16, 2.9K)",
    metricKey: 'artists',
    targetValue: 40,
    doRoutine: "EVERY MORNING — TWO TRACKS SIMULTANEOUSLY:\n\nTRACK 1 — CONTENT (60 minutes):\nNow focus on the commercial and local cluster.\nBuild city-specific artist discovery pages: tattoosmap.com/tattoo-artists/[city].\nEach page must have real artists listed — do not create empty local pages.\nOne new city page per week, only after artists in that city are onboarded.\nContinue 3 blog posts per week targeting remaining Golden Triangle keywords.\n\nTRACK 2 — ARTIST OUTREACH (30 minutes):\nIdentify 3 artists per day to approach with the demand pitch.\nResearch their Instagram to confirm their style matches your user demand data.\nSend a personal video message or DM — not an email template.\nThe pitch: \"I have [X] users in [their neighborhood] who saved [their style] designs in the last 30 days. I want to send them to you for free. Can we talk for 10 minutes?\"\nTrack every outreach in a simple spreadsheet: artist name, city, style, date contacted, response, outcome.\n\nEVERY WEEK — LIQUIDITY CHECK:\nCount how many artist profiles received at least one inquiry this month.\nDivide by total artist profiles. This is your liquidity rate.\nTarget: above 30%.\nIf below 30%: manually facilitate matches before automating anything.\nContact users personally who saved designs matching each artist's style.\n\nWEEKLY CHECK-IN (Friday):\nComplete dashboard check-in with all metrics.\nSpecifically record: number of artists approached this week, number who joined,\nnumber of bookings facilitated, MRR from artist subscriptions, MRR from consultation briefs.",
    doNotRoutine: "DO NOT THIS PHASE:\nDo not approach Pre-Seed institutional investors until MRR is above $5,000 growing 15% month-over-month.\nDo not build the artist CRM with more than 3 features: intake form, calendar blocking, deposit via Stripe Connect.\nDo not expand to a second city until the first city has liquidity above 40%."
  },
  'scale-y2': {
    task: "Check artist monthly churn rate. If above 5% call the churning artist personally before end of day.",
    contentTargetTitle: "LOCAL PAGES",
    contentTarget: "City-specific artist discovery. Top targets: tattoosmap.com/tattoo-artists/london, /new-york, /brooklyn — targeting walk in tattoo shops near me (KD 25, 18.1K)",
    metricKey: 'revenue',
    targetValue: 500000,
    doRoutine: "WEEKLY RHYTHM (not daily — you have a team now):\n\nMONDAY (2 hours — Strategic):\nReview all city liquidity rates from the previous week.\nReview artist churn report: which artists did not log in last week.\nPersonal call to any artist who has not received an inquiry in 14 days.\nSet the week's priorities for the team.\n\nTUESDAY AND WEDNESDAY (Content and SEO):\nFocus on local SEO — city-specific pages and programmatic artist directory pages.\nBuild: tattoosmap.com/tattoo-artists/[city]/[style] combination pages.\nExample: /tattoo-artists/london/fine-line, /tattoo-artists/brooklyn/blackwork.\nThese pages rank for \"fine line tattoo artist London\" type queries within 90 days.\n\nTHURSDAY (Product):\nOne PR/FAQ document for any new feature being considered.\nMust be written before any code is discussed.\nIf you cannot write a clear PR/FAQ for it, do not build it.\n\nFRIDAY (Finance and Metrics):\nComplete weekly check-in with all metrics including GMV, NRR, artist churn.\nReview month-to-date MRR and ARR trajectory.\nIf on track for $300,000 ARR by year end: continue current plan.\nIf behind: pause city expansion and focus on increasing artist retention in existing cities.",
    doNotRoutine: "NEVER:\nDo not attend conferences or events that take more than one full day.\nDo not take investor meetings until all four Seed round unlock conditions are met.\nDo not hire a fifth employee before the fourth employee's role is fully optimized."
  },
  'expansion-y3': {
    task: "Verify Australian demand database has 200 or more complete profiles in Sydney before approaching a single Australian artist.",
    contentTargetTitle: "AUSTRALIA CONTENT",
    contentTarget: "Build demand database before artist outreach. Target: tattoosmap.com/tattoo-artists/sydney and /melbourne before approaching any Australian artist",
    metricKey: 'mau',
    targetValue: 20000,
    doRoutine: "WEEKLY RHYTHM:\n\nMONDAY (Strategic):\nReview market-specific liquidity per city dashboard.\nAny city below 30% liquidity gets a dedicated fix plan this week.\nAustralia check: is the consumer demand database at 200 complete profiles in Sydney before any artist is approached?\n\nTUESDAY TO THURSDAY (Expansion execution):\nAustralian content build: 3 posts per week targeting Australian tattoo search queries.\nAustralian local pages only after Australian artists are onboarded.\nUS and UK: transition to maintaining existing content — optimize top 20 ranking pages for featured snippets.\n\nFRIDAY (Investor prep):\nSeries A readiness check: is ARR above $1,500,000 AND growing 10% month-over-month AND LTV:CAC above 3:1?\nIf all three: begin preparing Series A pitch deck.\nIf not all three: identify which metric is blocking and fix it before preparing any pitch materials.",
    doNotRoutine: "NEVER:\nDo not approach Australian artists before the demand database has 200 complete profiles in their city.\nDo not raise Series B before ARR is above $4,000,000.\nDo not launch in more than one new international market simultaneously."
  },
  'platform-y4': {
    task: "Review loan pilot default rate. If above 5% pause the loan book immediately.",
    contentTargetTitle: "APAC CONTENT",
    contentTarget: "Korea and Japan meaning content in local language. Begin with English-language APAC pages targeting expat tattoo communities in Tokyo and Seoul",
    metricKey: 'revenue',
    targetValue: 5000000,
    doRoutine: "WEEKLY RHYTHM (Strategic):\n\nFocus on: Y4-Y5 GMV monitoring and loan pilot management.\nMeasure artist loan defaults and NRR. Develop APAC localization requirements. Execute insurance product pilot.",
    doNotRoutine: "NEVER:\nDo not force financial products on lower-tier artists.\nDo not aggressively market loans to unverified supply."
  },
  'dominance-y6': {
    task: "Measure organic growth rate without paid acquisition this week. If below 5% month-over-month rebuild the referral loop before resuming paid spend.",
    contentTargetTitle: "AUTHORITY CONTENT",
    contentTarget: "Long-form studies and original research that earn backlinks. Publish the annual TattoosMap Industry Report with original booking data",
    metricKey: 'revenue',
    targetValue: 25000000,
    doRoutine: "WEEKLY RHYTHM (Strategic):\n\nFocus on: LTV:CAC optimization and APAC expansion sequencing.\nExecute regional competitor acquisition strategy and launch enterprise tier.",
    doNotRoutine: "NEVER:\nDo not let organic growth slip below paid acquisition.\nDo not ignore LTV:CAC degradation."
  },
  'billion-target': {
    task: "Track enterprise value to revenue multiple against public SaaS comparable multiples this week.",
    contentTargetTitle: "BRAND CONTENT",
    contentTarget: "Thought leadership and category creation content. TattoosMap should own the definition of trust in the tattoo industry globally",
    metricKey: 'revenue',
    targetValue: 80000000,
    doRoutine: "WEEKLY RHYTHM (Strategic):\n\nFocus on: Exit preparation and M&A execution.\nManage banker relationships and evaluate adjacency market conditions.",
    doNotRoutine: "NEVER:\nDo not let organizational bloat slow development speed.\nMaintain PR/FAQ discipline at all costs."
  }
};
