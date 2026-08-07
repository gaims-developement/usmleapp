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
        // Express request query/params are often read-only on the request object.
        // Validation still succeeds; routes can continue using the original values.
      }
    }

    if (parsed.params !== undefined) {
      try {
        req.params = parsed.params
      } catch {
        // Express request query/params are often read-only on the request object.
        // Validation still succeeds; routes can continue using the original values.
      }
    }

    return next()
  }
}
