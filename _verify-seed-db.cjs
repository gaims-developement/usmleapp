const mysql = require('mysql2/promise')

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'usmle_user',
    password: 'YourStrongPassword123!',
    database: 'usmle_app_seedtest',
  })
  const q = async (sql, args) => (await c.query(sql, args))[0]

  console.log('roles:', JSON.stringify(await q('SELECT name FROM Role ORDER BY name')))
  console.log('permissions:', (await q('SELECT COUNT(*) c FROM Permission'))[0].c)
  console.log('rolePermissions:', (await q('SELECT COUNT(*) c FROM RolePermission'))[0].c)

  const users = await q(
    'SELECT u.email, u.isDemo, r.name role FROM User u LEFT JOIN Role r ON r.id = u.roleId ORDER BY u.email',
  )
  console.log('users:')
  for (const u of users) console.log('  ', u.email, 'isDemo=' + u.isDemo, 'role=' + u.role)

  const p = await q(
    'SELECT u.email, ' +
      '(SELECT COUNT(*) FROM StudentProfile sp WHERE sp.userId = u.id) student, ' +
      '(SELECT COUNT(*) FROM HospitalProfile hp WHERE hp.userId = u.id) hospital, ' +
      '(SELECT COUNT(*) FROM DoctorProfile dp WHERE dp.userId = u.id) doctor, ' +
      '(SELECT COUNT(*) FROM ReviewerProfile rp WHERE rp.userId = u.id) reviewer ' +
      'FROM User u',
  )
  console.log('profiles:')
  for (const x of p)
    console.log(
      '  ',
      x.email,
      'student=' + x.student,
      'hospital=' + x.hospital,
      'doctor=' + x.doctor,
      'reviewer=' + x.reviewer,
    )

  console.log('departments:', (await q('SELECT COUNT(*) c FROM Department'))[0].c)
  console.log('hospitalCodes:', (await q('SELECT code FROM HospitalRegistrationCode'))[0].code)
  console.log('invitationCodes:', (await q('SELECT code FROM ReviewerInvitationCode'))[0].code)
  console.log('programs:', (await q('SELECT COUNT(*) c FROM Program'))[0].c)

  const apps = await q(
    'SELECT a.id, a.status, COALESCE(dr.email, "-") doctor, COALESCE(rv.email, "-") reviewer ' +
      'FROM Application a ' +
      'LEFT JOIN DoctorProfile dp ON dp.id = a.doctorProfileId ' +
      'LEFT JOIN User dr ON dr.id = dp.userId ' +
      'LEFT JOIN ReviewerProfile rvp ON rvp.id = a.reviewerProfileId ' +
      'LEFT JOIN User rv ON rv.id = rvp.userId ' +
      'ORDER BY a.id',
  )
  console.log('applications:')
  for (const a of apps)
    console.log('  ', a.id, a.status, 'doctor=' + a.doctor, 'reviewer=' + a.reviewer)

  console.log('payments:', (await q('SELECT COUNT(*) c FROM Payment'))[0].c, '(all PAID:', (await q("SELECT COUNT(*) c FROM Payment WHERE status='PAID'"))[0].c + ')')
  console.log('studentDocuments:', (await q('SELECT COUNT(*) c FROM StudentDocument'))[0].c)
  console.log('notifications:', (await q('SELECT COUNT(*) c FROM Notification'))[0].c)
  console.log('calendarEvents:', (await q('SELECT COUNT(*) c FROM CalendarEvent'))[0].c)
  console.log('reviews:', (await q('SELECT COUNT(*) c FROM ApplicationReview'))[0].c)

  // Doctor hospital/department association
  const doc = await q(
    'SELECT u.email, hp.name hospital, d.name department, dp.specialty ' +
      'FROM DoctorProfile dp ' +
      'JOIN User u ON u.id = dp.userId ' +
      'LEFT JOIN HospitalProfile hp ON hp.id = dp.hospitalId ' +
      'LEFT JOIN Department d ON d.id = dp.departmentId',
  )
  console.log('doctor association:')
  for (const d of doc) console.log('  ', d.email, 'hospital=' + d.hospital, 'department=' + d.department, 'specialty=' + d.specialty)

  // Program ownership isolation sanity
  const progOwner = await q(
    'SELECT p.id, u.isDemo ownerIsDemo, p.status FROM Program p JOIN HospitalProfile hp ON hp.id = p.hospitalId JOIN User u ON u.id = hp.userId',
  )
  console.log('program owners (all demo):', progOwner.every(x => x.ownerIsDemo === 1 && x.status === 'ACTIVE'))

  await c.end()
}

main().catch(e => {
  console.error('ERR', e.message)
  process.exit(1)
})
