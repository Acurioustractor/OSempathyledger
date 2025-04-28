import { AirtableAttachment } from "./airtable";
import CacheService from "./CacheService";

// External image service for avatars
const AVATAR_SERVICE = "https://ui-avatars.com/api";

/**
 * Extracts image URL from Airtable attachment
 * @param attachments Array of Airtable attachments
 * @returns URL of the first attachment or null if none exists
 */
export const getImageUrl = (attachments?: AirtableAttachment[]): string | null => {
  console.log("getImageUrl called with attachments:", attachments);
  
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    console.log("getImageUrl: No valid attachments array found.");
    return null;
  }

  const attachment = attachments[0];
  console.log("getImageUrl: First attachment object:", attachment);
  
  if (!attachment) {
    console.log("getImageUrl: First attachment is null or undefined.");
    return null;
  }
  
  // Handle different possible Airtable attachment structures
  
  // Case 1: If attachment is just a string URL (less common for file fields)
  if (typeof attachment === 'string') {
    console.log("getImageUrl: Attachment is a string URL:", attachment);
    return attachment;
  }
  
  // Case 2: If attachment is an object (most common)
  if (typeof attachment === 'object') {
    // Standard Airtable structure: Check direct `url` first
    if (attachment.url && typeof attachment.url === 'string') {
      console.log("getImageUrl: Found URL directly in attachment.url:", attachment.url);
      return attachment.url;
    }
    
    // Check `thumbnails` structure
    if (attachment.thumbnails) {
      console.log("getImageUrl: Found thumbnails object:", attachment.thumbnails);
      // Prefer large or full thumbnails if available
      if (attachment.thumbnails.large?.url) {
        console.log("getImageUrl: Found URL in thumbnails.large.url:", attachment.thumbnails.large.url);
        return attachment.thumbnails.large.url;
      }
      if (attachment.thumbnails.full?.url) {
        console.log("getImageUrl: Found URL in thumbnails.full.url:", attachment.thumbnails.full.url);
        return attachment.thumbnails.full.url;
      }
      if (attachment.thumbnails.small?.url) {
        console.log("getImageUrl: Found URL in thumbnails.small.url:", attachment.thumbnails.small.url);
        return attachment.thumbnails.small.url;
      }
    }
    
    // Add any other specific checks based on observed structures if needed
    // e.g., if the URL is nested differently

    console.log("getImageUrl: Attachment is an object, but no standard URL properties (url, thumbnails) found.");
  }
  
  console.log("getImageUrl: Could not extract a valid URL.");
  return null;
};

/**
 * Generates a consistent color based on a string (name)
 * @param name String to generate color from
 * @returns HEX color code
 */
export const getConsistentColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).slice(-2);
  }
  
  return color;
};

/**
 * Gets the initials from a name
 * @param name Full name
 * @returns Up to 2 initials from the name
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Gets an avatar image from a remote service
 * @param name Person's name
 * @param size Size of the avatar image
 * @returns URL to the avatar image
 */
export const getAvatarImageUrl = (name: string, size: number = 200): string => {
  // Check if we have this avatar in cache
  const cachedUrl = CacheService.getImage(name);
  if (cachedUrl) {
    return cachedUrl;
  }

  // Parse the name for initials
  const initials = getInitials(name);
  // Get a consistent color for this name
  const color = getConsistentColor(name).substring(1); // Remove # from hex
  
  // Generate the URL for the avatar service
  const url = `${AVATAR_SERVICE}/?name=${encodeURIComponent(initials)}&size=${size}&background=${color}&color=fff`;
  
  // Cache this URL
  CacheService.setImage(name, url);
  
  return url;
};

/**
 * Gets either the Airtable image URL or a fallback avatar image URL
 * @param name Person's name
 * @param attachments Airtable attachments array
 * @returns Image URL (either from Airtable or external avatar service)
 */
export const getProfileImageOrFallback = (name: string, attachments?: AirtableAttachment[]): string => {
  // Try to get real image first
  const imageUrl = getImageUrl(attachments);
  if (imageUrl) {
    return imageUrl;
  }
  
  // If no real image, use an avatar service
  return getAvatarImageUrl(name);
}; 