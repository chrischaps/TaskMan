// Prisma Seed Script
// Seeds database with tutorial tasks and system user
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import { generateTutorialTasks } from '../src/services/taskGenerator';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // =========================================================================
  // Create System User for Tutorial Tasks
  // =========================================================================

  console.log('Creating system user...');

  // Check if system user already exists
  let systemUser = await prisma.user.findUnique({
    where: { username: 'system' },
  });

  if (!systemUser) {
    const hashedPassword = await hashPassword('system-password-not-used');

    systemUser = await prisma.user.create({
      data: {
        username: 'system',
        email: 'system@taskman.local',
        passwordHash: hashedPassword,
        tokenBalance: 0,
        level: 1,
        tasksCompleted: 0,
        tutorialCompleted: false,
        taskBoardUnlocked: false,
        compositeUnlocked: false,
      },
    });

    console.log('✅ System user created:', systemUser.username);
  } else {
    console.log('✅ System user already exists:', systemUser.username);
  }

  // =========================================================================
  // Generate and Create Tutorial Tasks
  // =========================================================================

  console.log('\nGenerating tutorial tasks...');

  const tutorialTasks = generateTutorialTasks();
  console.log(`Generated ${tutorialTasks.length} tutorial tasks\n`);

  // Delete existing tutorial tasks to avoid duplicates on re-seed
  const deletedCount = await prisma.task.deleteMany({
    where: { isTutorial: true },
  });
  console.log(`Deleted ${deletedCount.count} existing tutorial tasks`);

  // Create tutorial tasks
  for (let i = 0; i < tutorialTasks.length; i++) {
    const task = tutorialTasks[i];

    const createdTask = await prisma.task.create({
      data: {
        type: task.type,
        category: 'tutorial', // Tutorial category
        title: task.title,
        description: task.description,
        data: task.data,
        solution: task.solution,
        tokenReward: task.tokenReward,
        difficulty: task.difficulty,
        estimatedTime: task.estimatedTime,
        status: 'available',
        isComposite: false,
        isTutorial: true,
        creatorId: systemUser.id,
      },
    });

    console.log(
      `✅ [${i + 1}/${tutorialTasks.length}] Created: ${createdTask.type} - "${createdTask.title}" (${createdTask.tokenReward} tokens)`
    );
  }

  // =========================================================================
  // Summary
  // =========================================================================

  console.log('\n📊 Seed Summary:');
  console.log('─'.repeat(50));

  const totalTasks = await prisma.task.count();
  const tutorialCount = await prisma.task.count({ where: { isTutorial: true } });
  const userCount = await prisma.user.count();

  console.log(`Total Users: ${userCount}`);
  console.log(`Total Tasks: ${totalTasks}`);
  console.log(`Tutorial Tasks: ${tutorialCount}`);
  console.log('─'.repeat(50));

  console.log('\n✨ Database seeding complete!\n');
  console.log('Tutorial tasks available:');
  console.log('  - Sort List');
  console.log('  - Color Match');
  console.log('  - Arithmetic');
  console.log('  - Group Separation');
  console.log('  - Defragmentation');
  console.log('\nNew users must complete 5 tutorial tasks to unlock the task board.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
