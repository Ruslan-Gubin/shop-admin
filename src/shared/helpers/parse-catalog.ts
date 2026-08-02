interface Pdf2JsonText {
  x: number;
  y: number;
  w: number;
  R: Array<{ T: string; S: number; TS: number[] }>;
}

interface Pdf2JsonPage {
  Texts: Pdf2JsonText[];
}

export interface ImportPdfItem {
  id: number;
  name: string;
  price: string;
  barcode: string;
}

const BARCODE_PRIORITY = [13, 12, 14, 8];

function pickBarcode(raw: string): string {
  const codes = raw
    .split(/[,; ]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const len of BARCODE_PRIORITY) {
    const match = codes.find((c) => c.length === len);
    if (match) return match;
  }

  return codes[0] ?? raw;
}

function detectColumns(
  pages: Pdf2JsonPage[],
): { priceX: number; barcodeX: number; xTol: number } | null {
  for (const page of pages) {
    let priceX: number | undefined;
    let barcodeX: number | undefined;

    for (const t of page.Texts) {
      const c = t.R.map((r) => r.T).join("");
      if (c === "Цена") priceX = t.x;
      if (c === "Штрихкоды") barcodeX = t.x;
    }

    if (priceX !== undefined && barcodeX !== undefined) {
      return { priceX, barcodeX, xTol: 0.5 };
    }
  }

  return null;
}

export const parseCatalog = (catalog: { Pages: Pdf2JsonPage[] }): ImportPdfItem[] => {
  const cols = detectColumns(catalog.Pages);
  if (!cols) return [];

  const all: ImportPdfItem[] = [];
  const { priceX: PRICE_X, barcodeX: BARCODE_X, xTol: X_TOL } = cols;
  let id = 0;

  for (const page of catalog.Pages) {
    const rows = new Map<number, Pdf2JsonText[]>();
    for (const t of page.Texts) {
      const y = Math.round(t.y * 1000) / 1000;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push(t);
    }

    const sortedY = Array.from(rows.keys()).sort((a, b) => a - b);
    const raw: Array<{
      ng: Array<{ x: number; t: string }[]>;
      p: string;
      b: string;
      mx: number;
      m: boolean;
    }> = [];

    for (const y of sortedY) {
      let price = "";
      let barcode = "";
      const name: Array<{ x: number; t: string }> = [];

      for (const t of rows.get(y)!) {
        const c = t.R.map((r) => r.T).join("");
        if (Math.abs(t.x - PRICE_X) < X_TOL) {
          price = c;
        } else if (Math.abs(t.x - BARCODE_X) < X_TOL) {
          barcode = c;
        } else {
          name.push({ x: t.x, t: c });
        }
      }

      if (price === "Цена") continue;

      name.sort((a, b) => a.x - b.x);
      raw.push({
        ng: [name],
        p: price,
        b: barcode,
        mx: name[0]?.x ?? 999,
        m: false,
      });
    }

    for (let i = 1; i < raw.length; i++) {
      const c = raw[i];
      if (!c.p && !c.b && (raw[i - 1].p || raw[i - 1].b) && c.mx >= 3) {
        raw[i - 1].ng.push(c.ng[0]);
        c.m = true;
      }
    }

    for (const r of raw) {
      if (r.m) continue;
      const name = r.ng
        .map((g) => g.map((p) => p.t).join(""))
        .join(" ")
        .trim();
      if (r.p || r.b) {
        all.push({ id, name, price: r.p, barcode: pickBarcode(r.b) });
        id++;
      }
    }
  }

  return all;
};
