'use strict';

/**
 * Initializes the BloodBowl app.
 */
function BloodBowl() {
  this.filters = {
    city: '',
    price: '',
    category: '',
    sort: 'Rating'
  };

  this.dialogs = {};

  var that = this;

  firebase.firestore().settings({
    timestampsInSnapshots: true
  });

  firebase.firestore().enablePersistence()
    .then(function() {
      return firebase.auth().signInAnonymously();
    })
    .then(function() {
      that.initTemplates();
      that.initRouter();
      //that.initReviewDialog();
      // that.initFilterDialog();
    }).catch(function(err) {
      console.log(err);
    });
}

/**
 * Initializes the router for the BloodBowl app.
 */
BloodBowl.prototype.initRouter = function() {
  this.router = new Navigo();

  var that = this;
  this.router
    .on({
      '/': function() {
        that.viewHome();
      }
    })
    .on({
      '/leagues/*': function() {
        var path = that.getCleanPath(document.location.pathname);
        var id = path.split('/')[2];
        that.viewLeague(id);
      }
    })
    .on({
      '/teams/*': function() {
        var path = that.getCleanPath(document.location.pathname);
        var id = path.split('/')[2];
        that.viewTeam(id);
      }
    })
    .resolve();
};

BloodBowl.prototype.getCleanPath = function(dirtyPath) {
  if (dirtyPath.startsWith('/index.html')) {
    return dirtyPath.split('/').slice(1).join('/');
  } else {
    return dirtyPath;
  }
};

BloodBowl.prototype.getFirebaseConfig = function() {
  return firebase.app().options;
};

BloodBowl.prototype.getRandomItem = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

BloodBowl.prototype.data = {
  words: [
    'Bar',
    'Fire',
    'Grill',
    'Drive Thru',
    'Place',
    'Best',
    'Spot',
    'Prime',
    'Eatin\''
  ],
  cities: [
    'Albuquerque',
    'Arlington',
    'Atlanta',
    'Austin',
    'Baltimore',
    'Boston',
    'Charlotte',
    'Chicago',
    'Cleveland',
    'Colorado Springs',
    'Columbus',
    'Dallas',
    'Denver',
    'Detroit',
    'El Paso',
    'Fort Worth',
    'Fresno',
    'Houston',
    'Indianapolis',
    'Jacksonville',
    'Kansas City',
    'Las Vegas',
    'Long Island',
    'Los Angeles',
    'Louisville',
    'Memphis',
    'Mesa',
    'Miami',
    'Milwaukee',
    'Nashville',
    'New York',
    'Oakland',
    'Oklahoma',
    'Omaha',
    'Philadelphia',
    'Phoenix',
    'Portland',
    'Raleigh',
    'Sacramento',
    'San Antonio',
    'San Diego',
    'San Francisco',
    'San Jose',
    'Tucson',
    'Tulsa',
    'Virginia Beach',
    'Washington'
  ],
  categories: [
    'Brunch',
    'Burgers',
    'Coffee',
    'Deli',
    'Dim Sum',
    'Indian',
    'Italian',
    'Mediterranean',
    'Mexican',
    'Pizza',
    'Ramen',
    'Sushi'
  ],
  ratings: [
    {
      rating: 1,
      text: 'Would never eat here again!'
    },
    {
      rating: 2,
      text: 'Not my cup of tea.'
    },
    {
      rating: 3,
      text: 'Exactly okay :/'
    },
    {
      rating: 4,
      text: 'Actually pretty good, would recommend!'
    },
    {
      rating: 5,
      text: 'This is my favorite place. Literally.'
    }
  ]
};

window.onload = function() {
  window.app = new BloodBowl();
};
