import { isDemo } from "../runtime.js";

export function matchesFilters(profile, filters) {
  return ["district", "grade", "subject"].every((key) =>
    (filters[key] || []).every((value) => (profile[key] || []).includes(value)),
  );
}
export function averageRating(profile) {
  return profile.commentCount > 0 ? profile.rate / profile.commentCount : 0;
}
export function errorMessage(error) {
  return (
    error?.data?.message ||
    error?.message ||
    "Could not complete the request. Please try again."
  );
}
export const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
export const avatar = (profile) =>
  profile?.imgPath ? (isDemo ? "" : "/images/") + profile.imgPath : undefined;
export const courseImage = (course) =>
  course?.imgPath ? (isDemo ? "" : "/coursesImg/") + course.imgPath : undefined;
