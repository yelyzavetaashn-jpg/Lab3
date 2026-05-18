function createMemo(fn, config = {}) {
    const settings = {
        limit: config.limit ?? Infinity,
        strategy: config.strategy ?? "LRU",
        expireTime: config.expireTime ?? null,
        onEvict: config.onEvict ?? null
    }

    const storage = new Map()
