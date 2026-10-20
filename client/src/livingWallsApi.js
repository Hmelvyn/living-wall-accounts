const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.errors?.join(" ") || body.message || message;
    } catch {
      // Keep the status message when the server response is not JSON.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function getLivingWalls() {
  return request("/living-walls");
}

export function createLivingWall(wall) {
  return request("/living-walls", {
    method: "POST",
    body: JSON.stringify(wall),
  });
}

export function updateLivingWall(id, changes) {
  return request(`/living-walls/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}
