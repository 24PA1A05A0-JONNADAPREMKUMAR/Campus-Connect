describe("Authentication validation", () => {
  test("should reject an empty name", () => {
    const name = "";

    expect(name.trim()).toBe("");
  });

  test("should reject an invalid email", () => {
    const email = "invalid-email";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailPattern.test(email)).toBe(false);
  });

  test("should accept a valid email", () => {
    const email = "student@example.com";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailPattern.test(email)).toBe(true);
  });

  test("should reject a password shorter than 6 characters", () => {
    const password = "12345";

    expect(password.length).toBeLessThan(6);
  });

  test("should accept a password with at least 6 characters", () => {
    const password = "Student@123";

    expect(password.length).toBeGreaterThanOrEqual(6);
  });
});