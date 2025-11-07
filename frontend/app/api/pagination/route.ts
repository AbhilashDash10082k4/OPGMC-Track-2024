import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";

export type SortField = "rank" | "percentile";
export type SortOrder = "asc" | "desc";

// GET /api/pagination?page=1&rowsPerPage=20&sortField=rank&sortOrder=asc
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sortField = (url.searchParams.get("sortField") as SortField) ?? "rank";
    const sortOrder = (url.searchParams.get("sortOrder") as SortOrder) ?? "asc";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const rowsPerPage = Math.max(1, Number(url.searchParams.get("rowsPerPage") ?? "20"));

    // Map api sort field to DB column
    const dbSortField = sortField === "rank" ? "stateSpecificRank" : "stateSpecificPercentile";

    // Basic where clause (extendable for filters/search)
    const where: Prisma.UserWhereInput = {};

    const total = await prisma.user.count({ where });

    let orderBy: Prisma.UserOrderByWithRelationInput;
    if (dbSortField === 'stateSpecificRank') {
      orderBy = { stateSpecificRank: sortOrder === 'asc' ? 'asc' : 'desc' };
    } else {
      orderBy = { stateSpecificPercentile: sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      select: {
        stateAppNo: true,
        neetRollNo: true,
        name: true,
        typeOfCandidate: true,
        category: true,
        stateSpecificRank: true,
        stateSpecificPercentile: true,
        courseAppliedFor: true,
        categoryRank: true,
      },
    });

    const paginatedData = users.map((u) => ({
      id: u.stateAppNo,
      rank: u.stateSpecificRank ?? 0,
      name: u.name,
      neetRollNo: u.neetRollNo,
      percentile: u.stateSpecificPercentile ?? 0,
      typeOfCandidate: u.typeOfCandidate ?? "INS",
      category: u.category ?? "",
      admittedCollege: u.courseAppliedFor ?? "",
      admittedSubject: "",
      rawCategoryRank: u.categoryRank ?? null,
    }));

    const totalPages = Math.ceil(total / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + paginatedData.length - 1;

    return NextResponse.json({ total, totalPages, page, rowsPerPage, startIndex, endIndex, paginatedData });
  } catch (err) {
    console.error('[pagination] error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to fetch paginated data', details: message }, { status: 500 });
  }
}
