'use strict';

BloodBowl.prototype.getAllLeagues = function(render) {
  var query = firebase.firestore()
    .collection('league');
  this.getDocumentsInQuery(query, render);
};

BloodBowl.prototype.getDocumentsInQuery = function(query, render) {
  render = render.bind(this);
  query.onSnapshot(function (snapshot) {
    if (!snapshot.size) {
      return render();
    }

    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'added') {
        render(change.doc);
      }
    });
  });
};

BloodBowl.prototype.getLeague = function(id) {
  return firebase.firestore().collection('league').doc(id).get();
};
