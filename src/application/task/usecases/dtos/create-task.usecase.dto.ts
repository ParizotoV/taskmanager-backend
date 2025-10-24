import { Priority, TaskStatus } from "@prisma/client";

export type CreateTaskInputDto = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  order?: number;
}