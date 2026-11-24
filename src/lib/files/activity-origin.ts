export type ActivityOrigin = { element?: HTMLElement; parents?: HTMLElement[]; path: string };

let latest: ActivityOrigin | undefined;
export function clearActivityOrigin() { latest = undefined; }

export function captureActivityOrigin(target: EventTarget | null) {
  if (!(target instanceof Element) || !target.closest("main")) return;
  const element = target.closest<HTMLElement>("[data-activity-area]") ?? target.closest<HTMLElement>("button, label, [role='button'], input[type='file']")
    ?? target.closest<HTMLElement>("section, form");
  if (element) {
    const parents: HTMLElement[] = [];
    for (let parent = element.parentElement; parent && parent.tagName !== "MAIN"; parent = parent.parentElement) parents.push(parent);
    latest = { element, parents, path: window.location.pathname };
  }
}

export function activityOrigin(): ActivityOrigin {
  const path = typeof window === "undefined" ? "" : window.location?.pathname ?? "";
  if (latest?.path !== path) return { path };
  return { ...latest, element: latest.element?.isConnected ? latest.element : latest.parents?.find(parent => parent.isConnected), path };
}
