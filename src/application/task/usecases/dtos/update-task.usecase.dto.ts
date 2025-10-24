import { Priority, TaskStatus } from "@prisma/client";

export type UpdateTaskInputDto = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  order?: number;
}