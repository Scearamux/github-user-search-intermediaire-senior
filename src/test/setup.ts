// Adds DOM matchers to expect, and registers types for TypeScript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Dismantles DOM between test, renderings don't pile up and getBy* queries find multiple matches
afterEach(() => {
  cleanup();
});
