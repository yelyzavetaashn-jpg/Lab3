const outdated = (item) => {
        if (settings.expireTime === null) {
            return false
        }

        return Date.now() > item.expires
    }
