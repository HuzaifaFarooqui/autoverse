const cache = new Map<string, string>();

export async function generateWithCache(
    key: string,
    generator: () => Promise<string>
): Promise<string> {
    if (cache.has(key)) {
        return cache.get(key)!;
    }

    const result = await generator();
    cache.set(key, result);
    return result;
}

export function clearCache() {
    cache.clear();
}
