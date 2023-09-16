-- CreateTable
CREATE TABLE "images" (
    "message_id" TEXT NOT NULL PRIMARY KEY,
    "server_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt" TEXT,
    "response_id" TEXT,
    "url" TEXT,
    "url1" TEXT,
    "url2" TEXT,
    "url3" TEXT,
    "url4" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "favorites_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "images_user_id_server_id_fkey" FOREIGN KEY ("user_id", "server_id") REFERENCES "users" ("user_id", "server_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "images_server_id_channel_id_fkey" FOREIGN KEY ("server_id", "channel_id") REFERENCES "channel_preferences" ("server_id", "channel_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "image_count" INTEGER NOT NULL DEFAULT 1,
    "username" TEXT NOT NULL,
    "avatar" TEXT,

    PRIMARY KEY ("user_id", "server_id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_user_id_server_id_fkey" FOREIGN KEY ("user_id", "server_id") REFERENCES "users" ("user_id", "server_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "favorites_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "images" ("message_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "channel_preferences" (
    "server_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "show_in_gallery" BOOLEAN DEFAULT true,

    PRIMARY KEY ("server_id", "channel_id")
);

-- CreateIndex
CREATE INDEX "images_server_id_channel_id_idx" ON "images"("server_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_message_id_user_id_server_id_key" ON "images"("message_id", "user_id", "server_id");

-- CreateIndex
CREATE INDEX "users_server_id_idx" ON "users"("server_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_message_id_user_id_server_id_key" ON "favorites"("message_id", "user_id", "server_id");
