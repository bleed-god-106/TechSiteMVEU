export const partners = [
  {
    id: 1,
    name: 'Samsung',
    logo: '/images/partners/samsung.svg',
    description: 'Инновационная бытовая техника и электроника мирового уровня',
    website: 'https://www.samsung.com',
    category: 'Электроника',
    country: 'Южная Корея',
    founded: 1938
  },
  {
    id: 2,
    name: 'LG',
    logo: '/images/partners/lg.svg',
    description: 'Качественная техника для дома с передовыми технологиями',
    website: 'https://www.lg.com',
    category: 'Бытовая техника',
    country: 'Южная Корея',
    founded: 1958
  },
  {
    id: 3,
    name: 'Bosch',
    logo: '/images/partners/bosch.svg',
    description: 'Немецкое качество и надежность в каждом изделии',
    website: 'https://www.bosch.com',
    category: 'Бытовая техника',
    country: 'Германия',
    founded: 1886
  },
  {
    id: 4,
    name: 'Siemens',
    logo: '/images/partners/siemens.svg',
    description: 'Высокотехнологичные решения для современного дома',
    website: 'https://www.siemens.com',
    category: 'Промышленное оборудование',
    country: 'Германия',
    founded: 1847
  },
  {
    id: 5,
    name: 'Electrolux',
    logo: '/images/partners/electrolux.svg',
    description: 'Шведская бытовая техника премиум класса для требовательных покупателей',
    website: 'https://www.electrolux.com',
    category: 'Бытовая техника',
    country: 'Швеция',
    founded: 1919
  },
  {
    id: 6,
    name: 'Philips',
    logo: '/images/partners/philips.svg',
    description: 'Здоровье и благополучие в каждом доме с технологиями Philips',
    website: 'https://www.philips.com',
    category: 'Медицина и красота',
    country: 'Нидерланды',
    founded: 1891
  },
  {
    id: 7,
    name: 'Indesit',
    logo: '/images/partners/indesit.svg',
    description: 'Доступная и надежная техника для ежедневного использования',
    website: 'https://www.indesit.com',
    category: 'Бытовая техника',
    country: 'Италия',
    founded: 1975
  },
  {
    id: 8,
    name: 'Candy',
    logo: '/images/partners/candy.svg',
    description: 'Итальянский стиль и функциональность в совершенном исполнении',
    website: 'https://www.candy.com',
    category: 'Бытовая техника',
    country: 'Италия',
    founded: 1945
  }
];

export const getPartnersByCategory = (category?: string) => {
  if (!category) return partners;
  return partners.filter(partner => partner.category === category);
};

export const getFeaturedPartners = () => {
  // Возвращаем всех партнеров
  return partners;
};

export const getPartnersByCountry = (country?: string) => {
  if (!country) return partners;
  return partners.filter(partner => partner.country === country);
}; 