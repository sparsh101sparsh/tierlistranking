import { TierDefinition, TierItem } from '../types';

export function renderTierBoardToCanvas(
  tiers: TierDefinition[],
  items: TierItem[]
): string {
  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const numTiers = tiers.length || 1;
  const rowHeight = Math.floor(height / numTiers);
  const labelWidth = 260;
  const cardWidth = 220;
  const borderWidth = 3;

  tiers.forEach((tier, index) => {
    const rowY = index * rowHeight;
    const currentHeight = (index === numTiers - 1) ? (height - rowY) : rowHeight;

    // Row dark background
    ctx.fillStyle = '#1e1a1b';
    ctx.fillRect(0, rowY, width, currentHeight);

    // Bottom border
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, rowY + currentHeight - borderWidth, width, borderWidth);

    // Left tier label block
    ctx.fillStyle = tier.color;
    ctx.fillRect(0, rowY, labelWidth, currentHeight - borderWidth);

    // Right border of tier label
    ctx.fillStyle = '#000000';
    ctx.fillRect(labelWidth - borderWidth, rowY, borderWidth, currentHeight);

    // Tier label text
    ctx.fillStyle = '#222222';
    ctx.font = '900 34px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tier.label.toUpperCase(), labelWidth / 2, rowY + (currentHeight - borderWidth) / 2);

    // Cards in this tier
    const tierItems = items.filter((item) => item.tierId === tier.id);
    let cardX = labelWidth;

    tierItems.forEach((item) => {
      if (cardX + cardWidth > width) return; // Don't overflow canvas edge

      // Card white body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cardX, rowY, cardWidth, currentHeight - borderWidth);

      // Card right border
      ctx.fillStyle = '#000000';
      ctx.fillRect(cardX + cardWidth - borderWidth, rowY, borderWidth, currentHeight);

      // Card text with wrap
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = item.title.toUpperCase();
      const words = title.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      // Determine font size based on text length
      let fontSize = 30;
      if (title.length > 50) fontSize = 18;
      else if (title.length > 30) fontSize = 22;
      else if (title.length > 15) fontSize = 26;

      ctx.font = `900 ${fontSize}px Impact, "Arial Black", Arial, sans-serif`;

      const maxLineWidth = cardWidth - 24;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw wrapped lines centered
      const lineHeight = fontSize * 1.15;
      const totalTextHeight = lines.length * lineHeight;
      const startY = rowY + (currentHeight - borderWidth) / 2 - (totalTextHeight / 2) + (lineHeight / 2);

      lines.forEach((line, lineIdx) => {
        ctx.fillText(line, cardX + cardWidth / 2, startY + (lineIdx * lineHeight));
      });

      cardX += cardWidth;
    });
  });

  return canvas.toDataURL('image/png', 1.0);
}
