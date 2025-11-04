-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "token_balance" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "tutorial_completed" BOOLEAN NOT NULL DEFAULT false,
    "task_board_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "composite_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "solution" JSONB,
    "token_reward" INTEGER NOT NULL,
    "difficulty" INTEGER,
    "estimated_time" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'available',
    "is_composite" BOOLEAN NOT NULL DEFAULT false,
    "is_tutorial" BOOLEAN NOT NULL DEFAULT false,
    "creator_id" UUID NOT NULL,
    "accepted_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composite_subtasks" (
    "id" UUID NOT NULL,
    "composite_task_id" UUID NOT NULL,
    "subtask_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composite_subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "task_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_submissions" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "submission" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "feedback" JSONB,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_creator_id_idx" ON "tasks"("creator_id");

-- CreateIndex
CREATE INDEX "tasks_accepted_by_id_idx" ON "tasks"("accepted_by_id");

-- CreateIndex
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");

-- CreateIndex
CREATE INDEX "composite_subtasks_composite_task_id_idx" ON "composite_subtasks"("composite_task_id");

-- CreateIndex
CREATE INDEX "composite_subtasks_subtask_id_idx" ON "composite_subtasks"("subtask_id");

-- CreateIndex
CREATE UNIQUE INDEX "composite_subtasks_composite_task_id_subtask_id_key" ON "composite_subtasks"("composite_task_id", "subtask_id");

-- CreateIndex
CREATE INDEX "token_transactions_user_id_idx" ON "token_transactions"("user_id");

-- CreateIndex
CREATE INDEX "token_transactions_created_at_idx" ON "token_transactions"("created_at");

-- CreateIndex
CREATE INDEX "task_submissions_task_id_idx" ON "task_submissions"("task_id");

-- CreateIndex
CREATE INDEX "task_submissions_user_id_idx" ON "task_submissions"("user_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_subtasks" ADD CONSTRAINT "composite_subtasks_composite_task_id_fkey" FOREIGN KEY ("composite_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_subtasks" ADD CONSTRAINT "composite_subtasks_subtask_id_fkey" FOREIGN KEY ("subtask_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
