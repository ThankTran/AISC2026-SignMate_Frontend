import assert from "node:assert/strict";
import test from "node:test";
import { validateAuthField, authErrorMessage } from "../src/services/authValidation.js";
import { getInitials } from "../src/utils/getInitials.js";
test("auth validates individual fields and maps actionable Firebase errors", () => {
  assert.ok(validateAuthField("email", "invalid"));
  assert.equal(validateAuthField("email", "test@example.com"), "");
  assert.ok(validateAuthField("password", "1234567"));
  assert.equal(validateAuthField("password", "12345678"), "");
  assert.ok(validateAuthField("confirmPw", "a", "b"));
  assert.match(authErrorMessage({ code: "auth/network-request-failed" }), /Mất kết nối/);
});
test("avatar initials are consistent for Vietnamese and single names", () => {
  assert.equal(getInitials("Nguyễn Minh Anh"), "MA");
  assert.equal(getInitials("Lan"), "LA");
});
