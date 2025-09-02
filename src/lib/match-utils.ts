/**
 * Utility functions for Match model normalization
 * Ensures userAId < userBId for consistent unique constraints
 */

export function normalizeMatchUsers(userId1: string, userId2: string) {
  // Sort user IDs to ensure consistent ordering
  const [userAId, userBId] = [userId1, userId2].sort()
  
  return {
    userAId,
    userBId,
  }
}

export function getMatchPartnerId(match: { userAId: string; userBId: string }, currentUserId: string) {
  return match.userAId === currentUserId ? match.userBId : match.userAId
}

export function isUserInMatch(match: { userAId: string; userBId: string }, userId: string) {
  return match.userAId === userId || match.userBId === userId
}
