const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const db = new PrismaClient()
async function main() {
  const adminEmail = 'admin@rtm.local', adminPass = 'admin123'
  const viewerEmail = 'viewer@rtm.local', viewerPass = 'viewer123'
  let admin = await db.user.findUnique({ where: { email: adminEmail } })
  if (admin) { admin = await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN', active: true, passwordHash: await bcrypt.hash(adminPass, 10) } }) }
  else { admin = await db.user.create({ data: { email: adminEmail, name: 'Admin', passwordHash: await bcrypt.hash(adminPass, 10), role: 'ADMIN' } }) }
  console.log(`Admin: ${adminEmail} / ${adminPass}`)
  let viewer = await db.user.findUnique({ where: { email: viewerEmail } })
  if (viewer) { viewer = await db.user.update({ where: { id: viewer.id }, data: { role: 'VIEWER', active: true, passwordHash: await bcrypt.hash(viewerPass, 10) } }) }
  else { viewer = await db.user.create({ data: { email: viewerEmail, name: 'Viewer', passwordHash: await bcrypt.hash(viewerPass, 10), role: 'VIEWER' } }) }
  console.log(`Viewer: ${viewerEmail} / ${viewerPass}`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
