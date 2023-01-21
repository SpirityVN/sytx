-- CreateTable
CREATE TABLE "lucky_wheel_reward" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "lucky_wheel_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lucky_wheel_reward_id_key" ON "lucky_wheel_reward"("id");
