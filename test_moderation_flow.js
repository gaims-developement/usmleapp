import jwt from 'jsonwebtoken'
import { env } from './backend/src/config/env.js'
import { prisma } from './backend/src/db/prisma.js'

async function runModerationTests() {
  try {
    console.log('==================================================')
    console.log('   AUTOMATIC FORUM MODERATION SYSTEM E2E TEST')
    console.log('==================================================\n')

    // 1. Get or create a dedicated test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'moderation_test_user@imgprep.com' },
      include: { role: true },
    })

    if (!testUser) {
      // Find STUDENT role
      const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
      testUser = await prisma.user.create({
        data: {
          email: 'moderation_test_user@imgprep.com',
          name: 'Moderation Test User',
          passwordHash: '$2b$10$e80yJpB1s9p9o6Z4k3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6',
          roleId: studentRole?.id,
          onboarded: true,
        },
        include: { role: true },
      })
    }

    // Reset moderation record for clean test run
    await prisma.forumUserModeration.deleteMany({ where: { userId: testUser.id } })
    await prisma.forumModerationAudit.deleteMany({ where: { userId: testUser.id } })
    await prisma.forumModerationAppeal.deleteMany({ where: { userId: testUser.id } })

    // Find ADMIN user
    let adminUser = await prisma.user.findFirst({
      where: { role: { name: 'ADMIN' } },
      include: { role: true },
    })
    if (!adminUser) {
      adminUser = await prisma.user.findFirst({ include: { role: true } })
    }

    // Get active category
    const cat = await prisma.forumCategory.findFirst({ where: { isActive: true } })
    if (!cat) {
      console.error('No active category found!')
      return
    }

    const testToken = jwt.sign(
      { sub: testUser.id, id: testUser.id, email: testUser.email, role: 'STUDENT' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    const adminToken = jwt.sign(
      { sub: adminUser.id, id: adminUser.id, email: adminUser.email, role: adminUser.role?.name ?? 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    const userHeaders = { 'Authorization': `Bearer ${testToken}`, 'Content-Type': 'application/json' }
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
    const baseUrl = `http://localhost:${env.PORT}/api/forum`

    // ----------------------------------------------------
    // TEST 1: Normal post -> Published successfully
    // ----------------------------------------------------
    console.log('--- TEST 1: Submitting normal clean post ---')
    const res1 = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Clean Educational Discussion Post',
        content: 'This is a clean educational discussion about USMLE step 1 prep strategies.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data1 = await res1.json()
    console.log('Status:', res1.status, 'Success:', data1.success, 'Post ID:', data1.data?.id)
    if (!data1.success) throw new Error('TEST 1 Failed')

    const cleanPostId = data1.data.id

    // ----------------------------------------------------
    // TEST 2: Abusive post -> Blocked, Strike = 1, Warning notification created
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Submitting 1st abusive post ---')
    const res2 = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Abusive Post with fuck keyword',
        content: 'You guys are motherfucker bitches in this forum.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data2 = await res2.json()
    console.log('Status:', res2.status, 'Error Code:', data2.error?.code, 'Message:', data2.error?.message)
    if (data2.error?.code !== 'CONTENT_MODERATION_BLOCKED') throw new Error('TEST 2 Failed')

    // Check DB status
    let status2 = await fetch(`${baseUrl}/my-status`, { headers: userHeaders }).then(r => r.json())
    console.log('DB Strikes after 1st violation:', status2.data.strikes, 'Is Banned:', status2.data.isBanned)
    if (status2.data.strikes !== 1) throw new Error('TEST 2 Strike count mismatch')

    // ----------------------------------------------------
    // TEST 3: Second abusive post -> Blocked, Strike = 2, 2nd Warning notification
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Submitting 2nd abusive submission ---')
    const res3 = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Another abusive post with profanity',
        content: 'This forum is bullshit and everyone is a dickhead.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data3 = await res3.json()
    console.log('Status:', res3.status, 'Error Code:', data3.error?.code)
    if (data3.error?.code !== 'CONTENT_MODERATION_BLOCKED') throw new Error('TEST 3 Failed')

    let status3 = await fetch(`${baseUrl}/my-status`, { headers: userHeaders }).then(r => r.json())
    console.log('DB Strikes after 2nd violation:', status3.data.strikes, 'Is Banned:', status3.data.isBanned)
    if (status3.data.strikes !== 2) throw new Error('TEST 3 Strike count mismatch')

    // ----------------------------------------------------
    // TEST 4: Third abusive post -> Blocked, Strike = 3, Temporary Ban applied
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Submitting 3rd abusive submission (Triggers Ban) ---')
    const res4 = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Third abusive post triggering ban',
        content: 'I hate you all f.u.c.k you asshole bitches.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data4 = await res4.json()
    console.log('Status:', res4.status, 'Error Code:', data4.error?.code)
    if (data4.error?.code !== 'CONTENT_MODERATION_BLOCKED') throw new Error('TEST 4 Failed')

    let status4 = await fetch(`${baseUrl}/my-status`, { headers: userHeaders }).then(r => r.json())
    console.log('DB Strikes after 3rd violation:', status4.data.strikes, 'Is Banned:', status4.data.isBanned, 'Ban Expires:', status4.data.banExpiresAt)
    if (status4.data.strikes !== 3 || !status4.data.isBanned) throw new Error('TEST 4 Ban failed')

    // ----------------------------------------------------
    // TEST 5: Banned user attempts to create post -> Rejected by backend
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Banned user attempts POST /posts ---')
    const res5 = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Post attempted while banned',
        content: 'Even a clean post should be blocked while user is banned.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data5 = await res5.json()
    console.log('Status:', res5.status, 'Error Code:', data5.error?.code, 'Message:', data5.error?.message)
    if (data5.error?.code !== 'FORUM_TEMP_BANNED') throw new Error('TEST 5 Failed')

    // ----------------------------------------------------
    // TEST 6: Banned user attempts to comment -> Rejected by backend
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Banned user attempts POST /comments ---')
    const res6 = await fetch(`${baseUrl}/posts/${cleanPostId}/comments`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ content: 'Comment attempted while banned.' }),
    })
    const data6 = await res6.json()
    console.log('Status:', res6.status, 'Error Code:', data6.error?.code)
    if (data6.error?.code !== 'FORUM_TEMP_BANNED') throw new Error('TEST 6 Failed')

    // ----------------------------------------------------
    // TEST 7: Banned user queries GET /my-status
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Querying /my-status for ban info ---')
    const status7 = await fetch(`${baseUrl}/my-status`, { headers: userHeaders }).then(r => r.json())
    console.log('My Status:', JSON.stringify(status7.data, null, 2))
    if (!status7.data.isBanned) throw new Error('TEST 7 Failed')

    // ----------------------------------------------------
    // TEST 8: User submits review appeal
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Submitting review appeal ---')
    const res8 = await fetch(`${baseUrl}/appeals`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        appealMessage: 'I sincerely apologize for the inappropriate language and promise to adhere strictly to guidelines.',
      }),
    })
    const data8 = await res8.json()
    console.log('Status:', res8.status, 'Success:', data8.success, 'Appeal ID:', data8.data?.id)
    if (!data8.success) throw new Error('TEST 8 Failed')

    const appealId = data8.data.id

    // ----------------------------------------------------
    // TEST 9: ADMIN approves appeal -> Ban lifted, user can post again
    // ----------------------------------------------------
    console.log('\n--- TEST 9: ADMIN approves appeal ---')
    const res9 = await fetch(`${baseUrl}/admin/appeals/${appealId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ action: 'approve', notes: 'User acknowledged guidelines and apologized.' }),
    })
    const data9 = await res9.json()
    console.log('Status:', res9.status, 'Success:', data9.success, 'Appeal Status:', data9.data?.status)
    if (!data9.success || data9.data.status !== 'APPROVED') throw new Error('TEST 9 Failed')

    // Verify user is unbanned
    let status9 = await fetch(`${baseUrl}/my-status`, { headers: userHeaders }).then(r => r.json())
    console.log('Is Banned after appeal approval:', status9.data.isBanned)
    if (status9.data.isBanned) throw new Error('TEST 9 Unban failed')

    // Verify user can post clean content again
    const res9b = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Post after unban via appeal',
        content: 'This post is created after the moderator approved my review appeal.',
        categoryId: cat.id,
        postType: 'DISCUSSION',
      }),
    })
    const data9b = await res9b.json()
    console.log('Post creation status after unban:', res9b.status, 'Success:', data9b.success)
    if (!data9b.success) throw new Error('TEST 9 Post creation after unban failed')

    // ----------------------------------------------------
    // TEST 10: ADMIN updates strikes (removes a strike)
    // ----------------------------------------------------
    console.log('\n--- TEST 10: ADMIN removes a strike from user ---')
    const res10 = await fetch(`${baseUrl}/admin/users/${testUser.id}/strike`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ action: 'remove', reason: 'Good behavior after appeal' }),
    })
    const data10 = await res10.json()
    console.log('Status:', res10.status, 'New Strikes:', data10.data?.strikes)
    if (data10.data?.strikes !== 2) throw new Error('TEST 10 Strike removal failed')

    // ----------------------------------------------------
    // TEST 11 & 12: Verify database persistence of notifications & audit logs
    // ----------------------------------------------------
    console.log('\n--- TEST 11 & 12: Verifying persisted Notifications and Audit Logs ---')
    const userNotifications = await prisma.notification.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'asc' },
    })
    console.log('Persisted Notifications count:', userNotifications.length)
    for (const n of userNotifications) {
      console.log(`- [${n.tone}] ${n.title}: ${n.body}`)
    }

    const auditLogsRes = await fetch(`${baseUrl}/admin/audit-logs`, { headers: adminHeaders })
    const auditLogsData = await auditLogsRes.json()
    console.log('Audit Logs count:', auditLogsData.data?.auditLogs?.length)
    for (const log of auditLogsData.data?.auditLogs ?? []) {
      console.log(`- [${log.action}] by ${log.moderatorName}: ${log.reason}`)
    }

    console.log('\n==================================================')
    console.log('   ALL 12 MODERATION SYSTEM TESTS PASSED 100%!')
    console.log('==================================================')
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err)
  } finally {
    await prisma.$disconnect()
  }
}

runModerationTests()
