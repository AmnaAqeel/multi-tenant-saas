import Company from "../models/Company.model.js";

export const attachCompanyNames = async (userCompanies) => {
  // Get all company ObjectIds from either populated or raw _id form
  const companyIds = userCompanies.map(c => {
    if (typeof c.companyId === 'object' && c.companyId._id) {
      return c.companyId._id;
    }
    return c.companyId;
  });

  // Fetch name and description for these companies
  const companies = await Company.find(
    { _id: { $in: companyIds } },
    'name description'
  );

  // Map of companyId -> metadata
  const companyMetaMap = {};
  companies.forEach((c) => {
    companyMetaMap[c._id.toString()] = {
      name: c.name,
      description: c.description || '',
    };
  });

  // Add metadata to userCompanies
  return userCompanies.map((c) => {
    const companyId = typeof c.companyId === 'object' && c.companyId._id
      ? c.companyId._id.toString()
      : c.companyId.toString();

    const meta = companyMetaMap[companyId] || {};

    return {
      ...(typeof c.toObject === 'function' ? c.toObject() : c),
      name: meta.name || "Unknown",
      description: meta.description || "",
    };
  });
};


// takes an array of user companies as input.
//  It retrieves the corresponding company names from a database (using Mongoose) and returns a new array with the company names attached to each user company object.
//  If a company name is not found, it defaults to "Unknown".
  