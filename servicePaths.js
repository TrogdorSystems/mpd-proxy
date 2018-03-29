module.exports = path => {
  let servicePaths = {
    reservations: 'http://ec2-54-219-137-44.us-west-1.compute.amazonaws.com',
    menu: 'http://ec2-54-67-41-26.us-west-1.compute.amazonaws.com',
    photos: 'http://localhost:[FILL IN]',
    review: 'http://ec2-54-183-93-245.us-west-1.compute.amazonaws.com',
  };
  path = path.toLowerCase();
  if (path.includes('production')) {
    return servicePaths.reservations;
  } else if (path.includes('menu')) {
    return servicePaths.menu;
  } else if (path.includes('photos')) {
    return servicePaths.photos;
  } else if (path.includes('styles')) {
    return servicePaths.review;
  } else {
    return servicePaths.review;
  }
};
