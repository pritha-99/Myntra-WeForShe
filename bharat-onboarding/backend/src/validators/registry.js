/**
 * Validators registry — maps validationType strings to validator modules.
 * To add a new validator: create the file, then add one line here.
 */
module.exports = {
  phone:    require('./phone'),
  gstin:    require('./gstin'),
  ifsc:     require('./ifsc'),
  password: require('./password'),
};
