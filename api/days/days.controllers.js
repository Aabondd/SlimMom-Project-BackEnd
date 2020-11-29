const Joi = require("joi");
const Day = require("./days.schema");

class DaysControllers {
  async removeDayProducts(req, res, next) {
    try {
      const {body: {productId, date}, user} = req;
      const productsDeleted = await Day.deleteMany({productId, date, userId:user._id});
      if (!productsDeleted.deletedCount) {
        return res.status(204).json({message: "Nothing to delete"})
      }
      return res.status(200).json({message: "Product has deleted"});
    }
    catch (error) {
      next(error);
    }
  }
  // мой вариант, так как для тестов чтоб что-то удалить, сначала нужно добавить
  // Наташе заменить на свой вариант, плюс там мож какае-то валидация будет в middleware
  // после реализации ЛОГИНА внести правки в код
  async addProductToDay(req, res, next) {
    try {
      const {user, body: {productId, weight, date}} = req;
      const day = new Day({
        productId,
        weight,
        date,
        userId: user._id,
      });

      const savedDay = await day.save();
      return res.status(201).json(savedDay);
    }
    catch (error) {
      next(error);
    }
  }

  async validateProduct (req, res, next) {
    const validSchema = Joi.object({
      productId: Joi.string().required(),
      weight: Joi.string().required(),
      date: Joi.date().required(),
    });
    const validResult = validSchema.validate(req.body);
    if (validResult.error) {
      return res.status(400).send(validResult.error.details);
    }
    next();
  }
}

module.exports = new DaysControllers();
