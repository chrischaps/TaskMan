// Prisma Seed Script
// Seeds database with tutorial tasks and system user
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import { generateTutorialTasks, generateTaskByType } from '../src/services/taskGenerator';
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
  // Create Test Users
  // =========================================================================

  console.log('\nCreating test users...');

  const testUsers = [
    { username: 'alice', email: 'alice@test.com', password: 'password123' },
    { username: 'bob', email: 'bob@test.com', password: 'password123' },
    { username: 'charlie', email: 'charlie@test.com', password: 'password123' },
  ];

  for (const testUserData of testUsers) {
    let testUser = await prisma.user.findUnique({
      where: { username: testUserData.username },
    });

    if (!testUser) {
      const hashedPassword = await hashPassword(testUserData.password);

      testUser = await prisma.user.create({
        data: {
          username: testUserData.username,
          email: testUserData.email,
          passwordHash: hashedPassword,
          tokenBalance: 100, // Start with some tokens for testing
          level: 1,
          tasksCompleted: 0,
          tutorialCompleted: false,
          taskBoardUnlocked: true, // Unlock task board for easier testing
          compositeUnlocked: false,
        },
      });

      console.log(`✅ Test user created: ${testUser.username}`);
    } else {
      console.log(`✅ Test user already exists: ${testUser.username}`);
    }
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
  // Generate and Create Additional Test Tasks
  // =========================================================================

  console.log('\nGenerating additional test tasks for easier testing...');

  const taskTypes = ['sort_list', 'color_match', 'arithmetic', 'group_separation', 'defragmentation'];
  const tasksPerType = 3;
  let testTaskCount = 0;

  // Delete existing non-tutorial tasks to avoid duplicates
  const deletedTestTasks = await prisma.task.deleteMany({
    where: { isTutorial: false },
  });
  console.log(`Deleted ${deletedTestTasks.count} existing test tasks\n`);

  for (const taskType of taskTypes) {
    console.log(`Creating ${tasksPerType} tasks of type: ${taskType}`);

    for (let i = 0; i < tasksPerType; i++) {
      // Generate tasks with varying difficulties (1, 2, 3)
      const difficulty = ((i % 3) + 1) as 1 | 2 | 3;
      const task = generateTaskByType(taskType, { difficulty, isTutorial: false });

      const createdTask = await prisma.task.create({
        data: {
          type: task.type,
          category: 'test',
          title: task.title,
          description: task.description,
          data: task.data,
          solution: task.solution,
          tokenReward: task.tokenReward,
          difficulty: task.difficulty,
          estimatedTime: task.estimatedTime,
          status: 'available',
          isComposite: false,
          isTutorial: false,
          creatorId: systemUser.id,
        },
      });

      testTaskCount++;
      console.log(
        `  ✅ Created: ${createdTask.type} (Difficulty ${createdTask.difficulty}) - "${createdTask.title}"`
      );
    }
  }

  console.log(`\n✅ Created ${testTaskCount} test tasks total`);

  // =========================================================================
  // Summary
  // =========================================================================

  console.log('\n📊 Seed Summary:');
  console.log('─'.repeat(50));

  const totalTasks = await prisma.task.count();
  const tutorialCount = await prisma.task.count({ where: { isTutorial: true } });
  const testTasksCount = await prisma.task.count({ where: { isTutorial: false } });
  const userCount = await prisma.user.count();

  console.log(`Total Users: ${userCount}`);
  console.log(`Total Tasks: ${totalTasks}`);
  console.log(`Tutorial Tasks: ${tutorialCount}`);
  console.log(`Test Tasks: ${testTasksCount} (3 per type × 5 types)`);
  console.log('─'.repeat(50));

  console.log('\n✨ Database seeding complete!\n');
  console.log('Tutorial tasks available:');
  console.log('  - Sort List');
  console.log('  - Color Match');
  console.log('  - Arithmetic');
  console.log('  - Group Separation');
  console.log('  - Defragmentation');
  console.log('\n🔑 Test User Credentials:');
  console.log('─'.repeat(50));
  console.log('Username: alice   | Email: alice@test.com   | Password: password123');
  console.log('Username: bob     | Email: bob@test.com     | Password: password123');
  console.log('Username: charlie | Email: charlie@test.com | Password: password123');
  console.log('─'.repeat(50));
  console.log('All test users start with:');
  console.log('  - 100 tokens');
  console.log('  - Task board unlocked (for easier testing)');
  console.log('  - Level 1\n');
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
