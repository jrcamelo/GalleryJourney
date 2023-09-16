import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async getDistinctServerIds(): Promise<string[]> {
    const images = await this.prisma.image.findMany({
      select: { serverId: true },
      distinct: ['serverId']
    });
    return images.map((image) => image.serverId);
  }

  async getDistinctUserIds(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      select: { userId: true },
      distinct: ['userId']
    });
    return users.map((user) => user.userId);
  }

  async getGalleryItems(where: any, orderBy: any, skip: number, take: number): Promise<any> {
    return await this.prisma.image.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: { select: { username: true, avatar: true } },
        // TODO: Add logged in Favorite
      }
    });
  }

  async getFavoritesItems(where: any, orderBy: any, skip: number, take: number): Promise<any> {
    return await this.prisma.image.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: { select: { username: true, avatar: true } },
        favorites: false,
      }
    });
  }

  async getGalleryCount(where: any): Promise<number> {
    return await this.prisma.image.count({ where });
  }

  async getFavoritesCount(where: any): Promise<number> {
    return await this.prisma.image.count({ where });
  }

  async getGalleryUsersCounts(where: any): Promise<any[]> {
    const images = await this.prisma.image.findMany({
      where,
      select: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        },
      }
    });

    const userCounts = images.reduce((acc, image) => {
      const user = image.user;
      if (!acc[user.username]) {
        acc[user.username] = {
          item_count: 0,
          username: user.username,
          avatar: user.avatar
        };
      }
      acc[user.username].item_count += 1;
      return acc;
    }, {} as { [key: string]: { item_count: number, username: string, avatar: string | null } });

    const userCountsAsList = Object.values(userCounts);
    return userCountsAsList.sort((a, b) => b.item_count - a.item_count);
  }

  async getFavoritesUsersCounts(where: any): Promise<any[]> {
    // TODO: Couldn't solve this with Prisma, groupBy does not work for this
    const favorites = await this.prisma.image.findMany({
      where,
      select: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    });

    const userCounts = favorites.reduce((acc, fav) => {
      const user = fav.user;
      if (!acc[user.username]) {
        acc[user.username] = {
          item_count: 0,
          username: user.username,
          avatar: user.avatar
        };
      }
      acc[user.username].item_count += 1;
      return acc;
    }, {} as { [key: string]: { item_count: number, username: string, avatar: string | null } });

    return Object.values(userCounts).sort((a, b) => b.item_count - a.item_count);
  }
}

export default Database;