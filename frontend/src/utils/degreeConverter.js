// utils/degreeConverter.js

/**
 * Converts an English academic degree to its Persian equivalent.
 * @param {string} degree - The English degree name (e.g., "diploma", "bachelor's").
 * @returns {string} - The Persian equivalent or "نامشخص" if the degree is unknown.
 */
export const getPersianDegree = (degree) => {
  // Mapping of English degrees to Persian
  const degreeMap = {
    diploma: "دیپلم",
    "bachelor's": "کارشناسی",
    "master's": "کارشناسی ارشد",
    doctorate: "دکترا",
  };

  // Convert input to lowercase and return Persian equivalent or "نامشخص" if not found
  return degreeMap[degree.toLowerCase()] || "نامشخص";
};
