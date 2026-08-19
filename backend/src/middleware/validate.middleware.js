export function validate(schema) {
  return function validationMiddleware(req, _res, next) {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    if (parsed.body !== undefined) {
      req.body = parsed.body
    }

    if (parsed.query !== undefined) {
      try {
        req.query = parsed.query
      } catch {
        for (const key of Object.keys(req.query)) {
          delete req.query[key]
        }
        Object.assign(req.query, parsed.query)
      }
    }

    if (parsed.params !== undefined) {
      try {
        req.params = parsed.params
      } catch {
        for (const key of Object.keys(req.params)) {
          delete req.params[key]
        }
        Object.assign(req.params, parsed.params)
      }
    }

    return next()
  }
}
