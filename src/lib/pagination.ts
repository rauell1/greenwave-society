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

export function parsePagination(searchParams: Record<string, string | string[] | undefined>) {
  const value = (key: string) => typeof searchParams[key] === "string" ? searchParams[key] as string : undefined;
  const parsedPage = Number.parseInt(value("page") ?? "1", 10);
  const parsedSize = Number.parseInt(value("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10);
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
  const pageSize = Number.isFinite(parsedSize) ? Math.min(MAX_PAGE_SIZE, Math.max(1, parsedSize)) : DEFAULT_PAGE_SIZE;
  return { page, pageSize, skip: (page - 1) * pageSize };
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
