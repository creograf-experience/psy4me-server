class BaseClass {
  static async createOrUpdateObjectFromBody(body, objectId = '') {
    const object = this.getAllowedFieldsForCreate().reduce(
      (acc, allowedField) => ({ ...acc, [allowedField]: body[allowedField] }),
      {}
    );
    const result = objectId
      ? await this.findByIdAndUpdate(objectId, object, { new: true })
      : await this.create(object);

    return result;
  }
}

module.exports = BaseClass;
