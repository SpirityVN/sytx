-- CreateTable
CREATE TABLE "network_support" (
    "id" SERIAL NOT NULL,
    "contract_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rpc_url" TEXT NOT NULL,
    "rpc_url_backup" TEXT,
    "chain_id" INTEGER NOT NULL,
    "currency_symbol" TEXT,
    "block_explorer_url" TEXT,

    CONSTRAINT "network_support_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "network_support_id_key" ON "network_support"("id");

-- CreateIndex
CREATE UNIQUE INDEX "network_support_contract_id_key" ON "network_support"("contract_id");

-- AddForeignKey
ALTER TABLE "network_support" ADD CONSTRAINT "network_support_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
