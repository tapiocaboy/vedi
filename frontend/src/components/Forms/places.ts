/**
 * City centres for the birth-place search. Picking one fills latitude,
 * longitude, and timezone; the coordinates stay editable afterwards.
 * Timezone ids match the form's timezone list.
 */

export interface Place {
  name: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
  aliases: string[];
}

type Row = [name: string, country: string, lat: number, lng: number, tz: string, aliases?: string];

const ROWS: Row[] = [
  // Sri Lanka
  ['Colombo', 'Sri Lanka', 6.9271, 79.8612, 'Asia/Colombo'],
  ['Kandy', 'Sri Lanka', 7.2906, 80.6337, 'Asia/Colombo'],
  ['Galle', 'Sri Lanka', 6.0535, 80.221, 'Asia/Colombo'],
  ['Jaffna', 'Sri Lanka', 9.6615, 80.0255, 'Asia/Colombo'],
  ['Negombo', 'Sri Lanka', 7.2083, 79.8358, 'Asia/Colombo'],
  ['Gampaha', 'Sri Lanka', 7.0917, 79.9999, 'Asia/Colombo'],
  ['Anuradhapura', 'Sri Lanka', 8.3114, 80.4037, 'Asia/Colombo'],
  ['Borella', 'Sri Lanka', 6.9148, 79.8778, 'Asia/Colombo'],
  ['Peradeniya', 'Sri Lanka', 7.2599, 80.5977, 'Asia/Colombo'],
  ['Kalthota', 'Sri Lanka', 6.5667, 80.7833, 'Asia/Colombo'],
  // India
  ['Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata', 'Bombay'],
  ['New Delhi', 'India', 28.6139, 77.209, 'Asia/Kolkata', 'Delhi'],
  ['Bengaluru', 'India', 12.9716, 77.5946, 'Asia/Kolkata', 'Bangalore'],
  ['Chennai', 'India', 13.0827, 80.2707, 'Asia/Kolkata', 'Madras'],
  ['Kolkata', 'India', 22.5726, 88.3639, 'Asia/Kolkata', 'Calcutta'],
  ['Hyderabad', 'India', 17.385, 78.4867, 'Asia/Kolkata'],
  ['Pune', 'India', 18.5204, 73.8567, 'Asia/Kolkata'],
  ['Ahmedabad', 'India', 23.0225, 72.5714, 'Asia/Kolkata'],
  ['Jaipur', 'India', 26.9124, 75.7873, 'Asia/Kolkata'],
  ['Lucknow', 'India', 26.8467, 80.9462, 'Asia/Kolkata'],
  ['Kochi', 'India', 9.9312, 76.2673, 'Asia/Kolkata', 'Cochin'],
  ['Thiruvananthapuram', 'India', 8.5241, 76.9366, 'Asia/Kolkata', 'Trivandrum'],
  ['Kozhikode', 'India', 11.2588, 75.7804, 'Asia/Kolkata', 'Calicut'],
  ['Coimbatore', 'India', 11.0168, 76.9558, 'Asia/Kolkata'],
  ['Madurai', 'India', 9.9252, 78.1198, 'Asia/Kolkata'],
  ['Varanasi', 'India', 25.3176, 82.9739, 'Asia/Kolkata', 'Benares'],
  ['Chandigarh', 'India', 30.7333, 76.7794, 'Asia/Kolkata'],
  ['Amritsar', 'India', 31.634, 74.8723, 'Asia/Kolkata'],
  ['Srinagar', 'India', 34.0837, 74.7973, 'Asia/Kolkata'],
  ['Patna', 'India', 25.5941, 85.1376, 'Asia/Kolkata'],
  ['Bhopal', 'India', 23.2599, 77.4126, 'Asia/Kolkata'],
  ['Indore', 'India', 22.7196, 75.8577, 'Asia/Kolkata'],
  ['Nagpur', 'India', 21.1458, 79.0882, 'Asia/Kolkata'],
  ['Visakhapatnam', 'India', 17.6868, 83.2185, 'Asia/Kolkata', 'Vizag'],
  ['Guwahati', 'India', 26.1445, 91.7362, 'Asia/Kolkata'],
  ['Panaji', 'India', 15.4909, 73.8278, 'Asia/Kolkata', 'Goa'],
  // Rest of South and East Asia
  ['Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi'],
  ['Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi'],
  ['Islamabad', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi'],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka'],
  ['Kathmandu', 'Nepal', 27.7172, 85.324, 'Asia/Kathmandu'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok'],
  ['Yangon', 'Myanmar', 16.8409, 96.1735, 'Asia/Yangon', 'Rangoon'],
  ['Ho Chi Minh City', 'Vietnam', 10.8231, 106.6297, 'Asia/Ho_Chi_Minh', 'Saigon'],
  ['Hanoi', 'Vietnam', 21.0278, 105.8342, 'Asia/Ho_Chi_Minh'],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore'],
  ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869, 'Asia/Kuala_Lumpur'],
  ['Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila'],
  ['Hong Kong', 'Hong Kong', 22.3193, 114.1694, 'Asia/Hong_Kong'],
  ['Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai', 'Peking'],
  ['Shanghai', 'China', 31.2304, 121.4737, 'Asia/Shanghai'],
  ['Guangzhou', 'China', 23.1291, 113.2644, 'Asia/Shanghai'],
  ['Shenzhen', 'China', 22.5431, 114.0579, 'Asia/Shanghai'],
  ['Chengdu', 'China', 30.5728, 104.0668, 'Asia/Shanghai'],
  ['Taipei', 'Taiwan', 25.033, 121.5654, 'Asia/Taipei'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo'],
  ['Osaka', 'Japan', 34.6937, 135.5023, 'Asia/Tokyo'],
  ['Kyoto', 'Japan', 35.0116, 135.7681, 'Asia/Tokyo'],
  ['Seoul', 'South Korea', 37.5665, 126.978, 'Asia/Seoul'],
  ['Busan', 'South Korea', 35.1796, 129.0756, 'Asia/Seoul'],
  // Middle East
  ['Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai'],
  ['Abu Dhabi', 'United Arab Emirates', 24.4539, 54.3773, 'Asia/Dubai'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh'],
  ['Jeddah', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh'],
  ['Doha', 'Qatar', 25.2854, 51.531, 'Asia/Qatar'],
  ['Kuwait City', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait'],
  ['Baghdad', 'Iraq', 33.3152, 44.3661, 'Asia/Baghdad'],
  ['Tehran', 'Iran', 35.6892, 51.389, 'Asia/Tehran'],
  // Europe
  ['London', 'United Kingdom', 51.5074, -0.1278, 'Europe/London'],
  ['Dublin', 'Ireland', 53.3498, -6.2603, 'Europe/Dublin'],
  ['Lisbon', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon'],
  ['Madrid', 'Spain', 40.4168, -3.7038, 'Europe/Madrid'],
  ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris'],
  ['Brussels', 'Belgium', 50.8503, 4.3517, 'Europe/Brussels'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam'],
  ['Berlin', 'Germany', 52.52, 13.405, 'Europe/Berlin'],
  ['Zurich', 'Switzerland', 47.3769, 8.5417, 'Europe/Zurich'],
  ['Vienna', 'Austria', 48.2082, 16.3738, 'Europe/Vienna'],
  ['Rome', 'Italy', 41.9028, 12.4964, 'Europe/Rome'],
  ['Prague', 'Czech Republic', 50.0755, 14.4378, 'Europe/Prague'],
  ['Warsaw', 'Poland', 52.2297, 21.0122, 'Europe/Warsaw'],
  ['Budapest', 'Hungary', 47.4979, 19.0402, 'Europe/Budapest'],
  ['Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm'],
  ['Oslo', 'Norway', 59.9139, 10.7522, 'Europe/Oslo'],
  ['Copenhagen', 'Denmark', 55.6761, 12.5683, 'Europe/Copenhagen'],
  ['Helsinki', 'Finland', 60.1699, 24.9384, 'Europe/Helsinki'],
  ['Athens', 'Greece', 37.9838, 23.7275, 'Europe/Athens'],
  ['Istanbul', 'Turkey', 41.0082, 28.9784, 'Europe/Istanbul'],
  ['Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow'],
  ['Kyiv', 'Ukraine', 50.4501, 30.5234, 'Europe/Kiev', 'Kiev'],
  // Africa
  ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo'],
  ['Casablanca', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos'],
  ['Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg'],
  // Americas
  ['New York', 'United States', 40.7128, -74.006, 'America/New_York', 'NYC'],
  ['Chicago', 'United States', 41.8781, -87.6298, 'America/Chicago'],
  ['Denver', 'United States', 39.7392, -104.9903, 'America/Denver'],
  ['Los Angeles', 'United States', 34.0522, -118.2437, 'America/Los_Angeles', 'LA'],
  ['Anchorage', 'United States', 61.2181, -149.9003, 'America/Anchorage'],
  ['Honolulu', 'United States', 21.3069, -157.8583, 'Pacific/Honolulu'],
  ['Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto'],
  ['Vancouver', 'Canada', 49.2827, -123.1207, 'America/Vancouver'],
  ['Mexico City', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City'],
  ['São Paulo', 'Brazil', -23.5558, -46.6396, 'America/Sao_Paulo', 'Sao Paulo'],
  ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 'America/Buenos_Aires'],
  // Oceania
  ['Perth', 'Australia', -31.9505, 115.8605, 'Australia/Perth'],
  ['Adelaide', 'Australia', -34.9285, 138.6007, 'Australia/Adelaide'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 'Australia/Melbourne'],
  ['Brisbane', 'Australia', -27.4698, 153.0251, 'Australia/Brisbane'],
  ['Auckland', 'New Zealand', -36.8509, 174.7645, 'Pacific/Auckland'],
  ['Suva', 'Fiji', -18.1416, 178.4419, 'Pacific/Fiji'],
];

function fold(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export const PLACES: Place[] = ROWS.map(([name, country, lat, lng, tz, aliases]) => ({
  name,
  country,
  lat,
  lng,
  tz,
  aliases: aliases ? aliases.split(',').map(a => a.trim()).filter(Boolean) : [],
}));

/** Ranked city matches. Empty until the query is at least two characters. */
export function searchPlaces(query: string, limit = 6): Place[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];

  const hits: { place: Place; score: number }[] = [];
  for (const place of PLACES) {
    const name = fold(place.name);
    const country = fold(place.country);
    const aliases = place.aliases.map(fold);
    let score = 0;
    if (name === q || aliases.includes(q)) score = 100;
    else if (name.startsWith(q) || aliases.some(alias => alias.startsWith(q))) score = 80;
    else if (name.includes(q) || aliases.some(alias => alias.includes(q))) score = 50;
    else if (`${name} ${country}`.includes(q)) score = 40;
    else if (country.startsWith(q)) score = 30;
    if (score > 0) hits.push({ place, score });
  }

  hits.sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name) || a.place.country.localeCompare(b.place.country));
  // The same city can appear twice if it was listed for two presets; keep the first.
  const seen = new Set<string>();
  const unique: Place[] = [];
  for (const hit of hits) {
    const key = `${hit.place.name}|${hit.place.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(hit.place);
    if (unique.length >= limit) break;
  }
  return unique;
}
