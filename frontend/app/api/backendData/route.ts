import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const dataFromBackend = await req.json();
    const rawText = JSON.stringify(dataFromBackend);
    const byteLen = typeof rawText === 'string' ? Buffer.byteLength(rawText, 'utf8') : 0;
    const itemCount = Array.isArray(dataFromBackend) ? dataFromBackend.length : 0;
    if (itemCount > 10000) {
      console.warn('[backendData] Large payload detected — consider batching inserts.');
    }

    if (!Array.isArray(dataFromBackend)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const dataArr = dataFromBackend.map((d) => ({
        stateAppNo: d.stateAppNo as string,
        neetRollNo: d.neetRollNo as string,
        name: d.name.toUppercase() as string,
        category: d.category as string,
        subCategory: d.subCategory as string,
        typeOfCandidate: d.typeOfCandidate,
        incentivePercent: d.incentivePercent,
        stateSpecificPercentile: d.stateSpecificPercentile,
        neetAIR: d.neetAIR,
        courseAppliedFor: d.courseAppliedFor as string,
        neetAppID: d.neetAppID,
        stateSpecificRank: d.stateSpecificRank,
        categoryRank: typeof d.categoryRank === 'string' ? JSON.parse(d.categoryRank) : d.categoryRank,
      }))
    
    try {
      await prisma.user.createMany({
        data: dataArr,
        skipDuplicates: true,
      });
      return NextResponse.json({ success: true, inserted: dataArr.length });
    } catch (dbErr) {
      console.error('[backendData] Prisma createMany error:', dbErr);
      // Return the error message and helpful diagnostics
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
      return NextResponse.json({ error: 'Database insert failed', details: message, items: dataArr.length, bytes: byteLen }, { status: 500 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[backendData] Unexpected error:', message, { err });
    return NextResponse.json({ error: 'Unexpected server error', details: message }, { status: 500 });
  }
}