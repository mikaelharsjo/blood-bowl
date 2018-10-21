'use strict';

BloodBowl.prototype.initTemplates = function() {
  this.templates = {};

  var that = this;
  document.querySelectorAll('.template').forEach(function(el) {
    that.templates[el.getAttribute('id')] = el;
  });
};

BloodBowl.prototype.viewHome = function(render) {
  this.viewList();
};

BloodBowl.prototype.viewList = function(filters, filter_description) {
  if (!filter_description) {
    filter_description = 'any type of food with any price in any city.';
  }

  var mainEl = this.renderTemplate('main-adjusted');
  var headerEl = this.renderTemplate('header-base', {
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

  var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
  toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');

  mdc.autoInit();
};

BloodBowl.prototype.viewLeague = function(id) {
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

      data.rounds[0].teams.forEach(function(team, index) {
        team['go_to_team'] = function() {
          that.router.navigate('/teams/' + doc.id);
        };

        var el = that.renderTemplate('team-card', team);
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
