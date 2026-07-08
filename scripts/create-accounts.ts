/**
 * Create admin and viewer accounts.
 *
 * Usage:
 *   bun run scripts/create-accounts.ts
 *
 * Or with custom credentials:
 *   bun run scripts/create-accounts.ts --admin-email boss@firm.com --admin-pass secretpass --viewer-email analyst@firm.com --viewer-pass viewpass
 */
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Parse args
  const args = process.argv.slice(2)
  const getArg = (flag: string, fallback: string) => {
    const idx = args.indexOf(flag)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback
  }

  const adminEmail = getArg('--admin-email', 'admin@rtm.local')
  const adminPass = getArg('--admin-pass', 'admin123')
  const adminName = getArg('--admin-name', 'Admin')

  const viewerEmail = getArg('--viewer-email', 'viewer@rtm.local')
  const viewerPass = getArg('--viewer-pass', 'viewer123')
  const viewerName = getArg('--viewer-name', 'Viewer')

  console.log('─'.repeat(60))
  console.log('  RTM Annotator — Account Creation Script')
  console.log('─'.repeat(60))

  // ─── Admin account ──────────────────────────────────────────────────
  console.log('\n1. Creating Admin account...')
  let admin = await db.user.findUnique({ where: { email: adminEmail } })
  if (admin) {
    // Update existing user to admin
    admin = await db.user.update({
      where: { id: admin.id },
      data: { role: 'ADMIN', active: true, passwordHash: await bcrypt.hash(adminPass, 10) },
    })
    console.log(`   ✓ Updated existing user → ADMIN`)
  } else {
    admin = await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: await bcrypt.hash(adminPass, 10),
        role: 'ADMIN',
      },
    })
    console.log(`   ✓ Created new ADMIN user`)
  }
  console.log(`     Email: ${admin.email}`)
  console.log(`     Name:  ${admin.name}`)
  console.log(`     Role:  ${admin.role}`)
  console.log(`     Pass:  ${adminPass}`)

  // ─── Viewer account ────────────────────────────────────────────────
  console.log('\n2. Creating Viewer account...')
  let viewer = await db.user.findUnique({ where: { email: viewerEmail } })
  if (viewer) {
    viewer = await db.user.update({
      where: { id: viewer.id },
      data: { role: 'VIEWER', active: true, passwordHash: await bcrypt.hash(viewerPass, 10) },
    })
    console.log(`   ✓ Updated existing user → VIEWER`)
  } else {
    viewer = await db.user.create({
      data: {
        email: viewerEmail,
        name: viewerName,
        passwordHash: await bcrypt.hash(viewerPass, 10),
        role: 'VIEWER',
      },
    })
    console.log(`   ✓ Created new VIEWER user`)
  }
  console.log(`     Email: ${viewer.email}`)
  console.log(`     Name:  ${viewer.name}`)
  console.log(`     Role:  ${viewer.role}`)
  console.log(`     Pass:  ${viewerPass}`)

  // ─── Summary ───────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60))
  console.log('  All accounts created successfully!')
  console.log('─'.repeat(60))
  console.log('\nLogin credentials:')
  console.log(`  Admin:  ${adminEmail} / ${adminPass}`)
  console.log(`  Viewer: ${viewerEmail} / ${viewerPass}`)
  console.log('\nYou can change these by running:')
  console.log('  bun run scripts/create-accounts.ts \\')
  console.log('    --admin-email you@firm.com \\')
  console.log('    --admin-pass yourpass \\')
  console.log('    --viewer-email viewer@firm.com \\')
  console.log('    --viewer-pass viewerpass')
  console.log('')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
