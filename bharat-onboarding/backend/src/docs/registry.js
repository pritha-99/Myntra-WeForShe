/**
 * Docs registry — flat map of explainDocKey → { en, ta, hi }
 * Aggregates both field-specific and general content folders.
 * The route logic doesn't need to know which folder a doc came from.
 */
const field = {
  phone_explained:                  require('./content/field/phone_explained'),
  gstin_explained:                  require('./content/field/gstin_explained'),
  oms_explained:                    require('./content/field/oms_explained'),
  operational_readiness_explained:  require('./content/field/operational_readiness_explained'),
  password_explained:               require('./content/field/password_explained'),
  ifsc_explained:                   require('./content/field/ifsc_explained'),
};

const general = {
  terms_and_conditions: require('./content/general/terms_and_conditions'),
  faq:                  require('./content/general/faq'),
};

module.exports = { ...field, ...general };
