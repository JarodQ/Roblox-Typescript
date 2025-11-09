// Constants.ts

export const AUTO_SAVE_PERIOD = 300; // Seconds between profile autosaves
export const LOAD_REPEAT_PERIOD = 10; // Seconds between profile load retries
export const FIRST_LOAD_REPEAT = 5; // Seconds between first and second load retry
export const SESSION_STEAL = 40; // Seconds until session conflict is force-resolved
export const ASSUME_DEAD = 630; // Seconds of inactivity before assuming session is dead
export const START_SESSION_TIMEOUT = 120; // Seconds before giving up on session start

export const CRITICAL_STATE_ERROR_COUNT = 5; // Errors before entering critical state
export const CRITICAL_STATE_ERROR_EXPIRE = 120; // Seconds before error expires
export const CRITICAL_STATE_EXPIRE = 120; // Seconds before critical state expires

export const MAX_MESSAGE_QUEUE = 1000; // Max messages stored per profile
