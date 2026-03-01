import { fal } from "@fal-ai/client";

interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
  resolution?: "512" | "1K" | "2K";
}

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  contentType: string;
}

export async function generateImage({
  prompt,
  aspectRatio = "16:9",
  resolution = "1K",
}: GenerateImageOptions): Promise<GeneratedImage> {
  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      resolution,
      output_format: "webp",
      num_images: 1,
    },
  });

  const data = result.data as {
    images: Array<{
      url: string;
      width: number;
      height: number;
      content_type: string;
    }>;
  };

  const image = data.images[0];
  return {
    url: image.url,
    width: image.width,
    height: image.height,
    contentType: image.content_type,
  };
}
