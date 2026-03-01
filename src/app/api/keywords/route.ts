import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getKeywordData } from "@/lib/services/keyword-data";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { keywords } = await request.json();
    if (!keywords?.length) throw new ValidationError("Keywords required");

    const data = await getKeywordData(keywords.slice(0, 20));
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
