import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "../constants";

const normalizedBackendUrl = BACKEND_BASE_URL?.replace(/\/+$/, "");

if (!normalizedBackendUrl) {
  throw new Error("VITE_BACKEND_BASE_URL is not configured");
}

const authBaseURL = normalizedBackendUrl.endsWith("/api")
  ? `${normalizedBackendUrl}/auth`
  : `${normalizedBackendUrl}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    credentials: "include",
  },
  user: {
    additionalFields: {
      role: {
        type: USER_ROLES,
        required: true,
        defaultValue: "student",
        input: true,
      },
      department: {
        type: "string",
        required: false,
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});