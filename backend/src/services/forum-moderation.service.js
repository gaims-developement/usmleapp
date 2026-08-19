import { prisma } from '../db/prisma.js'

// Medical Whitelist: legitimate medical terms and benign words containing suspicious substrings
const MEDICAL_WHITELIST = new Set([
  'stat', 'angina', 'anal', 'passage', 'titration', 'specimen', 'rectal', 'penile', 'vaginal',
  'pediatric', 'biopsy', 'cervix', 'scrotal', 'testicular', 'prostate', 'urethra', 'mass',
  'cyst', 'polyp', 'lesion', 'assessment', 'pass', 'class', 'glass', 'grass', 'brass',
  'compass', 'harass', 'embarrass', 'analysis', 'analytical', 'analyst', 'analyze',
  'suspect', 'suspects', 'suspicious', 'assistant', 'assistance', 'cum', 'cumulonimbus',
  'document', 'documented', 'documentation', 'faculty', 'facility', 'shitake', 'shih',
  'cocktail', 'peacock', 'hancock', 'bitcher', 'penal', 'penalize', 'penalties'
])

// Categorized abusive terms
const PROFANITY_DICTIONARY = {
  HIGH: [
    'nigger', 'nigga', 'faggot', 'fag', 'retard', 'kyi', 'chink', 'kike',
    'dyke', 'cunt', 'kill yourself', 'kys'
  ],
  MEDIUM: [
    'bitch', 'bastard', 'motherfucker', 'motherfucking', 'whore', 'slut',
    'asshole', 'dickhead', 'pussy', 'dipshit', 'jackass', 'bullshit', 'cockhead',
    'cocksucker', 'douchebag'
  ],
  LOW: [
    'fuck', 'fucking', 'fucked', 'fucker', 'fuckin', 'shit', 'shitting', 'shitty',
    'dick', 'cock', 'piss', 'bastard'
  ]
}

/**
 * Normalizes input text to catch leetspeak, spacing obfuscation, and repeated characters.
 * Example: "f.u.c.k" -> "fuck", "f***ing" -> "fucking", "f u c k" -> "fuck", "fuuuck" -> "fuck"
 */
function normalizeText(text) {
  if (!text) return ''

  let normalized = text.toLowerCase()

  // Replace common leetspeak characters
  normalized = normalized
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/7/g, 't')

  // Remove dots/dashes/spaces inside obfuscated words like f.u.c.k or f u c k
  normalized = normalized.replace(/\b([a-z])[\s._*-]+([a-z])[\s._*-]+([a-z])[\s._*-]+([a-z])\b/g, '$1$2$3$4')
  normalized = normalized.replace(/\b([a-z])[\s._*-]+([a-z])[\s._*-]+([a-z])\b/g, '$1$2$3')

  // Replace asterisk masks like f*** or f**k
  normalized = normalized.replace(/f[\*\.\-_]{2,3}k/g, 'fuck')
  normalized = normalized.replace(/f[\*\.\-_]{2,3}ing/g, 'fucking')
  normalized = normalized.replace(/b[\*\.\-_]{2,3}h/g, 'bitch')
  normalized = normalized.replace(/s[\*\.\-_]{2,3}t/g, 'shit')
  normalized = normalized.replace(/a[\*\.\-_]{2,3}hole/g, 'asshole')
  normalized = normalized.replace(/c[\*\.\-_]{2,3}t/g, 'cunt')

  // Collapse consecutive repeated characters (e.g. "fuuuuck" -> "fuck")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1')

  return normalized
}

/**
 * Moderates forum content against the abusive language dictionary and medical whitelist.
 */
export function moderateForumContent(text, _context = 'post') {
  if (!text || typeof text !== 'string') {
    return { isAbusive: false, severity: 'LOW', matchedTerms: [], action: 'ALLOW' }
  }

  const rawTextLower = text.toLowerCase()
  const normalizedText = normalizeText(text)

  const matchedTerms = new Set()
  let highestSeverity = null

  // Check each severity tier
  const tiers = ['HIGH', 'MEDIUM', 'LOW']
  for (const tier of tiers) {
    const terms = PROFANITY_DICTIONARY[tier]
    for (const term of terms) {
      // Check for whole word match in raw text or normalized text
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(rawTextLower) || regex.test(normalizedText)) {
        // Double check against medical whitelist if the term is a short word
        if (!MEDICAL_WHITELIST.has(term)) {
          matchedTerms.add(term)
          if (!highestSeverity) {
            highestSeverity = tier
          }
        }
      }
    }
  }

  if (matchedTerms.size === 0) {
    return { isAbusive: false, severity: 'LOW', matchedTerms: [], action: 'ALLOW' }
  }

  const matchedTermsArray = Array.from(matchedTerms)
  const action = highestSeverity === 'HIGH' || highestSeverity === 'MEDIUM' ? 'BLOCK' : 'BLOCK'

  return {
    isAbusive: true,
    severity: highestSeverity ?? 'LOW',
    matchedTerms: matchedTermsArray,
    action,
  }
}

/**
 * Checks ban status for a user. Auto-expires temporary bans if the ban period has elapsed.
 */
export async function checkUserBanStatus(userId) {
  if (!userId) return { isBanned: false }

  const modRecord = await prisma.forumUserModeration.findUnique({
    where: { userId },
  })

  if (!modRecord || !modRecord.isBanned) {
    return { isBanned: false, strikes: modRecord?.strikes ?? 0 }
  }

  // Check if ban has expired
  if (modRecord.banExpiresAt && new Date() >= new Date(modRecord.banExpiresAt)) {
    // Lift ban automatically
    await prisma.forumUserModeration.update({
      where: { userId },
      data: { isBanned: false, banExpiresAt: null },
    })

    await prisma.forumModerationAudit.create({
      data: {
        userId,
        action: 'AUTOMATIC_UNBAN',
        reason: 'Temporary ban expired automatically',
        severity: 'LOW',
      },
    })

    return { isBanned: false, strikes: modRecord.strikes }
  }

  return {
    isBanned: true,
    bannedAt: modRecord.bannedAt,
    banExpiresAt: modRecord.banExpiresAt,
    reason: modRecord.reason,
    strikes: modRecord.strikes,
  }
}

/**
 * Processes an abusive content submission by incrementing strikes, creating audit logs,
 * sending notifications, and applying temporary bans when strike 3 is reached.
 */
export async function processAbusiveSubmission({
  userId,
  text,
  context = 'post',
  matchedTerms = [],
  severity = 'LOW',
  relatedPostId = null,
  relatedCommentId = null,
}) {
  // Upsert user moderation record
  let modRecord = await prisma.forumUserModeration.findUnique({ where: { userId } })
  if (!modRecord) {
    modRecord = await prisma.forumUserModeration.create({
      data: { userId, strikes: 0 },
    })
  }

  const newStrikes = modRecord.strikes + 1
  const shouldBan = newStrikes >= 3

  let banExpiresAt = null
  if (shouldBan) {
    // 7-day temporary ban
    banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  // Update moderation record
  await prisma.forumUserModeration.update({
    where: { userId },
    data: {
      strikes: newStrikes,
      isBanned: shouldBan ? true : modRecord.isBanned,
      bannedAt: shouldBan ? new Date() : modRecord.bannedAt,
      banExpiresAt: shouldBan ? banExpiresAt : modRecord.banExpiresAt,
      reason: shouldBan
        ? 'Automated temporary ban due to repeated community guidelines violations'
        : modRecord.reason,
    },
  })

  // Create Moderation Audit record
  const auditAction = shouldBan ? 'AUTOMATIC_BAN' : 'AUTOMATIC_WARNING'
  const auditReason = `Abusive language detected in ${context} (${severity} severity): [${matchedTerms.join(', ')}]`

  await prisma.forumModerationAudit.create({
    data: {
      userId,
      action: auditAction,
      reason: auditReason,
      severity,
      matchedTerms,
      relatedPostId,
      relatedCommentId,
    },
  })

  // Send Notification based on strike count
  try {
    if (newStrikes === 1) {
      await prisma.notification.create({
        data: {
          userId,
          tone: 'WARNING',
          title: 'Community Guidelines Warning',
          body: 'Your recent forum activity was flagged for violating the IMG Prep community guidelines. Please review the community guidelines before posting again.',
          details: { type: 'FORUM_WARNING', strikeCount: 1, matchedTerms, severity },
        },
      })
    } else if (newStrikes === 2) {
      await prisma.notification.create({
        data: {
          userId,
          tone: 'WARNING',
          title: 'Second Community Guidelines Warning',
          body: 'Your forum activity has been flagged again for violating the IMG Prep community guidelines. Further violations may result in a temporary suspension of your forum access.',
          details: { type: 'FORUM_WARNING', strikeCount: 2, matchedTerms, severity },
        },
      })
    } else if (newStrikes >= 3) {
      await prisma.notification.create({
        data: {
          userId,
          tone: 'WARNING',
          title: 'Forum Access Temporarily Suspended',
          body: 'Your forum access has been temporarily suspended after repeated violations of the community guidelines. You can raise a support ticket to request a review of your suspension.',
          details: { type: 'FORUM_BAN', strikeCount: newStrikes, banExpiresAt, reason: auditReason },
        },
      })
    }
  } catch (err) {
    console.error('Failed to create moderation notification:', err)
  }

  return {
    strikes: newStrikes,
    isBanned: shouldBan,
    banExpiresAt,
  }
}
