import type { Priority, TaskStatus } from "@prisma/client";

export type ListTaskInputDto = {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  userId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginationMetaDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedTasksOutputDto<T> = {
  data: T[];
  meta: PaginationMetaDto;
};