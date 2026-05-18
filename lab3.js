 const buildKey = (params) => {
        return params.map(item => JSON.stringify(item)).join("|")
    }
