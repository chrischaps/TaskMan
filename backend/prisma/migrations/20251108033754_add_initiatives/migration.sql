-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "initiative_id" UUID;

-- CreateTable
CREATE TABLE "initiatives" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "creator_id" UUID NOT NULL,
    "project_id" UUID,
    "token_reward" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "initiatives_creator_id_idx" ON "initiatives"("creator_id");

-- CreateIndex
CREATE INDEX "initiatives_project_id_idx" ON "initiatives"("project_id");

-- CreateIndex
CREATE INDEX "initiatives_status_idx" ON "initiatives"("status");

-- CreateIndex
CREATE INDEX "tasks_initiative_id_idx" ON "tasks"("initiative_id");

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
