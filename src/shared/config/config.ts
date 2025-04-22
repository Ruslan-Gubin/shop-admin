export const CONFIG_APP = {
  // API_ENDPOINT: 'http://localhost:35333/',
  //API_ENDPOINT: 'http://47.100.61.89:35333/',
  //API_ENDPOINT: 'http://test.en.feejoy.com:35333/',
  //API_ENDPOINT: process.env['API_URL_TEST']!,
  STRAPI_URL_TEST: process.env['STRAPI_URL_TEST']!,

  //API_ENDPOINT: process.env['API_URL_TEST']!,
  API_ENDPOINT: process.env['API_URL_DEV']!,

  //API_ENDPOINT: 'https://dev.feejoydatabase.rokyrocks.ru/',

  ACCESS_TOKEN_COOKIE: 'ACCESS_TOKEN_FEEJOY',
  REFRESH_TOKEN_COOKIE: 'REFRESH_TOKEN_FEEJOY',
  MODE: process.env.NODE_ENV,
} as const;
