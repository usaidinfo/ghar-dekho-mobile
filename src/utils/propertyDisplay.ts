/** INR formatting for property cards / detail */
export function formatInrPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return '—';
  if (price >= 1_00_00_000) {
    const cr = price / 1_00_00_000;
    const s = cr >= 10 ? cr.toFixed(1) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `₹${s} Cr`;
  }
  if (price >= 1_00_000) {
    const l = price / 1_00_000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} L`;
  }
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}

export function formatSqFt(area?: number | null): string {
  if (area == null || !Number.isFinite(area)) return '—';
  return `${Math.round(area).toLocaleString('en-IN')} sq.ft`;
}

export function formatFurnishing(raw?: string | null): string {
  if (!raw) return '—';
  return raw
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export function formatFacing(raw?: string | null): string {
  if (!raw) return '—';
  return raw.replace(/_/g, ' ');
}

export function formatPropertyAge(years?: number | null): string {
  if (years == null || !Number.isFinite(years)) return '—';
  if (years <= 0) return 'New';
  if (years === 1) return '1 Year';
  return `${Math.round(years)} Years`;
}

export function investmentScoreLabel(score?: number | null): string {
  if (score == null || !Number.isFinite(score)) return '—';
  if (score >= 7.5) return 'Strong';
  if (score >= 5.5) return 'Fair';
  if (score >= 4) return 'Value';
  return 'Explore';
}

export function buildAiInsightCopy(p: {
  locality: string;
  city: string;
  description?: string | null;
  aiSuggestedPrice?: number | null;
  price: number;
}): string {
  const loc = [p.locality, p.city].filter(Boolean).join(' ');
  if (p.description && p.description.length > 40) {
    const short = p.description.slice(0, 160).trim();
    return short.endsWith('.') ? short : `${short}…`;
  }
  if (p.aiSuggestedPrice != null && p.aiSuggestedPrice > 0 && p.price > 0) {
    const diff = ((p.price - p.aiSuggestedPrice) / p.aiSuggestedPrice) * 100;
    if (diff < -2) {
      return `${loc} — this unit is priced about ${Math.abs(Math.round(diff))}% below the suggested range for the area.`;
    }
    if (diff > 2) {
      return `${loc} — priced about ${Math.round(diff)}% above the suggested range; verify specs and builder premium.`;
    }
  }
  return `${loc} real estate demand varies by block and tower. Compare recent transactions and maintenance before you decide.`;
}
