const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(entries => {
  for (const entry of entries) (entry.target as HTMLElement).style.setProperty('--catalog-page-scale', String(entry.contentRect.width / 760));
});
export function measureCatalogPage(node: HTMLDivElement | null) {
  if (node) { node.style.setProperty('--catalog-page-scale', String(node.getBoundingClientRect().width / 760)); observer?.observe(node); return () => observer?.unobserve(node); }
}
