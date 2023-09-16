import { PrismaClient } from '@prisma/client';

function buildGalleryWhere(serverId: string, query: any) {
  const where = { serverId }
  return buildWhere(where, query);
}

function buildFavoritesWhere(serverId: string, userId: string, query: any) {
  const where = {
    favorites: {
      some: {
        AND: [
          { userId },
          { serverId },
          { status: 1 }
        ]
      }
    }
  }
  return buildWhere(where, query);
}

function buildWhere(where: any, query: any): any {
  const { search, includeUser, excludeUser } = query;

  where = { ...where, ...handleSearchWhere(search) };
  where = { ...where, ...handleIncludeUserWhere(includeUser) };
  where = { ...where, ...handleExcludeUserWhere(excludeUser) };
  where = { ...where, ...handleChannelPreferences() };

  return where;
}

function handleSearchWhere(search?: string): any {
  if (!search) return {};

  return {
    prompt: {
      contains: search
    }
  };
}

function handleIncludeUserWhere(includeUser?: string): any {
  if (!includeUser) return {};

  const includedUsers = includeUser.split(',');
  return {
    user: {
      username: {
        in: includedUsers
      }
    },
  };
}

function handleExcludeUserWhere(excludeUser?: string): any {
  if (!excludeUser) return {};

  const excludedUsers = excludeUser.split(',');
  return {
    user: {
      username: {
        notIn: excludedUsers
      }
    },
  };
}

function handleChannelPreferences(): any {
  // TODO: Add an admin mode or logged in user mode to bypass this
  // TODO: This NOT overrides any other NOT in the where, be careful
  return {
    NOT: {
      channelPreference: {
        showInGallery: false
      }
    }
  };
}

export {
  buildGalleryWhere,
  buildFavoritesWhere
}