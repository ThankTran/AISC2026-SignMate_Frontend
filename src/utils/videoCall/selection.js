export function toggleSelection(items, value) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function findAvailablePartner(partners, currentIndex, blockedIds, findAnother) {
  const preferredIndex = findAnother ? (currentIndex + 1) % partners.length : currentIndex;
  const preferred = partners[preferredIndex];

  if (preferred && !blockedIds.includes(preferred.id)) {
    return preferredIndex;
  }

  return partners.findIndex((partner) => !blockedIds.includes(partner.id));
}
