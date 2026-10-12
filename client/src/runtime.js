// Only the explicitly selected demo build runs without the API.
export const isDemo = import.meta.env?.MODE === "demo";
export const publicAsset = (path) => (import.meta.env?.BASE_URL || "/") + path;

export function appLocation() {
  if (!isDemo) return window.location;
  const route = new URL(
    window.location.hash.slice(1) || "/",
    window.location.origin,
  );
  return { pathname: route.pathname, search: route.search, hash: route.hash };
}

export function replaceAppRoute(route) {
  window.history.replaceState(
    null,
    "",
    isDemo
      ? window.location.pathname + window.location.search + "#" + route
      : route,
  );
}
