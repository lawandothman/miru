import canonicalizationDefinitions from "./watch-provider-canonicalization.json";

type CanonicalWatchProviderDefinition = {
	aliases: number[];
	displayPriority: number;
	logoPath: string;
	name: string;
};

type CanonicalWatchProviderDefinitions = Record<
	string,
	CanonicalWatchProviderDefinition
>;

export type WatchProviderShape = {
	displayPriority: number | null;
	id: number;
	logoPath: string | null;
	name: string;
};

const definitions =
	canonicalizationDefinitions as CanonicalWatchProviderDefinitions;

function compareValues(a: number | null, b: number | null) {
	const fallback = Number.MAX_SAFE_INTEGER;
	return (a ?? fallback) - (b ?? fallback);
}

export function compareWatchProviders(
	a: Pick<WatchProviderShape, "displayPriority" | "name">,
	b: Pick<WatchProviderShape, "displayPriority" | "name">,
) {
	return (
		compareValues(a.displayPriority, b.displayPriority) ||
		a.name.localeCompare(b.name)
	);
}

export const canonicalWatchProviders = Object.entries(definitions)
	.map(([id, definition]) => ({
		displayPriority: definition.displayPriority,
		id: Number(id),
		logoPath: definition.logoPath,
		name: definition.name,
	}))
	.sort(compareWatchProviders);

const canonicalWatchProviderMap = new Map(
	canonicalWatchProviders.map((provider) => [provider.id, provider]),
);

const watchProviderAliases = new Map(
	Object.entries(definitions).flatMap(([id, definition]) =>
		definition.aliases.map((aliasId) => [aliasId, Number(id)]),
	),
);

export const aliasedWatchProviderIds = [...watchProviderAliases.keys()].sort(
	(a, b) => a - b,
);

export function getCanonicalWatchProviderId(providerId: number) {
	return watchProviderAliases.get(providerId) ?? providerId;
}

export function normalizeWatchProviderIds(providerIds: readonly number[]) {
	const normalizedProviderIds: number[] = [];
	const seenProviderIds = new Set<number>();

	for (const providerId of providerIds) {
		const canonicalProviderId = getCanonicalWatchProviderId(providerId);
		if (seenProviderIds.has(canonicalProviderId)) {
			continue;
		}

		seenProviderIds.add(canonicalProviderId);
		normalizedProviderIds.push(canonicalProviderId);
	}

	return normalizedProviderIds;
}

export function normalizeWatchProvider<T extends WatchProviderShape>(
	provider: T,
): T {
	const canonicalProviderId = getCanonicalWatchProviderId(provider.id);
	const canonicalProvider = canonicalWatchProviderMap.get(canonicalProviderId);

	if (!canonicalProvider) {
		if (canonicalProviderId === provider.id) {
			return provider;
		}

		return { ...provider, id: canonicalProviderId } as T;
	}

	return {
		...provider,
		...canonicalProvider,
		id: canonicalProviderId,
	} as T;
}

export function mergeWatchProviders<T extends WatchProviderShape>(
	providers: readonly T[],
) {
	const mergedProviders = new Map<number, T>();

	for (const provider of providers) {
		const normalizedProvider = normalizeWatchProvider(provider);
		if (!mergedProviders.has(normalizedProvider.id)) {
			mergedProviders.set(normalizedProvider.id, normalizedProvider);
		}
	}

	return [...mergedProviders.values()].sort(compareWatchProviders);
}
