import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/services/image-generation";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { prompt, aspectRatio = "16:9" } = await request.json();
    if (!prompt) throw new ValidationError("Image prompt is required");

    const image = await generateImage({ prompt, aspectRatio });
    return Response.json(image);
  } catch (error) {
    return errorResponse(error);
  }
}
