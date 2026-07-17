/**
 * Plays the notification chime (the same file the mobile app uses).
 *
 * Browsers block audio until the user has interacted with the page, so the
 * first pointer/key event silently "unlocks" the element (a muted play→pause).
 * After that, playNotifSound() rings for real.
 */
let audio: HTMLAudioElement | null = null;
let unlocked = false;

export function initNotifSound(): void {
  if (audio) return;
  audio = new Audio('/notification_sound.mp3');
  audio.preload = 'auto';

  const unlock = () => {
    if (unlocked || !audio) return;
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio!.pause();
        audio!.currentTime = 0;
        audio!.muted = false;
        unlocked = true;
      })
      .catch(() => {
        // Still locked (no real gesture yet) — try again on the next event.
      });
  };

  // `once` isn't used: an early programmatic event can fire before a real
  // gesture, so we keep listening until a play() actually succeeds.
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

export function playNotifSound(): void {
  if (!audio) return;
  audio.currentTime = 0;
  // A play() before the first gesture rejects — harmless, the badge still updates.
  audio.play().catch(() => {});
}
