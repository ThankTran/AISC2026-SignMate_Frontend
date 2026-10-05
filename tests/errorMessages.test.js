import test from "node:test";
import assert from "node:assert/strict";
import { errorMessage, ERROR_MESSAGES } from "../src/services/errorMessages.js";
test("known API codes prefer friendly Vietnamese copy over raw server detail", () => {
  for (const code of [
    "LESSON_LOCKED",
    "QUIZ_LOCKED",
    "ATTEMPT_CLOSED",
    "ALREADY_ANSWERED",
    "NOT_FRIENDS",
    "CALL_BUSY",
    "NOT_FOUND",
  ]) {
    assert.equal(
      errorMessage({ code, message: "sensitive internal detail" }, { dev: true }),
      ERROR_MESSAGES[code],
    );
  }

  assert.match(errorMessage({ status: 401 }, { dev: false }), /đăng nhập/);
});
test("production does not expose unmapped backend messages", () => {
  assert.doesNotMatch(
    errorMessage({ code: "NEW_CODE", message: "SQL schema secret" }, { dev: false }),
    /SQL|secret/,
  );
  assert.equal(
    errorMessage({ code: "NEW_CODE", message: "debug detail" }, { dev: true }),
    "debug detail",
  );
  assert.equal(errorMessage({ code: "TIMEOUT", status: 0 }), ERROR_MESSAGES.TIMEOUT);
});
