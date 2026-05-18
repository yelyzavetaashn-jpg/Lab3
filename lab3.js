function createMemo(fn, config = {}) {
    const settings = {
        limit: config.limit ?? Infinity,
        strategy: config.strategy ?? "LRU",
        expireTime: config.expireTime ?? null,
        onEvict: config.onEvict ?? null
    }

    const storage = new Map()
 const buildKey = (params) => {
        return params.map(item => JSON.stringify(item)).join("|")
    }
     const outdated = (item) => {
        if (settings.expireTime === null) {
            return false
        }

        return Date.now() > item.expires
    }
