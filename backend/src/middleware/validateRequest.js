export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const value = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.validated = value;
    next();
  } catch (error) {
    if (error.issues) {
      return res.status(422).json({
        error: "Validasi gagal",
        details: error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
        })),
      });
    }
    next(error);
  }
};
