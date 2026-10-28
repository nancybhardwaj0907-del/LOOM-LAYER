import test from 'node:test';
import assert from 'node:assert/strict';
import {
  identifyFabricFromImage,
  classifyFabricLocally,
  extractFabricFeatures,
  FABRIC_CATALOG
} from './fabricIdentificationEngine.js';

test('FABRIC_CATALOG contains all required fabrics with complete metadata', () => {
  const requiredFabrics = ['Cotton', 'Denim', 'Linen', 'Silk', 'Polyester', 'Wool', 'Rayon', 'Blended Fabric'];
  for (const fabric of requiredFabrics) {
    const entry = FABRIC_CATALOG[fabric];
    assert.ok(entry, `FABRIC_CATALOG must have entry for ${fabric}`);
    assert.equal(entry.name, fabric);
    assert.ok(entry.characteristics, `${fabric} must have characteristics`);
    assert.ok(entry.commonUses, `${fabric} must have common uses`);
    assert.ok(entry.careInstructions, `${fabric} must have care instructions`);
    assert.ok(Array.isArray(entry.confidenceRange) && entry.confidenceRange.length === 2);
  }
});

test('identifyFabricFromImage flags underexposed (dark) photo and prompts user for clearer capture', async () => {
  const width = 64;
  const height = 64;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 10;     // R
    data[i + 1] = 10; // G
    data[i + 2] = 10; // B
    data[i + 3] = 255;
  }

  const result = await identifyFabricFromImage({ data, width, height });
  assert.equal(result.success, true);
  assert.equal(result.isClear, false);
  assert.ok(result.unclearMessage, 'Must provide user guidance message when photo is unclear');
  assert.ok(result.unclearMessage.includes('dark') || result.unclearMessage.includes('blurry') || result.unclearMessage.includes('clear'));
  assert.ok(result.disclaimer.includes('AI-estimated'));
});

test('identifyFabricFromImage flags overexposed (washed out) photo and prompts user for clearer capture', async () => {
  const width = 64;
  const height = 64;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 250;
    data[i + 1] = 250;
    data[i + 2] = 250;
    data[i + 3] = 255;
  }

  const result = await identifyFabricFromImage({ data, width, height });
  assert.equal(result.success, true);
  assert.equal(result.isClear, false);
  assert.ok(result.unclearMessage);
});

test('identifyFabricFromImage correctly classifies Denim with diagonal twill pattern', async () => {
  const width = 64;
  const height = 64;
  const data = new Uint8ClampedArray(width * height * 4);

  // Generate synthetic diagonal twill pattern with indigo warp and white weft
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // 3/1 diagonal twill pattern
      const isDiagonalTwill = (x + y) % 4 === 0;
      if (isDiagonalTwill) {
        // Ecru/white weft
        data[idx] = 210;
        data[idx + 1] = 210;
        data[idx + 2] = 205;
      } else {
        // Deep Indigo warp
        data[idx] = 30;
        data[idx + 1] = 50;
        data[idx + 2] = 135;
      }
      data[idx + 3] = 255;
    }
  }

  const result = await identifyFabricFromImage({ data, width, height });
  assert.equal(result.success, true);
  assert.equal(result.isClear, true);
  assert.equal(result.fabricName, 'Denim');
  assert.ok(result.confidence >= 80, `Confidence percentage (${result.confidence}%) should be >= 80%`);
  assert.ok(result.characteristics.length > 20);
  assert.ok(result.commonUses.includes('Jeans') || result.commonUses.includes('utility'));
  assert.ok(result.careInstructions.length > 10);
  assert.ok(result.disclaimer.includes('AI-estimated'));
});

test('identifyFabricFromImage correctly classifies Silk for ultra-smooth surface', async () => {
  const width = 64;
  const height = 64;
  const data = new Uint8ClampedArray(width * height * 4);

  // Smooth satin surface with gentle specular sheen (clarity contrast >= 20, zero edge density)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const val = 150 + Math.sin(x / 8) * 30;
      data[idx] = Math.round(val);
      data[idx + 1] = Math.round(val * 0.98);
      data[idx + 2] = Math.round(val * 0.95);
      data[idx + 3] = 255;
    }
  }

  const result = await identifyFabricFromImage({ data, width, height });
  assert.equal(result.success, true);
  assert.equal(result.isClear, true);
  assert.equal(result.fabricName, 'Silk');
  assert.ok(result.confidence >= 80);
  assert.ok(result.commonUses.includes('blouses') || result.commonUses.includes('Evening'));
  assert.ok(result.careInstructions.includes('Hand wash') || result.careInstructions.includes('dry clean'));
});

test('identifyFabricFromImage correctly classifies Cotton for balanced plain weave', async () => {
  const width = 64;
  const height = 64;
  const data = new Uint8ClampedArray(width * height * 4);

  // Balanced plain weave with orthogonal 4px grid
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isWarp = Math.floor(x / 4) % 2 === 0;
      const isWeft = Math.floor(y / 4) % 2 === 0;
      const intensity = 140 + (isWarp ? 25 : -25) + (isWeft ? 20 : -20);
      data[idx] = intensity;
      data[idx + 1] = intensity;
      data[idx + 2] = intensity;
      data[idx + 3] = 255;
    }
  }

  const result = await identifyFabricFromImage({ data, width, height });
  assert.equal(result.success, true);
  assert.equal(result.isClear, true);
  assert.equal(result.fabricName, 'Cotton');
  assert.ok(result.confidence >= 80);
  assert.ok(result.commonUses.includes('shirts') || result.commonUses.includes('dresses'));
});

test('identifyFabricFromImage handles null or missing input gracefully', async () => {
  const result = await identifyFabricFromImage(null);
  assert.equal(result.success, false);
  assert.equal(result.isClear, false);
  assert.ok(result.unclearMessage);
});
