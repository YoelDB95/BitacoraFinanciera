export function companyLabel(company) {
  return company?.nombre ?? company?.legalName ?? company?.name ?? 'Empresa'
}

export function routeEntryLabel(entry, companyIndex) {
  return entry?.companyName ?? companyLabel(companyIndex?.[entry?.companyId])
}

function shortenRouteType(type) {
  return String(type ?? '')
    .replace(/^ruta\s+/i, '')
    .trim()
}

export function routeTypeLabel(route) {
  for (const entry of route?.empresas ?? []) {
    if (entry?.routingType !== 'ROUTE') continue
    const type = shortenRouteType(entry.routeTypeName || entry.routeTypeCode)
    if (type) return type
  }
  return ''
}
