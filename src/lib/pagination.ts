export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const pageStr = searchParams.get("page");
  const pageSizeStr = searchParams.get("pageSize");
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const page = pageStr ? Math.max(1, parseInt(pageStr, 10)) : 1;
  const parsedPageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, parsedPageSize), MAX_PAGE_SIZE);
  const sortOrder = sortOrderRaw === "desc" ? "desc" : "asc";

  return { page, pageSize, search, sortBy, sortOrder };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}
