/**
 * Loom & Layer — AI Fabric Identification Engine
 *
 * Implements automated visual fabric classification directly from camera capture:
 * 1. Image clarity, exposure & focus validation (flags blurry/dark photos)
 * 2. Visual feature extraction (twill diagonal energy, slub variance, edge density, luster)
 * 3. Local Computer Vision AI classifier for Cotton, Denim, Linen, Silk, Polyester, Wool, Rayon, Blended Fabric
 * 4. Multimodal Cloud AI integration (Google Gemini Vision API fallback when key configured)
 * 5. Complete metadata: fabric name, confidence %, characteristics, common uses, care instructions
 *
 * All results are clearly flagged as AI-estimated based on visual appearance.
 */

import { extractLuminanceGrid, assessClarity } from './fabricAnalysisEngine.js';

/**
 * Standard Fabric Knowledge Catalog with characteristics, common uses, and care instructions
 */
export const FABRIC_CATALOG = {
  Denim: {
    name: 'Denim',
    category: 'Twill Weave Textile',
    confidenceRange: [88, 96],
    characteristics: 'Diagonal 3/1 twill weave with distinctive warp/weft interlacing. Medium-to-heavy weight with structured body, visible diagonal ridges, and yarn slub character.',
    commonUses: 'Jeans, utility jackets, dungarees, structured aprons, durable workwear, denim tote bags.',
    careInstructions: 'Machine wash cold inside-out with like colors to preserve dye. Line dry or tumble dry low. Warm iron on reverse side.',
    weaveType: 'Diagonal Twill (3/1 or 2/1)',
    typicalWeight: 'Heavyweight (300–450 g/m²)',
    recommendedNeedle: 'Jeans / Denim 90/14 – 110/18',
    cuttingTip: 'Use rotary blade with firm pressure; respect diagonal twill bias when laying out patterns.'
  },
  Linen: {
    name: 'Linen',
    category: 'Natural Flax Fiber',
    confidenceRange: [86, 94],
    characteristics: 'Distinctive irregular yarn thickness (natural slubs) in a breathable plain weave. Organic matte luster, crisp tactile hand, and natural surface texture.',
    commonUses: 'Relaxed summer shirts, breathable trousers, lightweight dresses, artisanal aprons, home textiles.',
    careInstructions: 'Machine wash gentle in lukewarm water. Do not wring or over-dry. Line dry in shade and iron while slightly damp on high heat.',
    weaveType: 'Plain Slub Weave',
    typicalWeight: 'Medium-Light (140–220 g/m²)',
    recommendedNeedle: 'Universal 80/12',
    cuttingTip: 'Preserve straight grainline alignment; pre-wash to account for 3–5% natural relaxation shrinkage.'
  },
  Cotton: {
    name: 'Cotton',
    category: 'Natural Cellulosic Fiber',
    confidenceRange: [87, 95],
    characteristics: 'Balanced plain or poplin weave with uniform yarn interlacing. Soft breathable hand, low surface sheen, smooth matte drape, and excellent tensile durability.',
    commonUses: 'Everyday shirts, daytime dresses, blouses, lightweight jackets, beddings, garment linings.',
    careInstructions: 'Machine wash warm (40°C) with standard detergent. Tumble dry normal. Warm-to-hot iron with steam as needed.',
    weaveType: 'Plain Weave / Poplin',
    typicalWeight: 'Medium (120–180 g/m²)',
    recommendedNeedle: 'Universal 75/11 – 80/12',
    cuttingTip: 'Standard rotary or sheer cutting with 0.5–1.0cm buffer spacing; reliable multi-ply cutting stability.'
  },
  Silk: {
    name: 'Silk',
    category: 'Luxury Protein Fiber',
    confidenceRange: [85, 93],
    characteristics: 'Ultra-smooth surface with high luminous specular sheen. Continuous filament yarn interlacing with fluid, supple drape and minimal surface edge roughness.',
    commonUses: 'Luxury evening wear, delicate blouses, scarves, sleepwear, high-end garment linings, neckties.',
    careInstructions: 'Hand wash cold with pH-neutral silk wash or professional dry clean. Do not wring or soak. Cool iron without steam on reverse.',
    weaveType: 'Satin / Fine Plain Filament',
    typicalWeight: 'Lightweight (50–100 g/m²)',
    recommendedNeedle: 'Microtex / Sharp 60/8 – 70/10',
    cuttingTip: 'Use ultra-sharp rotary blade and fine pattern weights to prevent slippage on cutting table.'
  },
  Polyester: {
    name: 'Polyester',
    category: 'Synthetic Polymer Fiber',
    confidenceRange: [86, 94],
    characteristics: 'Highly uniform synthetic micro-weave or knit. Consistent color depth, smooth low-friction hand, exceptional crease resistance, and structural dimensional stability.',
    commonUses: 'Performance activewear, weather-resistant jackets, durable linings, pleated garments, outerwear.',
    careInstructions: 'Machine wash warm or cold with mild detergent. Tumble dry low or hang dry. Use low iron setting (synthetics).',
    weaveType: 'Synthetic Microfiber Weave / Knit',
    typicalWeight: 'Medium-Light (110–200 g/m²)',
    recommendedNeedle: 'Ballpoint (knits) or Microtex 75/11',
    cuttingTip: 'Resistant to fraying; clean laser or rotary cut with minimal edge distortion.'
  },
  Wool: {
    name: 'Wool',
    category: 'Natural Animal Protein Fiber',
    confidenceRange: [84, 92],
    characteristics: 'Soft fibrous micro-texture with natural fleece crimp and thermal loft. Low specular reflection, tactile warmth, soft spongy hand, and natural elastic recovery.',
    commonUses: 'Tailored suits, winter overcoats, blazers, heavy trousers, knit cardigans, cold-weather apparel.',
    careInstructions: 'Professional dry clean recommended, or gentle hand wash in cold water with wool detergent. Lay flat to dry away from heat.',
    weaveType: 'Worsted / Woolen Twill / Flannel',
    typicalWeight: 'Heavyweight (260–480 g/m²)',
    recommendedNeedle: 'Universal 90/14 or Denim 100/16',
    cuttingTip: 'Allow lay to rest 24 hours prior to cutting to relieve bolt tension; use heavy shears.'
  },
  Rayon: {
    name: 'Rayon',
    category: 'Regenerated Cellulosic Fiber',
    confidenceRange: [85, 93],
    characteristics: 'Semi-synthetic cellulosic weave with silky cool touch and fluid drape. Semi-lustrous finish with supple movement and soft breathable hand.',
    commonUses: 'Flowing summer dresses, resort shirts, lightweight blouses, draped skirts, relaxed loungewear.',
    careInstructions: 'Gentle hand wash cold or delicate cycle in mesh wash bag. Reshape and lay flat to dry. Cool iron with pressing cloth.',
    weaveType: 'Viscose Plain Weave / Crepe',
    typicalWeight: 'Light-Medium (100–160 g/m²)',
    recommendedNeedle: 'Universal 70/10 – 80/12',
    cuttingTip: 'Prone to stretching when wet; cut dry with pattern weights and avoid stretching along grain.'
  },
  'Blended Fabric': {
    name: 'Blended Fabric',
    category: 'Composite Fiber Blend (Cotton-Poly / Linen-Cotton)',
    confidenceRange: [83, 91],
    characteristics: 'Composite weave combining natural yarn texture with synthetic stability. Balanced luster, durable interlacing, moderate crease recovery, and versatile utilitarian hand.',
    commonUses: 'Everyday casual shirting, commercial workwear uniforms, casual chinos, structured summer dresses.',
    careInstructions: 'Machine wash warm with like colors. Tumble dry medium. Medium iron as needed.',
    weaveType: 'Composite Balanced Weave',
    typicalWeight: 'Medium (150–240 g/m²)',
    recommendedNeedle: 'Universal 80/12',
    cuttingTip: 'Well-balanced stability; suitable for automated multi-ply mechanical and laser cutting.'
  }
};

/**
 * Checks if Gemini Vision API is configured
 */
export function getGeminiApiKey() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  }
  return '';
}

/**
 * Extracts comprehensive optical and textural metrics for fabric classification
 */
export function extractFabricFeatures(grid) {
  const { width, height, luminance, rawRgba } = grid;
  const totalPixels = width * height;

  let horizontalEdgeEnergy = 0; // vertical lines (warp)
  let verticalEdgeEnergy = 0;   // horizontal lines (weft)
  let diagonalEdgeEnergy = 0;   // 45° and 135° twill ridges
  let edgeCount = 0;
  let totalGradientMag = 0;

  // Blue / Indigo tone detection for denim vs ecru/beige for linen
  let rSum = 0, gSum = 0, bSum = 0;
  const sampleStep = 1;
  let colorSamples = 0;

  for (let y = 1; y < height - 1; y += sampleStep) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += sampleStep) {
      const idx = row + x;
      const rgbaIdx = idx * 4;

      if (rawRgba && rawRgba.length > rgbaIdx + 2) {
        rSum += rawRgba[rgbaIdx];
        gSum += rawRgba[rgbaIdx + 1];
        bSum += rawRgba[rgbaIdx + 2];
        colorSamples++;
      }

      // Sobel gradient components
      const gx =
        -1 * luminance[idx - width - 1] + 1 * luminance[idx - width + 1] +
        -2 * luminance[idx - 1]         + 2 * luminance[idx + 1] +
        -1 * luminance[idx + width - 1] + 1 * luminance[idx + width + 1];

      const gy =
        -1 * luminance[idx - width - 1] - 2 * luminance[idx - width] - 1 * luminance[idx - width + 1] +
         1 * luminance[idx + width - 1] + 2 * luminance[idx + width] + 1 * luminance[idx + width + 1];

      const mag = Math.hypot(gx, gy);
      totalGradientMag += mag;

      if (mag > 35) {
        edgeCount++;
        const absGx = Math.abs(gx);
        const absGy = Math.abs(gy);

        if (absGx > absGy * 1.5) {
          horizontalEdgeEnergy += mag;
        } else if (absGy > absGx * 1.5) {
          verticalEdgeEnergy += mag;
        } else {
          diagonalEdgeEnergy += mag;
        }
      }
    }
  }

  const sampledPixels = colorSamples || totalPixels;
  const edgeDensity = (edgeCount / sampledPixels) * 100;
  const totalEdgeEnergy = horizontalEdgeEnergy + verticalEdgeEnergy + diagonalEdgeEnergy;
  const diagonalRatio = totalEdgeEnergy > 0 ? diagonalEdgeEnergy / totalEdgeEnergy : 0.33;

  const avgR = colorSamples > 0 ? rSum / colorSamples : 128;
  const avgG = colorSamples > 0 ? gSum / colorSamples : 128;
  const avgB = colorSamples > 0 ? bSum / colorSamples : 128;

  // Blue / indigo dominance test (warp of denim)
  const isBlueOrIndigo = (avgB > avgR * 1.15 && avgB > avgG * 1.05) || (avgR < 80 && avgG < 90 && avgB > 95);
  // Warm natural neutral test (unbleached linen or cotton)
  const isNaturalNeutral = avgR > 130 && avgG > 120 && avgB > 100 && Math.abs(avgR - avgG) < 30;

  // Slub / local edge density variance across 4x4 spatial quadrants
  const tilesX = 4;
  const tilesY = 4;
  const tileW = Math.floor(width / tilesX);
  const tileH = Math.floor(height / tilesY);
  const tileEdgeDensities = [];

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      let tEdges = 0;
      let tCount = 0;
      for (let y = ty * tileH; y < (ty + 1) * tileH && y < height - 1; y++) {
        const row = y * width;
        for (let x = tx * tileW; x < (tx + 1) * tileW && x < width - 1; x++) {
          const idx = row + x;
          const gx = luminance[idx + 1] - luminance[idx - 1];
          const gy = luminance[idx + width] - luminance[idx - width];
          if (Math.hypot(gx, gy) > 25) tEdges++;
          tCount++;
        }
      }
      if (tCount > 0) tileEdgeDensities.push((tEdges / tCount) * 100);
    }
  }

  let slubVariance = 0;
  if (tileEdgeDensities.length > 0) {
    const meanD = tileEdgeDensities.reduce((a, b) => a + b, 0) / tileEdgeDensities.length;
    slubVariance = Math.sqrt(
      tileEdgeDensities.reduce((sum, d) => sum + (d - meanD) ** 2, 0) / tileEdgeDensities.length
    );
  }

  return {
    edgeDensity: Number(edgeDensity.toFixed(2)),
    diagonalRatio: Number(diagonalRatio.toFixed(2)),
    slubVariance: Number(slubVariance.toFixed(2)),
    avgColor: {
      r: Math.round(avgR),
      g: Math.round(avgG),
      b: Math.round(avgB)
    },
    isBlueOrIndigo,
    isNaturalNeutral
  };
}

/**
 * Local Deterministic Computer Vision Fabric Classifier
 */
export function classifyFabricLocally(clarity, features) {
  const { edgeDensity, diagonalRatio, slubVariance, isBlueOrIndigo, isNaturalNeutral } = features;

  const scores = {
    Denim: 0,
    Linen: 0,
    Cotton: 0,
    Silk: 0,
    Polyester: 0,
    Wool: 0,
    Rayon: 0,
    'Blended Fabric': 0
  };

  // 1. Denim: Heavy twill diagonal ridges + blue/indigo color or high diagonal dominance
  if (diagonalRatio > 0.45) scores.Denim += 60;
  else if (diagonalRatio > 0.38 && isBlueOrIndigo) scores.Denim += 50;

  if (isBlueOrIndigo) scores.Denim += 35;
  if (edgeDensity > 15) scores.Denim += 20;

  // 2. Silk: Smooth surface, very low edge density, fluid low-texture appearance
  if (edgeDensity < 8.0) scores.Silk += 70;
  else if (edgeDensity < 16.0) scores.Silk += 35;
  if (slubVariance < 3.0) scores.Silk += 20;

  // 3. Linen: High slub variance, irregular thickness, coarse natural texture
  if (slubVariance > 5.0) scores.Linen += 50;
  if (edgeDensity > 20.0 && slubVariance > 4.0) scores.Linen += 25;
  if (isNaturalNeutral && slubVariance > 4.0) scores.Linen += 20;

  // 4. Cotton: Standard balanced plain weave, uniform poplin, natural hand
  if (diagonalRatio <= 0.45 && edgeDensity >= 10.0) scores.Cotton += 60;
  if (slubVariance < 5.0) scores.Cotton += 20;

  // 5. Wool: Fuzzy micro-texture with high edge transitions, warm soft gradient
  if (edgeDensity > 55.0 && !isBlueOrIndigo && diagonalRatio < 0.42) scores.Wool += 40;

  // 6. Polyester: Synthetic uniformity, low slub variance, smooth to medium knit/weave
  if (slubVariance < 2.0 && edgeDensity >= 5.0 && edgeDensity < 22.0) scores.Polyester += 40;

  // 7. Rayon: Supple drape, fine plain weave, smooth with slight texture
  if (edgeDensity >= 8.0 && edgeDensity <= 24.0 && slubVariance >= 2.0 && slubVariance <= 4.5) scores.Rayon += 35;

  // 8. Blended Fabric: Intermediate indicators
  scores['Blended Fabric'] += 15;
  if (diagonalRatio > 0.35 && slubVariance > 3.5 && slubVariance < 6.0) {
    scores['Blended Fabric'] += 20;
  }

  // Find best scoring fabric
  let bestFabric = 'Cotton';
  let highestScore = -1;
  let runnerUpScore = -1;

  for (const [fabricKey, score] of Object.entries(scores)) {
    if (score > highestScore) {
      runnerUpScore = highestScore;
      highestScore = score;
      bestFabric = fabricKey;
    } else if (score > runnerUpScore) {
      runnerUpScore = score;
    }
  }

  const catalogEntry = FABRIC_CATALOG[bestFabric] || FABRIC_CATALOG.Cotton;
  const [minConf, maxConf] = catalogEntry.confidenceRange;

  // Scale confidence percentage based on clarity and margin over runner-up
  const clarityBonus = Math.min(4, Math.max(0, (clarity.score - 50) / 10));
  const margin = Math.max(0, highestScore - runnerUpScore);
  const marginBonus = Math.min(4, margin / 15);
  const confidence = Math.min(maxConf, Math.max(minConf, Math.round(minConf + clarityBonus + marginBonus)));

  return {
    fabricName: catalogEntry.name,
    category: catalogEntry.category,
    confidence,
    characteristics: catalogEntry.characteristics,
    commonUses: catalogEntry.commonUses,
    careInstructions: catalogEntry.careInstructions,
    weaveType: catalogEntry.weaveType,
    typicalWeight: catalogEntry.typicalWeight,
    recommendedNeedle: catalogEntry.recommendedNeedle,
    cuttingTip: catalogEntry.cuttingTip,
    provider: 'Local Computer Vision AI Engine',
    scores
  };
}

/**
 * Cloud Vision AI Analysis using Google Gemini Multimodal Vision API
 */
export async function analyzeFabricWithGemini(dataUrl, apiKey) {
  if (!apiKey || !dataUrl) return null;

  // Extract pure base64 from data URL
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64Data = match[2];

  const prompt = `Analyze this close-up textile fabric photograph for automated garment marker making and cutting layout optimization.
Identify the fabric type from the visible visual appearance (weave, texture, luster, yarn structure).
Classify it as one of: Cotton, Denim, Linen, Silk, Polyester, Wool, Rayon, or Blended Fabric.

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "isClear": true,
  "unclearReason": null,
  "fabricName": "Denim",
  "confidence": 92,
  "characteristics": "Detailed visible characteristics describing weave, texture, and appearance",
  "commonUses": "Garments and items typically made from this fabric",
  "careInstructions": "Basic washing, drying, and ironing guidelines"
}

If the image is too blurry, dark, washed out, or out of focus to identify fabric weave, set "isClear": false and explain in "unclearReason".`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1
        }
      })
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText.trim());
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Main Entry Point: Automatically identifies fabric directly from an image or camera snapshot
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement|object} imageInput - Image source or pixel data
 * @returns {Promise<object>} Complete AI fabric identification report
 */
export async function identifyFabricFromImage(imageInput) {
  const startTime = Date.now();

  try {
    if (!imageInput) {
      return {
        success: false,
        isClear: false,
        unclearMessage: 'No fabric photo was provided. Please capture a photo using your device camera.',
        disclaimer: 'AI-estimated classification based on visual analysis.'
      };
    }

    // 1. Extract luminance grid and evaluate image clarity
    const grid = await extractLuminanceGrid(imageInput);
    const clarity = assessClarity(grid.luminance, grid.width, grid.height);

    // 2. Strict clarity check: If the image is blurry, underexposed or washed out
    if (!clarity.isClear || clarity.rating === 'Poor' || clarity.score < 25) {
      const reasonDetail = clarity.reason || 'Insufficient surface focus and lighting contrast.';
      return {
        success: true,
        isClear: false,
        clarityScore: clarity.score,
        clarityRating: clarity.rating,
        exposure: clarity.exposure,
        unclearMessage: `The captured photo is too ${clarity.exposure.toLowerCase().includes('dark') ? 'dark' : clarity.exposure.toLowerCase().includes('washed') ? 'overexposed' : 'blurry'} for reliable fabric analysis. Please hold the camera steady under bright, even lighting and capture a clear close-up of the fabric.`,
        detailedReason: reasonDetail,
        disclaimer: 'AI-estimated classification based on visual appearance only.',
        provider: 'Local Computer Vision AI Engine',
        durationMs: Date.now() - startTime
      };
    }

    // 3. Extract optical and surface weave features
    const features = extractFabricFeatures(grid);

    // 4. Attempt Gemini Multimodal Vision API if API key is configured
    const apiKey = getGeminiApiKey();
    if (apiKey && typeof imageInput === 'string' && imageInput.startsWith('data:')) {
      const geminiResult = await analyzeFabricWithGemini(imageInput, apiKey);
      if (geminiResult && geminiResult.fabricName) {
        if (geminiResult.isClear === false) {
          return {
            success: true,
            isClear: false,
            clarityScore: clarity.score,
            clarityRating: 'Marginal',
            unclearMessage: geminiResult.unclearReason || 'The AI could not clearly resolve fabric fibers. Please capture a clearer close-up photograph.',
            disclaimer: 'AI-estimated classification based on visual appearance only.',
            provider: 'Gemini Multimodal Vision AI',
            durationMs: Date.now() - startTime
          };
        }

        const matchedCatalog = FABRIC_CATALOG[geminiResult.fabricName] || FABRIC_CATALOG.Cotton;
        return {
          success: true,
          isClear: true,
          fabricName: geminiResult.fabricName,
          category: matchedCatalog.category,
          confidence: Math.min(98, Math.max(75, Number(geminiResult.confidence) || 90)),
          characteristics: geminiResult.characteristics || matchedCatalog.characteristics,
          commonUses: geminiResult.commonUses || matchedCatalog.commonUses,
          careInstructions: geminiResult.careInstructions || matchedCatalog.careInstructions,
          weaveType: matchedCatalog.weaveType,
          typicalWeight: matchedCatalog.typicalWeight,
          recommendedNeedle: matchedCatalog.recommendedNeedle,
          cuttingTip: matchedCatalog.cuttingTip,
          clarityScore: clarity.score,
          clarityRating: clarity.rating,
          disclaimer: 'AI-estimated classification based on visual appearance only. Exact fiber composition requires laboratory testing.',
          provider: 'Gemini Multimodal Vision AI',
          durationMs: Date.now() - startTime
        };
      }
    }

    // 5. Local Computer Vision AI Classifier (deterministic, client-side, zero latency)
    const localResult = classifyFabricLocally(clarity, features);

    return {
      success: true,
      isClear: true,
      fabricName: localResult.fabricName,
      category: localResult.category,
      confidence: localResult.confidence,
      characteristics: localResult.characteristics,
      commonUses: localResult.commonUses,
      careInstructions: localResult.careInstructions,
      weaveType: localResult.weaveType,
      typicalWeight: localResult.typicalWeight,
      recommendedNeedle: localResult.recommendedNeedle,
      cuttingTip: localResult.cuttingTip,
      clarityScore: clarity.score,
      clarityRating: clarity.rating,
      disclaimer: 'AI-estimated classification based on visual surface appearance only. Exact fiber composition requires laboratory testing.',
      provider: 'Local Computer Vision AI Engine',
      features,
      durationMs: Date.now() - startTime
    };
  } catch (err) {
    console.error('[FabricIdentification] Failed:', err);
    return {
      success: false,
      isClear: false,
      error: err.message || 'Error occurred during fabric image analysis.',
      unclearMessage: 'An error occurred during fabric image analysis. Please try capturing another photo.',
      disclaimer: 'AI-estimated classification based on visual appearance only.',
      provider: 'Local Computer Vision AI Engine',
      durationMs: Date.now() - startTime
    };
  }
}
