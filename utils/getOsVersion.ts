export const getOSVersion = (osVersion: string) => {
  // iOS version extraction
  const iosMatch = osVersion.match(/iPhone OS (\d+_\d+_\d+)/);
  if (iosMatch) {
    return `iOS ${iosMatch[1].replace(/_/g, ".")}`;
  }

  // Android version extraction
  const androidMatch = osVersion.match(/Android (\d+\.\d+\.\d+)/);
  if (androidMatch) {
    return `Android ${androidMatch[1]}`;
  }

  // macOS version extraction for MacIntel
  const macMatch = osVersion.match(/Macintosh.*Mac OS X (\d+_\d+_\d+)/);
  if (macMatch) {
    return `macOS ${macMatch[1].replace(/_/g, ".")}`;
  }

  // Other platform version extraction (e.g., web browsers)
  const otherMatch = osVersion.match(/Version\/(\d+\.\d+\.\d+)/);
  if (otherMatch) {
    return `Other Platform Version ${otherMatch[1]}`;
  }

  // Fallback if no match is found
  return "Not available";
};
