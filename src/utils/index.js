
export const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

export const angle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

export const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

export const getCssVar = (varName, element) => getComputedStyle(element || document.documentElement).getPropertyValue(varName).trim();
