const field = {
  phone_explained: require('./content/field/phone_explained'),
  gstin_explained: require('./content/field/gstin_explained'),
  oms_explained: require('./content/field/oms_explained'),
  operational_readiness_explained: require('./content/field/operational_readiness_explained'),
  password_explained: require('./content/field/password_explained'),
  ifsc_explained: require('./content/field/ifsc_explained'),
  email_explained: require('./content/field/email_explained'),
  otp_explained: require('./content/field/otp_explained'),
  pincode_explained: require('./content/field/pincode_explained'),
  account_number_explained: require('./content/field/account_number_explained'),
  tds_explained: require('./content/field/tds_explained'),
  catalogue_width_explained: require('./content/field/catalogue_width_explained'),
  myntra_for_earth_explained: require('./content/field/myntra_for_earth_explained'),
  apob_explained: require('./content/field/apob_explained'),
  nature_of_business_explained: require('./content/field/nature_of_business_explained'),
  trademark_proof_explained: require('./content/field/trademark_proof_explained'),
};
const general = {
  terms_and_conditions: require('./content/general/terms_and_conditions'),
  faq: require('./content/general/faq'),
};
module.exports = { ...field, ...general };
