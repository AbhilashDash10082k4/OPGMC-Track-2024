"use client";

import { useEffect, useRef, useState } from "react";

export type SortField = "rank" | "percentile";
export type SortOrder = "asc" | "desc";

export interface PaginatedResult<T> {
  total: number;
  totalPages: number;
  page: number;
  rowsPerPage: number;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
}

export default function useServerPagination<T>(options?: {
  initialPage?: number;
  rowsPerPage?: number;
  initialSortField?: SortField;
  initialSortOrder?: SortOrder;
}) {
  const {
    initialPage = 1,
    rowsPerPage = 20,
    initialSortField = "rank",
    initialSortOrder = "asc",
  } = options ?? {};

  const [page, setPage] = useState<number>(initialPage);
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    function sideEffect() {
      setLoading(true);
      setError(null);
    }
    sideEffect();

    const query = new URLSearchParams({
      page: String(page),
      rowsPerPage: String(rowsPerPage),
      sortField: sortField,
      sortOrder: sortOrder,
    });

    fetch(`/api/pagination?${query.toString()}`, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Request failed ${res.status}: ${txt}`);
        }
        return res.json();
      })
      .then((json: PaginatedResult<T>) => {
        setData(json.paginatedData ?? []);
        setTotal(json.total ?? 0);
        setTotalPages(json.totalPages ?? 0);
        setStartIndex(json.startIndex ?? 0);
        setEndIndex(json.endIndex ?? 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message ?? String(err));
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      ac.abort();
    };
  }, [page, rowsPerPage, sortField, sortOrder]);

  return {
    data,
    total,
    totalPages,
    page,
    rowsPerPage,
    startIndex,
    endIndex,
    loading,
    error,
    setPage,
    setSortField,
    setSortOrder,
  } as const;
}
