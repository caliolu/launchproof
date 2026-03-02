import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";
import { analyzeMarketFit } from "@/lib/services/scanner/market-research";

export async function POST(request: NextRequest) {
  const { authorized, user, error } = await requirePro();
  if (!authorized || !user) return error!;

  const body = await request.json();
  const { projectId } = body as { projectId: string };

  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  const result = await analyzeMarketFit(projectId, user.id);

  if (result.error) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    message: `Analyzed ${result.count} opportunities for market fit`,
    count: result.count,
  });
}
