import { isDemo, publicAsset } from "./runtime.js";

export const baseUrl = "/api/";
export async function apiRequest(
  path,
  { method = "GET", body, token = localStorage.getItem("token") } = {},
) {
  if (isDemo) {
    const { demoRequest, demoCourses } = await import("./demoData.js");
    const data = demoRequest(path, { method });
    const courses = Array.isArray(data) ? data : [data];
    for (const item of courses) {
      if (item && demoCourses.some((course) => course._id === item._id))
        item.imgPath = publicAsset("demo/coursesImg/" + item.imgPath);
    }
    return data;
  }
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const response = await fetch(baseUrl + path, { method, headers, body });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(
      data?.message || data?.status || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export function imageForm(values, imageField) {
  const body = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    if (key === imageField) {
      if (value instanceof File) body.append(key, value);
    } else body.append(key, JSON.stringify(value));
  }
  return body;
}
