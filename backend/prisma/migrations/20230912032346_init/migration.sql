-- CreateTable
CREATE TABLE "Image" (
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
    CONSTRAINT "Image_user_id_server_id_fkey" FOREIGN KEY ("user_id", "server_id") REFERENCES "User" ("user_id", "server_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Image_server_id_channel_id_fkey" FOREIGN KEY ("server_id", "channel_id") REFERENCES "ChannelPreference" ("server_id", "channel_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "image_count" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT NOT NULL,
    "avatar" TEXT,

    PRIMARY KEY ("user_id", "server_id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "user_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "server_id", "message_id"),
    CONSTRAINT "Favorite_message_id_user_id_server_id_fkey" FOREIGN KEY ("message_id", "user_id", "server_id") REFERENCES "Image" ("message_id", "user_id", "server_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_user_id_server_id_fkey" FOREIGN KEY ("user_id", "server_id") REFERENCES "User" ("user_id", "server_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelPreference" (
    "server_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "show_in_gallery" BOOLEAN DEFAULT true,

    PRIMARY KEY ("server_id", "channel_id")
);

-- CreateIndex
CREATE INDEX "Image_server_id_channel_id_idx" ON "Image"("server_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "Image_message_id_user_id_server_id_key" ON "Image"("message_id", "user_id", "server_id");

-- CreateIndex
CREATE INDEX "User_server_id_idx" ON "User"("server_id");
