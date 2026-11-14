/** Upload limits shared by the client (UploadZone) and the API routes. */

/** Gemini inline requests are capped at 20 MB total; leave headroom for the prompt. */
export const MAX_FILES = 6;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 18 * 1024 * 1024;
