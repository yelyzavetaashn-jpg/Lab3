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
const clearOld = () => {
        for (const [cacheKey, cacheValue] of storage) {
            if (outdated(cacheValue)) {
                storage.delete(cacheKey)
            }
        }
    }
const freeSpace = () => {
        if (storage.size < settings.limit) {
            return
        }

        if (settings.strategy === "LRU") {
            let selectedKey = null
            let minAccess = Infinity

            for (const [cacheKey, cacheValue] of storage) {
                if (cacheValue.lastAccess < minAccess) {
                    minAccess = cacheValue.lastAccess
                    selectedKey = cacheKey
                }
            }

            if (selectedKey !== null) {
                storage.delete(selectedKey)
            }
        }

        else if (settings.strategy === "LFU") {
            let selectedKey = null
            let minUsage = Infinity
            let oldestAccess = Infinity

            for (const [cacheKey, cacheValue] of storage) {
                const betterCandidate =
                    cacheValue.used < minUsage ||
                    (
                        cacheValue.used === minUsage &&
                        cacheValue.lastAccess < oldestAccess
                    )

                if (betterCandidate) {
                    minUsage = cacheValue.used
                    oldestAccess = cacheValue.lastAccess
                    selectedKey = cacheKey
                }
            }

            if (selectedKey !== null) {
                storage.delete(selectedKey)
            }
        }

        else if (
            settings.strategy === "CUSTOM" &&
            typeof settings.onEvict === "function"
        ) {
            const customKey = settings.onEvict(storage)

            if (customKey !== undefined) {
                storage.delete(customKey)
            }
        }
    }
function wrapped(...params) {
        clearOld()

        const cacheKey = buildKey(params)

        if (storage.has(cacheKey)) {
            const saved = storage.get(cacheKey)

            if (!outdated(saved)) {
                saved.used += 1
                saved.lastAccess = Date.now()

                return saved.result
            }

            storage.delete(cacheKey)
        }

        freeSpace()

        const value = fn(...params)

        storage.set(cacheKey, {
            result: value,
            used: 1,
            created: Date.now(),
            expires: settings.expireTime
                ? Date.now() + settings.expireTime
                : Infinity,
            lastAccess: Date.now()
        })

        return value
    }
 wrapped.reset = () => {
        storage.clear()
    }

    wrapped.size = () => {
        return storage.size
    }

    wrapped.entries = () => {
        return storage
    }

    return wrapped
}
function heavyMultiply(a, b) {
    console.log("processing...")
    return a * b
}

const cachedMultiply = createMemo(heavyMultiply, {
    limit: 2,
    strategy: "LRU",
    expireTime: 10000
})

console.log(cachedMultiply(2, 5))
console.log(cachedMultiply(2, 5))
console.log(cachedMultiply(3, 4))
console.log(cachedMultiply(6, 7))

console.log("elements in cache:", cachedMultiply.size())