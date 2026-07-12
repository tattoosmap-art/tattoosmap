'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * UTILS
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * DATA CONSTANTS
 */
const PHASES = [
  {
    id: 'launch-month',
    name: 'Launch — Consumer Honeypot begins',
    year: 'Week 1–4',
    subtitle: 'Build the demand engine before touching artist supply. Users first. Artists second.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Completed user profiles with location and style data',
      reason: 'A user who signs up without completing their location and style preferences has zero value for the Phase 2 artist pitch. 50 complete profiles are worth more than 500 incomplete ones.',
      source: 'B2B Trojan Horse strategy — demand data quality determines artist conversion rate in Month 9.',
    },
    targets: [
      { label: 'Visitors', value: '150 to 250', isEstimate: true },
      { label: 'Registered users', value: '50 to 75', isEstimate: true },
      { label: 'MAU', value: '40 to 60', isEstimate: true },
      { label: 'Artist profiles', value: '0', isEstimate: false },
      { label: 'Designs saved', value: '100 to 150', isEstimate: true },
      { label: 'Waitlist', value: '75 to 100', isEstimate: true },
      { label: 'Revenue', value: '$0', isEstimate: false },
      { label: 'Team', value: 'Solo founder', isEstimate: false },
    ],
    success: '75 registered users with complete location and style profiles concentrated in the launch city. At least 40 returning for a second session within the first week. Quality of data matters more than quantity at this stage.',
    failure: 'Zero artist profiles attempted because you spent Week 1 through Week 4 trying to recruit artists instead of building consumer demand. Or: 75 users acquired but none have completed location and style preferences — the demand database has no value without this data.',
    fix: 'Post 3 pieces of meaning-focused tattoo content per day on TikTok and Instagram targeting the launch city. Each piece links to one specific design in the library. Track which content format drives completed profile signups, not just visits.',
    fixSource: 'Pinterest documented that their earliest users came from design blogger communities — niche content outperforms broad content in the first 30 days.',
    decisions: [
      {
        decision: 'Decide whether to build AR try-on using existing library or AI generation.',
        framework: 'AI generation creates the "Final Boss of Pinterest" problem. Artists hate AI designs that are physically impossible on skin. Use AI to recommend and match existing verified designs from the library.',
        signal: 'If any user brings an AI-generated design to an artist consultation and the artist rejects it, the feature is creating a problem.',
      },
      {
        decision: 'Decide the geographic focus for consumer acquisition.',
        framework: 'Peter Thiel\'s sequencing principle from Zero to One — dominate one small market completely before expanding. The city chosen for consumer acquisition must be where the B2B artist pitch happens.',
        signal: 'Choose a city where you can identify 20+ artist profiles on Instagram with 2k+ followers and a clearly defined style niche.',
      },
      {
        decision: 'Decide what user data to capture during signup.',
        framework: 'Capture data as a sales weapon: location, preferred styles, body placement, and budget. This allows you to tell an artist in Month 9 exactly how much demand exists in their neighborhood.',
        signal: 'If users are completing profiles with location and style data at below 40%, redesign the onboarding to make these fields feel like personalization benefits.',
      },
    ],
    investor: 'NOT READY. No metrics justify investor conversations at this stage. Focus entirely on product and user quality.',
    investorStatus: 'amber',
    warning: 'Do not recruit artists yet. Do not approach investors yet. Do not run paid acquisition yet. Every dollar and hour spent on anything other than building the consumer demand database in one city is wasted at this stage.',
    warningSource: 'Andrew Chen, The Cold Start Problem — exclusive focus on one side of the marketplace until critical mass is achieved.',
    currentValuation: '$0 to $150,000. Pre-revenue, pre-traction consumer app with no artist supply. Valued on founder quality and market opportunity only.',
    valuationUnlock: 'Reaching 500 complete user profiles with location and style data in the launch city unlocks the ability to begin the Phase 2 demand pitch to artists.',
    accuracyNote: 'CONSERVATIVE END. Targets calibrated against Pinterest\'s documented 3,000 users in 3 months trajectory. A founder hitting these targets is on track.',
  },
  {
    id: 'early-traction',
    name: 'Early traction — building the demand database',
    year: 'Month 2–3',
    subtitle: 'Every user who saves a design is a future lead for an artist. Make the app unmissable.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Day-7 return rate',
      reason: 'If users do not return within 7 days their demand data becomes stale. An artist approached in Month 9 with data showing users active 6 months ago will not be convinced.',
      source: 'Reforge Activation Framework — recency of engagement predicts conversion to purchase intent.',
    },
    targets: [
      { label: 'Visitors', value: '750 to 1,000', isEstimate: true },
      { label: 'Registered users', value: '150 to 200', isEstimate: true },
      { label: 'MAU', value: '100 to 130', isEstimate: true },
      { label: 'Artist profiles', value: '0', isEstimate: false },
      { label: 'Designs saved', value: '400 to 600', isEstimate: true },
      { label: 'Waitlist size', value: '150 to 250', isEstimate: true },
      { label: 'Revenue', value: '$0', isEstimate: false },
      { label: 'Team', value: 'solo founder', isEstimate: false },
    ],
    success: 'Day-7 return rate above 30%. Average saves per active user above 3 per session. At least 100 users with complete location and style profiles in the launch city.',
    failure: '200 registered users but fewer than 50 have complete profiles. High signup rate but low engagement after Day 1. The activation rate is below 50%.',
    fix: 'Redesign the onboarding flow so that completing location and style preferences feels like unlocking personalized recommendations, not filling in a form.',
    fixSource: 'Pinterest\'s early onboarding was built around getting users to create their first board within 60 seconds of signup.',
    decisions: [
      {
        decision: 'Decide whether to introduce user collections and social features now.',
        framework: 'Pinterest introduced boards as the core retention mechanic before any other features.',
        signal: 'If Day-7 return rate is below 25%, introduce collections immediately.',
      },
      {
        decision: 'Decide which content format drives highest user acquisition.',
        framework: 'Tattoo meaning queries are high volume/cheap. Explaining symbolism serves the "Cultural Enthusiast" persona.',
        signal: 'Post 10 "meaning" vs 10 "style" focused pieces. Double down on the winner after 2 weeks.',
      },
      {
        decision: 'Decide how to build the geographic demand database from signups.',
        framework: 'Every user with a style/location profile is worth 10 anonymous visitors. The demand database is the B2B product.',
        signal: 'If < 50% profiles completed, frame data capture as personalization during onboarding.',
      },
    ],
    investor: 'NOT READY for institutional capital. Angel conversations are possible if the demand database story is compelling.',
    investorStatus: 'amber',
    warning: 'Do not optimize for total user count at the expense of profile completion rate. 200 users with complete profiles is dramatically more valuable than 1,000 users with empty profiles.',
    warningSource: 'The B2B Trojan Horse strategy — the demand database is the asset.',
    currentValuation: '$100,000 to $500,000. Still pre-revenue but with demonstrated user engagement and a growing demand database.',
    valuationUnlock: '500 complete active user profiles in the launch city with Day-7 return rate above 25% unlocks angel credibility.',
    accuracyNote: 'CONSERVATIVE END. Targets calibrated against Y Combinator\'s documented 5% to 7% weekly growth benchmark.',
  },
  {
    id: 'pmf-hunt',
    name: 'Product-market fit — proving consumer retention',
    year: 'Month 3–6',
    subtitle: 'The demand database only has value if the consumers keep coming back. Prove retention before Phase 2.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Day-30 retention rate — target above 20%',
      reason: 'Retention is the only proof that product-market fit exists. Without it, any capital spent on acquisition pours into a leaking bucket.',
      source: 'Lean Analytics, Alistair Croll — retention is the single most predictive metric of long-term marketplace success.',
    },
    targets: [
      { label: 'Visitors', value: '2,500 to 3,500', isEstimate: true },
      { label: 'Registered users', value: '400 to 600', isEstimate: true },
      { label: 'MAU', value: '250 to 400', isEstimate: true },
      { label: 'Artist profiles', value: '0', isEstimate: false },
      { label: 'Designs saved', value: '1,500 to 2,500', isEstimate: true },
      { label: 'Waitlist', value: '300 to 500', isEstimate: true },
      { label: 'Revenue', value: '$0 to $500 MRR', isEstimate: true },
      { label: 'Team', value: 'solo founder', isEstimate: false },
    ],
    success: 'Day-30 retention curve flattens above 20% for 2 consecutive cohorts. 500+ complete active profiles in the launch city. At least 50 users saved 10+ designs.',
    failure: 'Day-30 retention trending to zero. The platform is a novelty. Revenue attempts failed to convert users to paid.',
    fix: 'Stop all acquisition. Conduct 20 exit interviews with churned users by messaging them directly. Ask: what would have made you come back?',
    fixSource: 'Paul Graham, Do Things That Don\'t Scale — talk to every churned user personally.',
    decisions: [
      {
        decision: 'Decide when to introduce the first paid feature.',
        framework: 'Charge before you think you are ready. Even $5 proves genuine intent.',
        signal: 'If 10+ users are emailing themselves saved designs, charge $9.99 for a formatted consultation brief.',
      },
      {
        decision: 'Decide whether the demand database is dense enough to begin Phase 2.',
        framework: 'Requires minimum viable demand density: 100+ active users with complete profiles in target city.',
        signal: 'If city-specific active profile count is above 200, begin preparing the Phase 2 pitch deck.',
      },
      {
        decision: 'Decide the Phase 2 artist targeting criteria.',
        framework: 'Match documented artist style against your demand data. Target specialists in your top most-saved styles.',
        signal: 'Match top 10 saved styles against city artists. The highest match is your outreach priority.',
      },
    ],
    investor: 'APPROACHING Pre-Seed readiness. Do not approach investors until Day-30 retention is above 20% for at least 2 consecutive cohorts.',
    investorStatus: 'amber',
    warning: 'Slow early growth in a niche market is normal. The signal to pivot is zero retention — not slow growth.',
    warningSource: 'Pinterest founding story — early months felt completely stalled before word of mouth compounded.',
    currentValuation: '$500,000 to $2,000,000. Consumer app with retention above 20% and a growing demand database.',
    valuationUnlock: 'Day-30 retention above 20% for 3 monthly cohorts plus 500 profiles unlocks Pre-Seed conversations.',
        accuracyNote: 'CONSERVATIVE TO REALISTIC. Targets are honest; bootstrapped marketplaces take 12-18 months to reach first $1k MRR.',
  },
  {
    id: 'growth-stage',
    name: 'Growth — executing the B2B Trojan Horse',
    year: 'Month 6–12',
    subtitle: 'The demand database is the weapon. Use it to acquire artists. Then use artists to acquire more users.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Artist conversion rate',
      reason: 'This is the moment the flywheel either starts or does not. If artists join at above 50% conversion the demand data is compelling.',
      source: 'The B2B Trojan Horse strategy — the demand pitch conversion rate is the leading indicator of marketplace liquidity.',
    },
    targets: [
      { label: 'Visitors', value: '10,000 to 15,000', isEstimate: true },
      { label: 'Users', value: '2,000 to 3,000', isEstimate: true },
      { label: 'MAU', value: '1,200 to 2,000', isEstimate: true },
      { label: 'Artist profiles', value: '20 to 40', isEstimate: false },
      { label: 'Designs saved', value: '8,000 to 12,000', isEstimate: true },
      { label: 'Waitlist', value: '3,000 to 5,000', isEstimate: true },
      { label: 'Revenue', value: '$2,000 to $5,000 MRR', isEstimate: true },
      { label: 'Team', value: 'solo founder + contractors', isEstimate: false },
    ],
    success: '20+ artists onboarded through the B2B Trojan Horse demand pitch. 10+ artists have received their first client inquiry. Booking liquidity above 30% in the launch city.',
    failure: 'Artists join but receive zero inquiries. Demand data was not as actionable as the pitch suggested. Users and artists are on the platform but not connecting.',
    fix: 'Manually facilitate the first 20 matches. Identify users with the highest save counts who match onboarded artists and introduce them.',
    fixSource: 'Airbnb manually photographed properties before automating. Manual processes reveal what the algorithm needs to replicate.',
    decisions: [
      {
        decision: 'Decide the artist CRM feature set for initial release.',
        framework: 'Solve the admin nightmare: standardized intake, calendar sessions, and deposits via Stripe.',
        signal: 'Only build more features when requested by 5+ artists.',
      },
      {
        decision: 'Decide the commission and deposit fee structure.',
        framework: 'Start at 15% platform fee on deposit + Stripe fees. Lock this in before Month 12.',
        signal: 'If artists accept without negotiation, you may be leaving money on the table. > 20% pushback means it is too high.',
      },
      {
        decision: 'Decide whether to approach Pre-Seed investors now.',
        framework: 'Need demand database + transactions + retention proof points.',
        signal: 'Ready if MRR growing AND 20+ transactions AND D30 retention > 20% AND 1000+ complete profiles.',
      },
    ],
    investor: 'YES for Pre-Seed angel conversations if all four unlock conditions are met. SAFE instrument at $1M to $2M cap is appropriate.',
    investorStatus: 'green',
    warning: 'Do not approach institutional VC at $2k MRR. They will reject you and you burn the 12-month relationship.',
    warningSource: 'YC application criteria — revenue growth rate matters more than absolute revenue level.',
    currentValuation: '$1,000,000 to $3,000,000. First revenue, first artist supply, first transactions being facilitated.',
    valuationUnlock: '$5,000 MRR growing 15%+ MoM AND 20+ active artists AND Day-30 retention above 20%.',
    accuracyNote: 'REALISTIC. Previous target of $10,000 MRR was not supported by data. $2,000 to $5,000 MRR is achieveable.',
  },
  {
    id: 'scale-y2',
    name: 'Scale — becoming the Shopify for tattoos',
    year: 'Year 2',
    subtitle: 'Capture the transaction flow. The artist CRM becomes the operating system. Revenue compounds.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Net revenue retention from artist subscriptions — target above 100%',
      reason: 'NRR above 100% means existing artists generate more revenue each month without acquiring new ones.',
      source: 'Bessemer Centaur framework — NRR above 100% is the signal of a platform becoming infrastructure.',
    },
    targets: [
      { label: 'Visitors', value: '15,000 to 25,000', isEstimate: true },
      { label: 'Users', value: '8,000 to 12,000', isEstimate: true },
      { label: 'MAU', value: '4,000 to 7,000', isEstimate: true },
      { label: 'Artists', value: '500 to 800', isEstimate: true },
      { label: 'Designs saved', value: '40,000 to 70,000', isEstimate: true },
      { label: 'Waitlist', value: '15,000 to 25,000', isEstimate: true },
      { label: 'Revenue', value: '$300,000 to $500,000 ARR', isEstimate: true },
      { label: 'Team', value: '3 to 5 full-time', isEstimate: false },
    ],
    success: '$500,000 ARR with positive unit economics. LTV:CAC above 3:1. Artist monthly churn below 5%. Expanding into second city.',
    failure: 'Artists join but churn after first month because demand pitch did not deliver. Commission is growing but SaaS is flat.',
    fix: 'Pause geographic expansion. Fix the core inquiry-to-booking conversion rate before scaling.',
    fixSource: 'Homejoy failure pattern — initial traction followed by zero retention.',
    decisions: [
      {
        decision: 'Decide when to introduce the Artist SaaS subscription tier.',
        framework: 'Stripe playbook: payment infrastructure first, SaaS on top.',
        signal: 'If 100+ artists processed 3+ bookings without churning, survey them for paid features.',
      },
      {
        decision: 'Decide Series A timing and investor story.',
        framework: 'Median valuation $52.5M. Lead with the GMV growth story.',
        signal: 'Ready if $1M ARR AND 15%+ growth AND NRR > 100% AND LTV:CAC > 3:1.',
      },
      {
        decision: 'Decide geographic expansion sequence.',
        framework: 'Trojan Horse repeats in every city. Build consumer demand database for City 2 before artist outreach.',
        signal: 'Expand when City 1 liquidity > 40% and City 2 demand database has 200+ complete profiles.',
      },
    ],
    investor: 'YES for Seed round. Target marketplace-focused Seed investors. NOT ready for Series A.',
    investorStatus: 'green',
    warning: 'Do not tell investors you are Series A ready at $300k ARR. The bar has risen significantly since 2021.',
    warningSource: 'Colin Gardiner Marketplace Fundraising 2025 — higher traction bar at every stage.',
    currentValuation: '$1,500,000 to $4,000,000. First meaningful recurring revenue with artist subscription model proven.',
    valuationUnlock: '$500,000 ARR AND NRR above 100% AND artist monthly churn below 5% AND supply density in 2 cities.',
    accuracyNote: 'IMPORTANT CORRECTION. Previous target was $1M ARR and Series A trigger. Corrected target is $300k-$500k ARR.',
  },
  {
    id: 'expansion-y3',
    name: 'Expansion — replicating the playbook internationally',
    year: 'Year 3',
    subtitle: 'The Trojan Horse strategy works in every city. Australia is the first international market.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Market-specific booking liquidity per city',
      reason: 'A single global liquidity number hides local failures. Track each city independently.',
      source: 'Sharetribe marketplace research — local liquidity is the North Star metric.',
    },
    targets: [
      { label: 'Visitors', value: '50,000 to 100,000', isEstimate: true },
      { label: 'Users', value: '25,000 to 40,000', isEstimate: true },
      { label: 'MAU', value: '12,000 to 20,000', isEstimate: true },
      { label: 'Artist profiles', value: '1,500 to 2,500', isEstimate: true },
      { label: 'Designs saved', value: '150,000 to 300,000', isEstimate: true },
      { label: 'Waitlist', value: '50,000 to 80,000', isEstimate: true },
      { label: 'Revenue', value: '$1,500,000 to $2,500,000 ARR', isEstimate: true },
      { label: 'Team', value: '15 to 25', isEstimate: false },
    ],
    success: '$2M ARR growing 10%+ MoM. Australian market launched with consumer demand built in Sydney first.',
    failure: 'Australian launch attempted by approaching artists before consumer demand. Artists joined an empty platform.',
    fix: 'Retreat to core markets. Shut down AU artist onboarding. Rebuild AU consumer demand database to 500 profiles in Sydney.',
    fixSource: 'DoorDash geographic expansion — fix the model in one city before expanding to the next.',
    decisions: [
      {
        decision: 'Decide city expansion sequence within Australia.',
        framework: 'DoorDash Palo Alto dominance: do not expand until local market share is dominant.',
        signal: 'Expand to City 2 only when 40%+ profile inquiries in City 1.',
      },
      {
        decision: 'Decide whether to raise Series B now.',
        framework: '2024 Series B median valuation $165.3M. Raise when international expansion is repeatable.',
        signal: 'Ready if ARR > $3M AND 12%+ growth AND AU metrics prove the playbook.',
      },
      {
        decision: 'Decide whether to begin building the financial products roadmap.',
        framework: 'Amazon PR/FAQ: write the press release for loans/insurance first. Do artists trust you with finances?',
        signal: 'If 500+ artists have 12+ months history, survey them on interest in business loans.',
      },
    ],
    investor: 'YES for Series A. Target marketplace-focused Series A funds. Present GMV story alongside ARR.',
    investorStatus: 'green',
    warning: 'Do not confuse user growth with marketplace liquidity. 5,000 users and zero bookings is a failure.',
    warningSource: 'Andrew Chen, The Cold Start Problem — geographic liquidity is the hardest problem.',
    currentValuation: '$5,000,000 to $12,000,000. ARR with multi-city traction and proven unit economics.',
    valuationUnlock: '$2,000,000 ARR AND LTV:CAC above 3:1 AND booking liquidity above 30% in 3 cities.',
    accuracyNote: 'IMPORTANT CORRECTION. Previous target was $5M ARR. Corrected target is $1.5M to $2.5M ARR.',
  },
  {
    id: 'platform-y4',
    name: 'Platform — the Shopify for tattoos is complete',
    year: 'Year 4–5',
    subtitle: 'Every artist depends on TattoosMap for operations. Now capture the financial layer.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Artist net revenue retention — target above 110%',
      reason: 'NRR above 110% means existing artists generate more revenue each year without acquiring new ones.',
      source: 'Bessemer Centaur framework — NRR above 110% in a marketplace business signals platform lock-in.',
    },
    targets: [
      { label: 'Visitors', value: '150,000 to 250,000', isEstimate: true },
      { label: 'Users', value: '40,000 to 60,000', isEstimate: true },
      { label: 'MAU', value: '15,000 to 25,000', isEstimate: true },
      { label: 'Artist profiles', value: '3,000 to 5,000', isEstimate: true },
      { label: 'Designs saved', value: '250,000 to 400,000', isEstimate: true },
      { label: 'Waitlist', value: '80,000 to 120,000', isEstimate: true },
      { label: 'Revenue', value: '$3,000,000 to $5,000,000 ARR', isEstimate: true },
      { label: 'Team', value: '30 to 50', isEstimate: false },
    ],
    success: '$4,000,000 ARR with NRR above 110% — artists are upgrading, not churning. First artist business loan pilot launched with 50 top artists.',
    failure: 'Artist business loan pilot experienced high default rates above 15%. Loan book damaged the platform balance sheet.',
    fix: 'Pause the loan book immediately. Spend 6 months building a better underwriting model using 24+ months of artist GMV data.',
    fixSource: 'Shopify Capital underwriting model — based on Shopify GMV consistency.',
    decisions: [
      {
        decision: 'Decide the structure of the artist business loan product.',
        framework: 'Repay through automatic percentage deductions from future platform payouts.',
        signal: 'Pilot with top 50 artists. Offer loans of 50% of trailing 6-month earnings.',
      },
      {
        decision: 'Decide Series C timing and prepare for growth equity.',
        framework: 'Rule of 40: revenue growth rate + profit margin > 40.',
        signal: 'Ready if ARR > $10M AND 40%+ YoY growth AND NRR > 110%.',
      },
      {
        decision: 'Decide whether to acquire niche tattoo supply companies.',
        framework: 'Vertical integration: own the supply chain to increase margin and lock-in.',
        signal: 'If artists spend $500+/mo on supplies, launch supply chain product.',
      },
    ],
    investor: 'YES for Series B. Present with Rule of 40 score and NRR above 110%.',
    investorStatus: 'green',
    warning: 'Do not tell Series B investors financial products will be a major driver if the loan pilot has not completed.',
    warningSource: 'CB Insights marketplace failure analysis.',
    currentValuation: '$15,000,000 to $35,000,000. $3M to $5M ARR with strong NRR and multi-region presence.',
    valuationUnlock: '$5,000,000 ARR AND NRR above 110% AND Rule of 40 above 40 AND loan pilot default below 5%.',
    accuracyNote: 'IMPORTANT CORRECTION. Previous target was $10M-$20M ARR. Corrected target is $3,000,000 to $5,000,000 ARR.',
  },
  {
    id: 'dominance-y6',
    name: 'Dominance — the global OS for body art',
    year: 'Year 6–7',
    subtitle: 'Financial products, supply chain, and insurance complete the ecosystem. No artist can leave.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'LTV:CAC ratio — target above 4:1',
      reason: 'At $15,000,000 to $25,000,000 ARR, LTV:CAC is the primary signal of capital efficiency at scale.',
      source: 'Samaipata Marketplace Metrics Cheat Sheet — 3:1 is the documented minimum.',
    },
    targets: [
      { label: 'Visitors', value: '400,000 to 700,000', isEstimate: true },
      { label: 'Users', value: '120,000 to 200,000', isEstimate: true },
      { label: 'MAU', value: '50,000 to 80,000', isEstimate: true },
      { label: 'Artist profiles', value: '8,000 to 12,000', isEstimate: true },
      { label: 'Designs saved', value: '800,000 to 1,500,000', isEstimate: true },
      { label: 'Waitlist', value: '250,000 to 400,000', isEstimate: true },
      { label: 'Revenue', value: '$15,000,000 to $25,000,000 ARR', isEstimate: true },
      { label: 'Team', value: '100 to 150', isEstimate: false },
    ],
    success: '$20,000,000 ARR with LTV:CAC above 4:1. Revenue growing without proportional increase in marketing spend.',
    failure: 'Revenue growth slowing while marketing spend increases. LTV:CAC compressing below 3:1.',
    fix: 'Stop all paid acquisition for 90 days. Measure what organic growth rate looks like without paid support.',
    fixSource: 'Dropbox stopped paid acquisition in 2010 and rebuilt on the referral program — documented 3,900% growth.',
    decisions: [
      {
        decision: 'Decide whether to prepare for IPO or remain private.',
        framework: 'Requires 3 yrs revenue growth > 30% AND positive EBITDA.',
        signal: 'Compare public market multiples against strategic buyouts.',
      },
      {
        decision: 'Decide APAC expansion sequence.',
        framework: 'Korea and Japan have high adoption and deregulating markets. Build consumer demand database there first.',
        signal: 'If AU exceeds $3M ARR, begin Seoul/Tokyo demand campaigns.',
      },
      {
        decision: 'Decide whether to launch TattoosMap Pro (Enterprise).',
        framework: 'Shopify Plus model for studio chains with 5+ profiles.',
        signal: 'Sign first studio chain to an enterprise contract.',
      },
    ],
    investor: 'YES for Series C and private equity. Pre-IPO is NOT yet appropriate.',
    investorStatus: 'green',
    warning: 'Do not file for IPO at $25M ARR. Public markets require $100M+ ARR and a path to profitability.',
    warningSource: 'Etsy, Airbnb, and Lyft S-1 filings — all filed with $100M+ in trailing revenue.',
    currentValuation: '$60,000,000 to $120,000,000. $15M to $25M ARR with strong unit economics and international presence.',
    valuationUnlock: '$25,000,000 ARR AND LTV:CAC above 4:1 AND 3 years growth above 30% AND positive EBITDA.',
    accuracyNote: 'IMPORTANT CORRECTION. Previous target was $50M-$80M ARR. Corrected target is $15,000,000 to $25,000,000 ARR.',
  },
  {
    id: 'billion-target',
    name: 'Billion $ Target — definitive infrastructure',
    year: 'Year 8–10',
    subtitle: 'Consolidating the global infrastructure for a billion dollar exit.',
    oneMetric: {
      label: 'The one metric to obsess over',
      name: 'Enterprise value to revenue multiple',
      reason: 'At $50M to $80M ARR the multiple determines whether the platform is worth $300M or $800M.',
      source: 'SaaStr and SaaS Capital documented multiple determinants — NRR is the single highest-correlation variable.',
    },
    targets: [
      { label: 'Visitors', value: '1,500,000 to 2,500,000', isEstimate: true },
      { label: 'Users', value: '450,000 to 750,000', isEstimate: true },
      { label: 'MAU', value: '180,000 to 300,000', isEstimate: true },
      { label: 'Artist profiles', value: '25,000 to 40,000', isEstimate: true },
      { label: 'Designs saved', value: '3,000,000 to 5,000,000', isEstimate: true },
      { label: 'Waitlist', value: '800,000 to 1,500,000', isEstimate: true },
      { label: 'Revenue', value: '$50,000,000 to $80,000,000 ARR', isEstimate: true },
      { label: 'Team', value: '250 to 400', isEstimate: false },
    ],
    success: '$65,000,000 ARR with NRR above 120% and financial products contributing 15%+ of total revenue.',
    failure: 'Stalling at $30,000,000 ARR in Year 8 without successfully scaling APAC.',
    fix: 'Execute M&A to acquire regional APAC platforms with existing artist supply density.',
    fixSource: 'Airbnb acquired local competitors in Germany and Russia rather than competing from scratch.',
    decisions: [
      {
        decision: 'Decide exit strategy — IPO vs Acquisition.',
        framework: 'If strategic acquirer values platform above public multiple, take it. otherwise IPO.',
        signal: 'Compare public market multiples against strategic buyouts.',
      },
      {
        decision: 'Decide whether to expand into adjacent creative markets.',
        framework: 'Piercing and permanent makeup face identical discovery and trust problems.',
        signal: 'Do not enter adjacencies before core tattoo market hits $50M ARR.',
      },
      {
        decision: 'Decide M&A strategy for APAC market consolidation.',
        framework: 'Acquire for supply density and local market knowledge, not technology.',
        signal: 'Target platforms with 1000+ active artists in Japan/Korea.',
      },
    ],
    investor: 'YES for Pre-IPO or strategic acquisition. IPO requires $100M+ ARR with positive EBITDA.',
    investorStatus: 'green',
    warning: 'Do not succumb to organizational bloat. 400+ employees bury instincts. maintain PR/FAQ discipline.',
    warningSource: 'Amazon culture post-mortems',
    currentValuation: '$200,000,000 to $600,000,000. $50M to $80M ARR with strong NRR and multiple revenue streams.',
    valuationUnlock: '$80,000,000 ARR AND NRR above 125% AND financial products contributing above 15% AND positive EBITDA.',
    accuracyNote: 'MOST IMPORTANT CORRECTION. Original $250M ARR target for 2036 was not supported. Corrected target is $50M-$80M ARR.',
  },
];

const AHA_MOMENTS = [
  { name: 'Facebook', value: '7 friends in 10 days', source: 'Chamath Palihapitiya 2013' },
  { name: 'Twitter', value: '30 follows', source: 'Early growth team' },
  { name: 'Slack', value: '2000 messages', source: '93% retention' },
  { name: 'Dropbox', value: '1 file in 1 folder', source: 'Retention predictor' },
  { name: 'TattoosMap Client', value: '5 designs saved', source: 'HYPOTHESIS' },
  { name: 'TattoosMap Artist', value: '3 inquiries in 14 days', source: 'HYPOTHESIS' },
];

const INVESTOR_DATA = [
  { name: 'Pre-Seed', value: 'Median $16.3M post-money', source: 'Carta 2025' },
  { name: 'Seed Dilution', value: '15.6% average dilution', source: 'Colin Gardiner 2025' },
  { name: 'Series A', value: '$52.5M median valuation', source: 'Colin Gardiner 2025' },
  { name: 'Series B', value: '$165.3M median pre-money', source: 'Colin Gardiner 2025' },
  { name: 'LTV:CAC', value: '3:1 floor, 10:1 exceptional', source: 'Fabrice Grinda' },
  { name: 'Audit Ready', value: 'D1 source tracking required', source: 'Best Practices' },
];

const FAILURE_DATA = [
  { name: 'Homejoy', value: 'Failed from zero retention', source: 'CB Insights' },
  { name: 'Beepi', value: 'Failed from scaled broken model', source: 'CB Insights' },
  { name: 'Market Need', value: '42% of startups fail from no need', source: 'CB Insights' },
  { name: 'Clone Factories', value: '20% fail from clone competition', source: 'CB Insights' },
  { name: 'Pieter Levels', value: '$132k MRR via public building', source: 'Positive Case' },
  { name: 'Zapier', value: 'Avoided traffic cliff via data injection', source: 'Success Case' },
];

const SEO_PLAYBOOK = [
  { name: 'Programmatic', value: 'Style + City + Spec segments', source: 'TattoosMap Core' },
  { name: 'Data Injection', value: 'Inject pricing/availability', source: 'Zapier Playbook' },
  { name: 'Pinterest', value: '2:3 ratio, 1000x1500px images', source: 'Visual Blueprint' },
  { name: 'AI Overviews', value: '61% reduction in informational CTR', source: 'Search Engine Land' },
  { name: 'GEO Citations', value: '+35% CTR in AI responses', source: '2025 Research' },
  { name: 'Maintenance', value: '< 5 hours/week via automation', source: 'Operational Efficiency' },
];

/**
 * COMPONENTS
 */
function MetricCard({ label, value, isEstimate }: { label: string; value: string; isEstimate: boolean }) {
  return (
    <div className="border border-black p-4 flex flex-col justify-between h-full bg-white">
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
        {isEstimate && (
          <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-1 uppercase font-bold">ESTIMATE</span>
        )}
      </div>
      <div className="font-mono text-xl font-black leading-none">{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-xs uppercase font-black text-gray-400 mb-4">{children}</h3>;
}

/**
 * DASHBOARD PAGE
 */
function SnapshotTable({ currentPhase, targetPhase, isCurrent }: { currentPhase: any; targetPhase: any; isCurrent: boolean }) {
  const findValue = (phase: any, label: string) => phase.targets.find((t: any) => t.label.includes(label))?.value || '---';

  return (
    <div className={cn(
      "border-4 border-black bg-white overflow-hidden mb-16 transition-all",
      isCurrent ? "shadow-[16px_16px_0px_0px_rgba(226,75,74,1)] border-[#E24B4A]" : "shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
    )}>
      <div className={cn("p-4 font-mono text-[10px] uppercase font-black tracking-widest flex justify-between", isCurrent ? "bg-[#E24B4A] text-white" : "bg-black text-white")}>
        <span>Strategic Snapshot: Internal Benchmarking</span>
        <span className="opacity-50">Classified // Tactical Manual</span>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-4 border-black font-mono text-[9px] uppercase font-black text-gray-400">
            <th className="p-4 border-r-4 border-black">Metric</th>
            <th className="p-4 border-r-4 border-black bg-gray-50">Active View ({currentPhase.year})</th>
            <th className="p-4 text-white bg-black tracking-tighter italic">The Honest $1B Path (Year 10)</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          {[
            { label: 'Revenue (ARR)', key: 'Revenue' },
            { label: 'MAU', key: 'MAU' },
            { label: 'Artist Supply', key: 'Artist' },
            { label: 'Valuation Range', key: 'Valuation' },
          ].map((m, i) => (
            <tr key={i} className="border-b-2 border-black last:border-0 hover:bg-gray-50 transition-colors">
              <td className="p-4 font-black uppercase border-r-4 border-black">{m.label}</td>
              <td className="p-4 font-bold border-r-4 border-black bg-gray-50/50">
                {m.key === 'Valuation' ? currentPhase.currentValuation : findValue(currentPhase, m.key)}
              </td>
              <td className="p-4 font-black bg-black/5">
                {m.key === 'Valuation' ? targetPhase.currentValuation : findValue(targetPhase, m.key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * DASHBOARD PAGE
 */
export default function MagicTool() {
  const [launchDate, setLaunchDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [lastCheckins, setLastCheckins] = useState<any[]>([]);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [status, setStatus] = useState('on_track');
  const [notes, setNotes] = useState('');
  const [metrics, setMetrics] = useState({
    visitors: '',
    users: '',
    mau: '',
    artists: '',
    revenue: '',
    saves: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setIsLoading(true);
    try {
      const { data: configData } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'launch_date')
        .single();
      
      let effectiveDate = configData?.value;

      // DEMO FALLBACK: If no database date found, use today as default
      if (!effectiveDate) {
        console.warn('No launch_date found in platform_config. Using demo fallback.');
        effectiveDate = new Date().toISOString();
      }

      setLaunchDate(effectiveDate as string);
      const monthsDiff = getMonthsDiff(new Date(effectiveDate as string), new Date());
      let detected = 0;
      if (monthsDiff < 1) detected = 0;
      else if (monthsDiff < 3) detected = 1;
      else if (monthsDiff < 6) detected = 2;
      else if (monthsDiff < 12) detected = 3;
      else if (monthsDiff < 24) detected = 4;
      else if (monthsDiff < 36) detected = 5;
      else if (monthsDiff < 60) detected = 6;
      else if (monthsDiff < 84) detected = 7;
      else detected = 8;
      setActiveTab(detected);

      const { data: checkins } = await supabase
        .from('founder_checkins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (checkins) setLastCheckins(checkins);

    } catch (err) {
      console.error('Data error:', err);
      setActiveTab(0);
    } finally {
      setIsLoading(false);
    }
  }

  function getMonthsDiff(start: Date, end: Date) {
    if (!start || !end) return 0;
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }

  async function handleCheckin() {
    if (!launchDate) return;
    const launch = new Date(launchDate);
    const now = new Date();
    const weekNumber = Math.ceil((now.getTime() - launch.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const { error } = await supabase.from('founder_checkins').insert({
      week_number: weekNumber,
      year: now.getFullYear(),
      date: now.toISOString().split('T')[0],
      notes,
      status,
      metrics_input: metrics,
    });

    if (!error) {
      setNotes('');
      setMetrics({ visitors: '', users: '', mau: '', artists: '', revenue: '', saves: '' });
      fetchInitialData();
    }
  }

  if (isLoading) return <div className="p-10 font-mono tracking-tighter">ENCRYPTED SYSTEM STARTUP...</div>;

  if (!launchDate) return (
    <div className="p-20 font-mono max-w-2xl">
      <h1 className="text-4xl font-black mb-8">SYSTEM HALTED</h1>
      <p className="mb-10 text-gray-500">Insert [launch_date] into platform_config to initialize the 10-year manual.</p>
      <button onClick={() => window.location.reload()} className="border-4 border-black px-10 py-4 font-black hover:bg-black hover:text-white transition-all uppercase">REBOOT SYSTEM</button>
    </div>
  );

  const phase = PHASES[activeTab];
  const monthsSinceLaunch = getMonthsDiff(new Date(launchDate), new Date());
  
  const isCurrentPhase = (index: number) => {
    let current = 0;
    if (monthsSinceLaunch < 1) current = 0;
    else if (monthsSinceLaunch < 3) current = 1;
    else if (monthsSinceLaunch < 6) current = 2;
    else if (monthsSinceLaunch < 12) current = 3;
    else if (monthsSinceLaunch < 24) current = 4;
    else if (monthsSinceLaunch < 36) current = 5;
    else if (monthsSinceLaunch < 60) current = 6;
    else if (monthsSinceLaunch < 84) current = 7;
    else current = 8;
    return index === current;
  };

  return (
    <main className="bg-[#F5F5F3] min-h-screen text-black selection:bg-[#E24B4A] selection:text-white pb-40">
      
      {/* OS HEADER */}
      <header className="border-b-4 border-black p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <div className="font-mono text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mb-2">Magic Tool v1.0</div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">Solo Founder OS</h1>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] font-black uppercase text-gray-400">Tactical Session: Active</div>
          <div className="font-mono text-sm font-bold">AUTH: hotosevents@gmail.com</div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6 md:p-10">

        {/* LAYER 1: ROADMAP NAVIGATOR */}
        <section className="mb-32">
          
          <SnapshotTable 
            currentPhase={phase} 
            targetPhase={PHASES[8]} 
            isCurrent={isCurrentPhase(activeTab)}
          />

          <div className="flex overflow-x-auto no-scrollbar border-4 border-black mb-16">
            {PHASES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-8 py-5 font-mono text-xs uppercase font-black whitespace-nowrap border-r-4 border-black last:border-r-0 transition-all",
                  activeTab === i ? "bg-black text-white" : "hover:bg-gray-200"
                )}
              >
                {p.year}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Phase Content */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">{phase.name}</h2>
                    {isCurrentPhase(activeTab) && (
                      <span className="bg-black text-white font-mono text-[10px] px-3 py-1 font-black uppercase tracking-widest">CURRENT PHASE</span>
                    )}
                  </div>
                  <p className="font-mono text-sm uppercase font-bold text-gray-400 max-w-2xl leading-none">{phase.subtitle}</p>
                </div>
              </div>

              {/* ONE METRIC (The Red Card) */}
              <div className="bg-[#E24B4A] text-white p-12 lg:p-16 border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-xs uppercase font-black tracking-widest mb-6 block opacity-70">{phase.oneMetric.label}</span>
                <div className="text-5xl lg:text-7xl font-black uppercase leading-none mb-10 tracking-tighter">{phase.oneMetric.name}</div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-10 border-t border-white/20">
                  <p className="text-lg font-bold leading-tight max-w-md">{phase.oneMetric.reason}</p>
                  <span className="font-mono text-[10px] uppercase font-black opacity-50 shrink-0 tracking-widest">SOURCE: {phase.oneMetric.source}</span>
                </div>
              </div>

              {/* Targets */}
              <div className="space-y-6">
                <SectionLabel>Phase Targets</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-black gap-[1px] border border-black">
                  {phase.targets.map((t, i) => (
                    <MetricCard key={i} label={t.label} value={t.value} isEstimate={t.isEstimate} />
                  ))}
                </div>
              </div>

              {/* Status row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-4 border-black p-8 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500"></div>
                    <SectionLabel>Success Condition</SectionLabel>
                  </div>
                  <p className="font-bold text-sm leading-relaxed uppercase">{phase.success}</p>
                </div>
                <div className="border-4 border-black p-8 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <SectionLabel>Failure Condition</SectionLabel>
                  </div>
                  <p className="font-bold text-sm leading-relaxed uppercase">{phase.failure}</p>
                </div>
              </div>

              {/* Corrective Box */}
              <div className="border-4 border-black p-10 bg-white">
                <SectionLabel>If behind target — execute this</SectionLabel>
                <div className="text-3xl font-black uppercase mb-6 leading-none tracking-tighter">{phase.fix}</div>
                <div className="font-mono text-[10px] uppercase font-black bg-black text-white px-2 py-1 inline-block">SOURCE: {phase.fixSource}</div>
              </div>

              {/* Key Decisions */}
              <div className="space-y-6">
                <SectionLabel>Strategic Decisions</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 bg-black gap-[1px] border border-black">
                  {phase.decisions.map((d, i) => (
                    <div key={i} className="bg-white p-6 flex flex-col justify-between h-full">
                      <div className="mb-6">
                        <span className="font-mono text-[9px] uppercase font-black text-gray-400 block mb-2">Decision</span>
                        <p className="text-sm font-black uppercase leading-tight">{d.decision}</p>
                      </div>
                      <div className="mb-6">
                        <span className="font-mono text-[9px] uppercase font-black text-gray-400 block mb-2">Framework</span>
                        <p className="text-[10px] font-bold text-gray-500 leading-tight uppercase">{d.framework}</p>
                      </div>
                      <div className="bg-gray-50 p-3 border border-black/5">
                        <span className="font-mono text-[9px] uppercase font-black text-gray-400 block mb-1">Signal</span>
                        <p className="text-[10px] font-black uppercase leading-tight">{d.signal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              {/* Investor Badge */}
              <div className="border-4 border-black p-8 bg-white">
                <SectionLabel>Investor Status</SectionLabel>
                <div className={cn(
                  "inline-block font-mono text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 mb-6 border border-black",
                  phase.investorStatus === 'amber' ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-900"
                )}>
                  {phase.investorStatus === 'amber' ? 'DISCONNECTED' : 'READY'}
                </div>
                <p className="text-sm font-black leading-tight uppercase">{phase.investor}</p>
              </div>

              {/* Warning Box */}
              <div className="border-4 border-black p-8 bg-black text-white">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-brand-red animate-pulse"></div>
                  <SectionLabel>Red Line Warning</SectionLabel>
                </div>
                <div className="text-xl font-black uppercase leading-tight mb-6 tracking-tight">{phase.warning}</div>
                <div className="font-mono text-[10px] uppercase font-black text-gray-500 shrink-0">SOURCE: {phase.warningSource}</div>
              </div>

              {/* VALUATION CARD */}
              <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <SectionLabel>Current Valuation Range</SectionLabel>
                <div className="text-3xl font-black uppercase mb-4 tracking-tighter leading-none">{phase.currentValuation}</div>
                <div className="pt-6 border-t border-black/10">
                  <div className="font-mono text-[9px] uppercase font-black text-gray-400 mb-2">Next Unlock Milestone</div>
                  <p className="text-xs font-black uppercase leading-tight">{phase.valuationUnlock}</p>
                </div>
              </div>

              {/* ACCURACY NOTE */}
              <div className="border-4 border-black p-6 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-amber-500"></div>
                  <SectionLabel>Validation Audit</SectionLabel>
                </div>
                <p className="text-[10px] font-bold uppercase leading-tight text-amber-900">{phase.accuracyNote}</p>
              </div>

              {/* SPECIAL YEAR 10 CARD */}
              {phase.id === 'billion-target' && (
                <div className="border-4 border-[#E24B4A] p-8 bg-white shadow-[12px_12px_0px_0px_rgba(226,75,74,1)]">
                  <div className="bg-[#E24B4A] text-white font-mono text-[10px] px-3 py-1 font-black uppercase mb-6 inline-block">The Honest $1B Path</div>
                  <p className="text-sm font-black uppercase leading-relaxed italic">"Success is not $250M ARR or failure. Success is building definitive industry infrastructure that makes the entire $9.25B body art market more liquid, safe, and professional."</p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* LAYER 2: WEEKLY CHECK-IN */}
        <section className="mb-32 pt-32 border-t-8 border-black">
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-16">Weekly Log</h2>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
            <div className="xl:col-span-7 bg-white border-4 border-black p-10">
              <div className="grid grid-cols-2 gap-10 mb-10">
                <div>
                  <label className="font-mono text-[10px] uppercase font-black block mb-3 text-gray-400">Tactical Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-4 border-black p-4 font-black uppercase transition-colors focus:bg-black focus:text-white outline-none"
                  >
                    <option value="on_track">On Track</option>
                    <option value="behind">Behind</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase font-black block mb-3 text-gray-400">Mission Week</label>
                  <div className="bg-gray-100 border-4 border-black border-opacity-10 p-4 font-black text-gray-400">
                    W{launchDate ? Math.ceil((new Date().getTime() - new Date(launchDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) : '--'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {[
                  { key: 'visitors', label: 'Visitors' },
                  { key: 'users', label: 'Users' },
                  { key: 'mau', label: 'MAU' },
                  { key: 'artists', label: 'Artists' },
                  { key: 'revenue', label: 'Revenue' },
                  { key: 'saves', label: 'Saves' },
                ].map((m) => (
                  <div key={m.key}>
                    <label className="font-mono text-[9px] uppercase font-black block mb-2 text-gray-400">{m.label}</label>
                    <input 
                      type="text" 
                      value={(metrics as any)[m.key]}
                      onChange={(e) => setMetrics({ ...metrics, [m.key]: e.target.value })}
                      className="w-full border-2 border-black p-3 font-black outline-none focus:bg-gray-50"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-10">
                <label className="font-mono text-[10px] uppercase font-black block mb-3 text-gray-400">Tactical Intelligence & Observations</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="w-full border-2 border-black p-4 font-bold outline-none resize-none focus:bg-gray-50"
                />
              </div>

              <button 
                onClick={handleCheckin}
                className="w-full bg-black text-white font-black py-6 uppercase tracking-widest text-xl hover:bg-brand-red transition-all"
              >
                Sync Weekly Log
              </button>
            </div>

            <div className="xl:col-span-5 h-[700px] flex flex-col">
              <SectionLabel>Historical Sessions</SectionLabel>
              <div className="overflow-y-auto border-4 border-black bg-white flex-1 no-scrollbar">
                {lastCheckins.length === 0 ? (
                  <div className="p-20 text-center font-black text-xs text-gray-300">SYSTEM LOGS EMPTY</div>
                ) : (
                  lastCheckins.map((c) => (
                    <div key={c.id} className="border-b-4 border-black last:border-0 p-6 flex items-start gap-6 hover:bg-gray-50 transition-colors">
                      <div className="bg-black text-white font-black text-xs px-3 py-1 shrink-0">W{c.week_number}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-[10px] font-black text-gray-400">{c.date}</span>
                          <span className={cn(
                            "font-mono text-[10px] font-black uppercase",
                            c.status === 'on_track' ? "text-green-600" : c.status === 'behind' ? "text-amber-600" : "text-red-600"
                          )}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-bold text-xs uppercase leading-snug line-clamp-3">{c.notes || '---'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 3: INTELLIGENCE LIBRARY */}
        <section className="pb-32">
          <button 
            onClick={() => setIsIntelligenceOpen(!isIntelligenceOpen)}
            className="w-full border-t-8 border-b-8 border-black py-10 flex justify-between items-center hover:bg-black group transition-colors"
          >
            <h2 className={cn(
              "text-6xl font-black uppercase tracking-tighter group-hover:text-white",
              isIntelligenceOpen && "text-black"
            )}>Growth Intel</h2>
            <span className={cn("text-5xl font-black group-hover:text-white", isIntelligenceOpen && "rotate-180")}>↓</span>
          </button>

          {isIntelligenceOpen && (
            <div className="mt-16 border-4 border-black bg-white">
              <div className="grid grid-cols-2 lg:grid-cols-4 bg-black gap-1 p-1">
                {['AHA MOMENTS', 'INVESTOR DATA', 'FAILURE LAB', 'SEO PLAYBOOK'].map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setIntelligenceTab(i)}
                    className={cn(
                      "py-5 font-black uppercase text-xs tracking-widest transition-all",
                      intelligenceTab === i ? "bg-white text-black" : "bg-black text-white hover:bg-white/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-10 lg:p-16">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                  {(intelligenceTab === 0 ? AHA_MOMENTS : 
                    intelligenceTab === 1 ? INVESTOR_DATA : 
                    intelligenceTab === 2 ? FAILURE_DATA : SEO_PLAYBOOK).map((item, i) => (
                    <div key={i} className="border-4 border-black p-8 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl font-black uppercase leading-none tracking-tighter">{item.name}</span>
                          {item.source === 'HYPOTHESIS' && (
                            <span className="bg-black text-white font-mono text-[9px] px-2 py-1 font-black">HYPOTHESIS</span>
                          )}
                        </div>
                        <p className="text-sm font-bold leading-tight uppercase">{item.value}</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-black text-gray-400">SOURCE: {item.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
