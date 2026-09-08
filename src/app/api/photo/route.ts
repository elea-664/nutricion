import { NextRequest, NextResponse } from "next/server";

// Proxy propio hacia Pexels: la API key vive solo en el servidor
// (PEXELS_API_KEY, sin prefijo NEXT_PUBLIC) y nunca llega al navegador.
// Si no hay clave, o Pexels falla, o no hay resultados, devolvemos
// `{ photo: null }` — el cliente entonces usa el tile de emoji de siempre.

interface PexelsPhoto {
  src: { medium: string; large: string };
  alt: string | null;
  photographer: string;
  photographer_url: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ photo: null }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ photo: null });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ photo: null });
    }

    const data = (await res.json()) as PexelsSearchResponse;
    const result = data.photos?.[0];
    if (!result) {
      return NextResponse.json({ photo: null });
    }

    return NextResponse.json({
      photo: {
        url: result.src.medium,
        alt: result.alt || query,
        photographer: result.photographer,
        photographerUrl: result.photographer_url,
      },
    });
  } catch {
    return NextResponse.json({ photo: null });
  }
}
