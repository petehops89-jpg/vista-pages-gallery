/**
 * cronBus.ts — minimal shared signal for cron control across the control room.
 *
 * CommandControl writes (master enable + per-job kill set); cron components
 * (WebhookCron etc.) subscribe and stop their intervals when disabled/killed.
 * No framework, no deps — just a typed pub/sub so siblings stay decoupled.
 */
export type CronJob = { id: string; name: string };

const state = {
  enabled: true,
  killed: new Set<string>(),
};
const subs = new Set<() => void>();

function emit() {
  subs.forEach((fn) => fn());
}

export function subscribeCron(fn: () => void): () => void {
  subs.add(fn);
  fn(); // push current state immediately
  return () => subs.delete(fn);
}

export function getCronState() {
  return { enabled: state.enabled, killed: new Set(state.killed) };
}

export function setCronEnabled(on: boolean) {
  state.enabled = on;
  if (!on) emit(); // disabled => everything stops; killed set kept until re-enabled
  else emit();
}

export function killCronJob(id: string) {
  state.killed.add(id);
  emit();
}

export function reviveCronJob(id: string) {
  state.killed.delete(id);
  emit();
}

export function isJobAlive(id: string): boolean {
  return state.enabled && !state.killed.has(id);
}
