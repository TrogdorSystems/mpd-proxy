module.exports = path => {
  let servicePaths = {
    reservations: 'http://localhost:8081',
    menu: 'http://localhost:[FILL IN]',
    photos: 'http://localhost:[FILL IN]',
    review: 'http://localhost:[FILL IN]',
  };
  path = path.toLowerCase();
  if (path.includes('production')) {
    return servicePaths.reservations;
  } else if (path.includes('menu')) {
    return servicePaths.menu;
  } else if (path.includes('photos')) {
    return servicePaths.photos;
  } else if (path.includes('review')) {
    return servicePaths.review;
  };
};
