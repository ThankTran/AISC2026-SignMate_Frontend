const STORAGE_KEYS = {
  review: "signmate-last-review",
  report: "signmate-demo-report",
};

// Demo persistence boundary. Replace these functions when backend endpoints exist.
function saveSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
}

export function saveCallReview(review) {
  return saveSessionValue(STORAGE_KEYS.review, review);
}

export function saveCallReport(report) {
  return saveSessionValue(STORAGE_KEYS.report, report);
}
