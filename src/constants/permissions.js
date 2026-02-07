const PERMISSIONS = {
  PROPERTIES_MANAGEMENT: "properties_management",
  LEADS_CRM: "leads_crm",
  PAYMENT_TRACKING: "payment_tracking",
  MARKETING: "marketing",
  FACILITY_MANAGEMENT: "facility_management",
};

const ROLES = ["ADMIN", "AGENT"];

module.exports = {
  PERMISSIONS,
  ROLES,
  PERMISSION_VALUES: Object.values(PERMISSIONS), 
};
