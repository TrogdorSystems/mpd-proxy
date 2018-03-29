module.exports = path => {
  let servicePaths = {
    reservations: 'http://ec2-54-219-137-44.us-west-1.compute.amazonaws.com',
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
