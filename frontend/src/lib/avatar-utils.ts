/**
 * Utility functions for handling user avatars and images safely
 */

/**
 * Safely gets an avatar URL, returning null if the URL is empty or invalid
 * @param avatarUrl - The avatar URL to validate
 * @returns Valid URL string or null
 */
export function getSafeAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim() === '') {
    return null
  }
  
  // Basic URL validation
  try {
    // Check if it's a relative path or full URL
    if (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) {
      return avatarUrl.trim()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Gets user initials for display when no avatar is available
 * @param name - User's full name
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return 'U'
  }
  
  const words = name.trim().split(' ')
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  
  return name.charAt(0).toUpperCase() || 'U'
}

/**
 * Generates a placeholder avatar URL based on user name
 * @param name - User's name
 * @param size - Size of the avatar (default: 96)
 * @returns Placeholder avatar URL
 */
export function getPlaceholderAvatar(name: string | null | undefined, size: number = 96): string {
  const initials = getUserInitials(name)
  const colors = [
    '6366f1', // indigo
    '8b5cf6', // violet  
    'ec4899', // pink
    'ef4444', // red
    'f97316', // orange
    '84cc16', // lime
    '06b6d4', // cyan
    '3b82f6', // blue
  ]
  
  // Simple hash function to pick consistent color for a name
  let hash = 0
  const nameStr = name || 'User'
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colors.length
  const bgColor = colors[colorIndex]
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${bgColor}&color=ffffff&bold=true`
}
