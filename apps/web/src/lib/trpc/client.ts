"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@miru/trpc";

export const trpc = createTRPCReact<AppRouter>();
