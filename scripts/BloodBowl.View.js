'use strict';

BloodBowl.prototype.initTemplates = function() {
  this.templates = {};

  var that = this;
  document.querySelectorAll('.template').forEach(function(el) {
    that.templates[el.getAttribute('id')] = el;
  });
};

BloodBowl.prototype.viewHome = function(render) {
  this.viewLeagues();
};

BloodBowl.prototype.viewLeagues = function() {
  var mainEl = this.renderTemplate('main-adjusted');
  var headerEl = this.renderTemplate('header-base', {
    title: 'Leagues',
    hasSectionHeader: true
  });

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), mainEl);

  var that = this;

  var renderResults = function(doc) {
    if (!doc) {
      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });

      var noResultsEl = that.renderTemplate('no-results');

      that.replaceElement(document.querySelector('.header'), headerEl);
      that.replaceElement(document.querySelector('main'), noResultsEl);
      return;
    }
    var data = doc.data();
    data['.id'] = doc.id;
    data['go_to_league'] = function() {
      that.router.navigate('/leagues/' + doc.id);
    };

    var el = that.renderTemplate('league-card', data);

    mainEl.querySelector('#cards').append(el);
  };

  this.getAllLeagues(renderResults);
};

BloodBowl.prototype.viewLeague = function(id) {
  var sectionHeaderEl;
  var that = this;
  let rounds = [];

  const addIndex = (t, index) => {
    t.index = index + 1;
    return t
  };

  return this.getLeague(id)
    .then(function(doc) {
      const league = doc.data();

      var mainEl = that.renderTemplate('main-league');

      // var standings = [
      //   { name: 'Jesters of Khaine', MP: 0, W: 0, D: 0, L: 0, TDF: 0, TDA: 0, Pts: 0 },
      //   { name: 'Hell Pit Sewer Rats', MP: 0, W: 0, D: 0, L: 0, TDF: 0, TDA: 0, Pts: 0 },
      //   { name: 'Barrelhouse Brewers', MP: 0, W: 0, D: 0, L: 0, TDF: 0, TDA: 0, Pts: 0 },
      //   { name: 'Drifting Castle Decendants', MP: 0, W: 0, D: 0, L: 0, TDF: 0, TDA: 0, Pts: 0 },
      //   { name: 'Sons of Northern Darkness', MP: 0, W: 0, D: 0, L: 0, TDF: 0, TDA: 0, Pts: 0 },
      // ];

      league.rounds.forEach((round, index) => {
        round.title = `Round: ${index + 1}`;
        var roundEl = that.renderTemplate('round', round);

        mainEl.querySelector('#rounds').append(roundEl);
      });

      league.standings = league.standings
        .sort((a,b) => {
          if (a.points < b.points) {
            return 1;
          }

          if (a.points > b.points) {
            return -1;
          }
          return 0;
      }).map(addIndex);

      console.log('league.standings', league.standings);

      var standingsEl = that.renderTemplate('standings', league);
      mainEl.querySelector('#standings').append(standingsEl);
      var headerEl = that.renderTemplate('header-league', {
        title: league.name,
        //hasSectionHeader: true
      });

      console.log('league.touchdowns', league.touchdowns);
      league.touchdowns = league.touchdowns.map(addIndex);
      var touchdownsEl = that.renderTemplate('stats', league);
      console.log('tou', touchdownsEl);
      mainEl.querySelector('#stats').append(touchdownsEl);

      that.replaceElement(document.querySelector('.header'), headerEl);
      that.replaceElement(document.querySelector('main'), mainEl);

      const tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
      document.addEventListener('MDCTabBar:activated', e => {
        console.log('e.detail', e.detail);
        const roundsEl = document.querySelector('#rounds');
        const statsEl = document.querySelector('#stats');
        const standingsEl = document.querySelector('#standings');
        if (e.detail.index === 0) {
          rounds.removeAttribute('hidden');
          statsEl.setAttribute('hidden', false);
          standingsEl.setAttribute('hidden', true);
        }
        if (e.detail.index === 1) {
          standingsEl.removeAttribute('hidden');
          roundsEl.setAttribute('hidden', true);
          statsEl.setAttribute('hidden', true);
        }
        if (e.detail.index === 2) {
          statsEl.removeAttribute('hidden');
          roundsEl.setAttribute('hidden', true);
          standingsEl.setAttribute('hidden', true);
        }
      })
    });
};

BloodBowl.prototype.viewTeam = function(id) {
  var sectionHeaderEl;
  var that = this;

  return this.getLeague(id)
    .then(function(doc) {
      var data = doc.data();
      var dialog =  that.dialogs.add_review;

      data.show_add_review = function() {
        dialog.show();
      };

      var mainEl;

      mainEl = that.renderTemplate('main-adjusted');

      data.rounds[0].teams[0].players.forEach(function(team) {
        var el = that.renderTemplate('player-card', team);
        mainEl.querySelector('#cards').append(el);
      });

      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });

      that.replaceElement(document.querySelector('.header'), headerEl);
      that.replaceElement(document.querySelector('main'), mainEl);

      var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
      toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');
    })
    .then(function() {
      that.router.updatePageLinks();
    })
    .catch(function(err) {
      console.warn('Error rendering page', err);
    });
};

BloodBowl.prototype.renderTemplate = function(id, data) {
  var template = this.templates[id];
  var el = template.cloneNode(true);
  el.removeAttribute('hidden');
  this.render(el, data);
  return el;
};

BloodBowl.prototype.render = function(el, data) {
  if (!data) {
    return;
  }

  var that = this;
  var modifiers = {
    'data-fir-foreach': function(tel) {
      var field = tel.getAttribute('data-fir-foreach');
      var values = that.getDeepItem(data, field);

      values.forEach(function (value, index) {
        var cloneTel = tel.cloneNode(true);
        tel.parentNode.append(cloneTel);

        Object.keys(modifiers).forEach(function(selector) {
          var children = Array.prototype.slice.call(
            cloneTel.querySelectorAll('[' + selector + ']')
          );
          children.push(cloneTel);
          children.forEach(function(childEl) {
            var currentVal = childEl.getAttribute(selector);

            if (!currentVal) {
              return;
            }

            childEl.setAttribute(
              selector,
              currentVal.replace('~', field + '/' + index)
            );
          });
        });
      });

      tel.parentNode.removeChild(tel);
    },
    'data-fir-content': function(tel) {
      var field = tel.getAttribute('data-fir-content');
      tel.innerText = that.getDeepItem(data, field);
    },
    'data-fir-click': function(tel) {
      tel.addEventListener('click', function() {
        var field = tel.getAttribute('data-fir-click');
        that.getDeepItem(data, field)();
      });
    },
    'data-fir-if': function(tel) {
      var field = tel.getAttribute('data-fir-if');
      if (!that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-if-not': function(tel) {
      var field = tel.getAttribute('data-fir-if-not');
      if (that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-attr': function(tel) {
      var chunks = tel.getAttribute('data-fir-attr').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      tel.setAttribute(attr, that.getDeepItem(data, field));
    },
    'data-fir-style': function(tel) {
      var chunks = tel.getAttribute('data-fir-style').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      var value = that.getDeepItem(data, field);

      if (attr.toLowerCase() === 'backgroundimage') {
        value = 'url(' + value + ')';
      }
      tel.style[attr] = value;
    }
  };

  var preModifiers = ['data-fir-foreach'];

  preModifiers.forEach(function(selector) {
    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });

  Object.keys(modifiers).forEach(function(selector) {
    if (preModifiers.indexOf(selector) !== -1) {
      return;
    }

    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });
};

BloodBowl.prototype.useModifier = function(el, selector, modifier) {
  el.querySelectorAll('[' + selector + ']').forEach(modifier);
};

BloodBowl.prototype.getDeepItem = function(obj, path) {
  path.split('/').forEach(function(chunk) {
    obj = obj[chunk];
  });
  return obj;
};

BloodBowl.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

BloodBowl.prototype.rerender = function() {
  this.router.navigate(document.location.pathname + '?' + new Date().getTime());
};
