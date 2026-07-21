/**
 * Pincode to State Mapping for India
 * Based on Indian postal code allocation:
 * - First digit represents region
 * - First two digits represent sub-region/state
 */

const PINCODE_STATE_MAP = {
  // Jammu & Kashmir (18xxxx, 19xxxx)
  '18': 'Jammu & Kashmir',
  '19': 'Jammu & Kashmir',
  
  // Himachal Pradesh (17xxxx)
  '17': 'Himachal Pradesh',
  
  // Punjab (14xxxx, 15xxxx, 16xxxx)
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Punjab',
  
  // Chandigarh (16xxxx)
  '160': 'Chandigarh',
  
  // Uttarakhand (24xxxx, 26xxxx)
  '24': 'Uttarakhand',
  '26': 'Uttarakhand',
  '263': 'Uttarakhand',
  
  // Haryana (12xxxx, 13xxxx)
  '12': 'Haryana',
  '13': 'Haryana',
  
  // Delhi (11xxxx)
  '11': 'Delhi',
  
  // Rajasthan (30xxxx - 34xxxx)
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  
  // Uttar Pradesh (20xxxx - 28xxxx)
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '25': 'Uttar Pradesh',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  
  // Bihar (80xxxx - 85xxxx)
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Bihar',
  '83': 'Bihar',
  '84': 'Bihar',
  '85': 'Bihar',
  
  // Sikkim (73xxxx)
  '737': 'Sikkim',
  
  // Arunachal Pradesh (79xxxx)
  '79': 'Arunachal Pradesh',
  '790': 'Arunachal Pradesh',
  '791': 'Arunachal Pradesh',
  '792': 'Arunachal Pradesh',
  
  // Nagaland (79xxxx)
  '797': 'Nagaland',
  '798': 'Nagaland',
  
  // Manipur (79xxxx)
  '795': 'Manipur',
  
  // Mizoram (79xxxx)
  '796': 'Mizoram',
  
  // Tripura (79xxxx)
  '799': 'Tripura',
  
  // Meghalaya (79xxxx)
  '793': 'Meghalaya',
  '794': 'Meghalaya',
  
  // Assam (78xxxx)
  '78': 'Assam',
  
  // West Bengal (70xxxx - 74xxxx)
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '743': 'West Bengal',
  
  // Jharkhand (81xxxx - 83xxxx)
  '814': 'Jharkhand',
  '815': 'Jharkhand',
  '825': 'Jharkhand',
  '826': 'Jharkhand',
  '827': 'Jharkhand',
  '828': 'Jharkhand',
  '829': 'Jharkhand',
  '831': 'Jharkhand',
  '832': 'Jharkhand',
  '833': 'Jharkhand',
  '834': 'Jharkhand',
  '835': 'Jharkhand',
  
  // Odisha (75xxxx - 77xxxx)
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  
  // Chhattisgarh (49xxxx)
  '49': 'Chhattisgarh',
  '490': 'Chhattisgarh',
  '491': 'Chhattisgarh',
  '492': 'Chhattisgarh',
  '493': 'Chhattisgarh',
  '494': 'Chhattisgarh',
  '495': 'Chhattisgarh',
  '496': 'Chhattisgarh',
  '497': 'Chhattisgarh',
  
  // Madhya Pradesh (45xxxx - 48xxxx)
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  
  // Gujarat (36xxxx - 39xxxx)
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  
  // Daman and Diu (39xxxx)
  '396': 'Daman and Diu',
  
  // Dadra and Nagar Haveli (39xxxx)
  '396': 'Dadra and Nagar Haveli',
  
  // Maharashtra (40xxxx - 44xxxx)
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  
  // Karnataka (56xxxx - 59xxxx)
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  
  // Goa (40xxxx)
  '403': 'Goa',
  
  // Lakshadweep (68xxxx)
  '682': 'Lakshadweep',
  
  // Kerala (67xxxx - 69xxxx)
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  
  // Tamil Nadu (60xxxx - 64xxxx)
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  
  // Puducherry (60xxxx)
  '605': 'Puducherry',
  '607': 'Puducherry',
  '609': 'Puducherry',
  
  // Andaman and Nicobar Islands (74xxxx)
  '744': 'Andaman and Nicobar Islands',
  
  // Telangana (50xxxx - 50xxxx)
  '50': 'Telangana',
  '501': 'Telangana',
  '502': 'Telangana',
  '503': 'Telangana',
  '504': 'Telangana',
  '505': 'Telangana',
  '506': 'Telangana',
  '507': 'Telangana',
  '508': 'Telangana',
  '509': 'Telangana',
  
  // Andhra Pradesh (51xxxx - 53xxxx)
  '51': 'Andhra Pradesh',
  '515': 'Andhra Pradesh',
  '516': 'Andhra Pradesh',
  '517': 'Andhra Pradesh',
  '518': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
};

/**
 * Resolve a 6-digit pincode to an Indian state
 * @param {string|number} pincode - 6-digit Indian pincode
 * @returns {string|null} - State name or null if not found
 */
function pincodeToState(pincode) {
  if (!pincode) return null;
  
  const pin = String(pincode).trim();
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return null;
  }
  
  // Try matching with progressively shorter prefixes
  // First try 3 digits, then 2
  const prefix3 = pin.substring(0, 3);
  if (PINCODE_STATE_MAP[prefix3]) {
    return PINCODE_STATE_MAP[prefix3];
  }
  
  const prefix2 = pin.substring(0, 2);
  if (PINCODE_STATE_MAP[prefix2]) {
    return PINCODE_STATE_MAP[prefix2];
  }
  
  return null;
}

module.exports = { pincodeToState };
