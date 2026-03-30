// Real zip+city pairs per country with locale-appropriate street name patterns

export interface AddressEntry {
  zip: string;
  city: string;
}

export interface CountryAddressData {
  country: string;
  entries: AddressEntry[];
  /** Generate a realistic street name using faker */
  streetPatterns: string[];
}

const ADDRESS_DATA: Record<string, CountryAddressData> = {
  US: {
    country: "United States",
    streetPatterns: [
      "Main Street", "Oak Avenue", "Maple Drive", "Cedar Lane", "Park Boulevard",
      "Washington Street", "Lincoln Avenue", "Broadway", "Elm Street", "Pine Road",
      "Market Street", "Highland Avenue", "Sunset Boulevard", "River Road", "Lake Drive",
    ],
    entries: [
      { zip: "10001", city: "New York" },
      { zip: "10013", city: "New York" },
      { zip: "90001", city: "Los Angeles" },
      { zip: "90210", city: "Beverly Hills" },
      { zip: "60601", city: "Chicago" },
      { zip: "60614", city: "Chicago" },
      { zip: "77001", city: "Houston" },
      { zip: "85001", city: "Phoenix" },
      { zip: "19101", city: "Philadelphia" },
      { zip: "78201", city: "San Antonio" },
      { zip: "92101", city: "San Diego" },
      { zip: "75201", city: "Dallas" },
      { zip: "95101", city: "San Jose" },
      { zip: "78701", city: "Austin" },
      { zip: "32801", city: "Orlando" },
      { zip: "33101", city: "Miami" },
      { zip: "98101", city: "Seattle" },
      { zip: "80201", city: "Denver" },
      { zip: "02101", city: "Boston" },
      { zip: "37201", city: "Nashville" },
      { zip: "20001", city: "Washington" },
      { zip: "30301", city: "Atlanta" },
      { zip: "55401", city: "Minneapolis" },
      { zip: "97201", city: "Portland" },
      { zip: "89101", city: "Las Vegas" },
    ],
  },
  GB: {
    country: "United Kingdom",
    streetPatterns: [
      "High Street", "Church Road", "Station Road", "Victoria Road", "Park Lane",
      "King Street", "Queen Street", "London Road", "Mill Lane", "The Green",
      "Manor Road", "Springfield Road", "Grange Road", "Chapel Lane", "Bridge Street",
    ],
    entries: [
      { zip: "EC1A 1BB", city: "London" },
      { zip: "SW1A 1AA", city: "London" },
      { zip: "W1D 3AF", city: "London" },
      { zip: "SE1 7PB", city: "London" },
      { zip: "M1 1AE", city: "Manchester" },
      { zip: "M2 5DB", city: "Manchester" },
      { zip: "B1 1BB", city: "Birmingham" },
      { zip: "B2 4QA", city: "Birmingham" },
      { zip: "LS1 1UR", city: "Leeds" },
      { zip: "G1 1XQ", city: "Glasgow" },
      { zip: "L1 0AA", city: "Liverpool" },
      { zip: "BS1 1JG", city: "Bristol" },
      { zip: "EH1 1YZ", city: "Edinburgh" },
      { zip: "CF10 1EP", city: "Cardiff" },
      { zip: "NE1 7RU", city: "Newcastle upon Tyne" },
      { zip: "NG1 5FW", city: "Nottingham" },
      { zip: "S1 2HH", city: "Sheffield" },
      { zip: "OX1 1HS", city: "Oxford" },
      { zip: "CB2 1TN", city: "Cambridge" },
      { zip: "BA1 1SU", city: "Bath" },
    ],
  },
  DE: {
    country: "Deutschland",
    streetPatterns: [
      "Hauptstraße", "Bahnhofstraße", "Schulstraße", "Gartenstraße", "Bergstraße",
      "Kirchstraße", "Waldstraße", "Ringstraße", "Schillerstraße", "Goethestraße",
      "Friedrichstraße", "Mozartstraße", "Lindenstraße", "Bismarckstraße", "Wilhelmstraße",
    ],
    entries: [
      { zip: "10115", city: "Berlin" },
      { zip: "10178", city: "Berlin" },
      { zip: "10243", city: "Berlin" },
      { zip: "80331", city: "München" },
      { zip: "80539", city: "München" },
      { zip: "20095", city: "Hamburg" },
      { zip: "20457", city: "Hamburg" },
      { zip: "50667", city: "Köln" },
      { zip: "50968", city: "Köln" },
      { zip: "60311", city: "Frankfurt am Main" },
      { zip: "60594", city: "Frankfurt am Main" },
      { zip: "70173", city: "Stuttgart" },
      { zip: "40210", city: "Düsseldorf" },
      { zip: "44135", city: "Dortmund" },
      { zip: "45127", city: "Essen" },
      { zip: "28195", city: "Bremen" },
      { zip: "01067", city: "Dresden" },
      { zip: "04109", city: "Leipzig" },
      { zip: "30159", city: "Hannover" },
      { zip: "90402", city: "Nürnberg" },
      { zip: "69115", city: "Heidelberg" },
      { zip: "79098", city: "Freiburg im Breisgau" },
      { zip: "48143", city: "Münster" },
      { zip: "53111", city: "Bonn" },
      { zip: "24103", city: "Kiel" },
    ],
  },
  NL: {
    country: "Nederland",
    streetPatterns: [
      "Kerkstraat", "Dorpsstraat", "Molenweg", "Stationsweg", "Schoolstraat",
      "Julianastraat", "Wilhelminastraat", "Nieuwstraat", "Beatrixlaan", "Kastanjelaan",
      "Lindenlaan", "Berkenlaan", "Eikenlaan", "Parkweg", "Marktstraat",
    ],
    entries: [
      { zip: "1011 AB", city: "Amsterdam" },
      { zip: "1012 JS", city: "Amsterdam" },
      { zip: "1071 DL", city: "Amsterdam" },
      { zip: "3011 AA", city: "Rotterdam" },
      { zip: "3012 KA", city: "Rotterdam" },
      { zip: "2511 AA", city: "Den Haag" },
      { zip: "2514 JK", city: "Den Haag" },
      { zip: "3511 AA", city: "Utrecht" },
      { zip: "3512 JE", city: "Utrecht" },
      { zip: "5611 AA", city: "Eindhoven" },
      { zip: "6211 AA", city: "Maastricht" },
      { zip: "9711 AA", city: "Groningen" },
      { zip: "7511 AA", city: "Enschede" },
      { zip: "5211 AA", city: "'s-Hertogenbosch" },
      { zip: "6811 AA", city: "Arnhem" },
      { zip: "8011 AA", city: "Zwolle" },
      { zip: "2311 AA", city: "Leiden" },
      { zip: "4811 AA", city: "Breda" },
      { zip: "1813 AA", city: "Alkmaar" },
      { zip: "7311 AA", city: "Apeldoorn" },
    ],
  },
  FR: {
    country: "France",
    streetPatterns: [
      "Rue de la Paix", "Avenue des Champs-Élysées", "Boulevard Saint-Germain",
      "Rue du Faubourg Saint-Honoré", "Rue de Rivoli", "Avenue Victor Hugo",
      "Rue de la République", "Boulevard Voltaire", "Rue Pasteur", "Avenue Jean Jaurès",
      "Rue Gambetta", "Rue du Général de Gaulle", "Avenue de la Liberté",
      "Rue des Fleurs", "Boulevard de la Gare",
    ],
    entries: [
      { zip: "75001", city: "Paris" },
      { zip: "75004", city: "Paris" },
      { zip: "75006", city: "Paris" },
      { zip: "75008", city: "Paris" },
      { zip: "75011", city: "Paris" },
      { zip: "13001", city: "Marseille" },
      { zip: "13006", city: "Marseille" },
      { zip: "69001", city: "Lyon" },
      { zip: "69003", city: "Lyon" },
      { zip: "31000", city: "Toulouse" },
      { zip: "06000", city: "Nice" },
      { zip: "44000", city: "Nantes" },
      { zip: "67000", city: "Strasbourg" },
      { zip: "34000", city: "Montpellier" },
      { zip: "33000", city: "Bordeaux" },
      { zip: "59000", city: "Lille" },
      { zip: "35000", city: "Rennes" },
      { zip: "51100", city: "Reims" },
      { zip: "76600", city: "Le Havre" },
      { zip: "42000", city: "Saint-Étienne" },
      { zip: "21000", city: "Dijon" },
      { zip: "37000", city: "Tours" },
      { zip: "63000", city: "Clermont-Ferrand" },
      { zip: "29200", city: "Brest" },
      { zip: "30000", city: "Nîmes" },
    ],
  },
};

const LOCALE_ADDRESS_COUNTRY: Record<string, string> = {
  en_US: "US",
  en_GB: "GB",
  de_DE: "DE",
  nl_NL: "NL",
  fr_FR: "FR",
};

export interface GeneratedAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export function generateAddress(locale: string): GeneratedAddress {
  const countryKey = LOCALE_ADDRESS_COUNTRY[locale] ?? "US";
  const data = ADDRESS_DATA[countryKey];
  const entry = data.entries[Math.floor(Math.random() * data.entries.length)];
  const streetName = data.streetPatterns[Math.floor(Math.random() * data.streetPatterns.length)];
  const houseNumber = Math.floor(Math.random() * 150) + 1;

  return {
    street: `${streetName} ${houseNumber}`,
    city: entry.city,
    zip: entry.zip,
    country: data.country,
  };
}
