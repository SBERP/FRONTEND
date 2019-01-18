

App.service('language', ["$translate", function($translate) {
  'use strict';
  // Internationalization
  // ----------------------

  var Language = {
    data: {
      // Handles language dropdown
      listIsOpen: false,
      // list of available languages
      available: {
        'en':    'English',
        'es':    'Español',
        'pt':    'Português',
        'zh-cn': '????',
      },
      selected: 'English'
    },
    // display always the current ui language
    init: function () {
      var proposedLanguage = $translate.proposedLanguage() || $translate.use();
      var preferredLanguage = $translate.preferredLanguage(); // we know we have set a preferred one in App.config
      this.data.selected = this.data.available[ (proposedLanguage || preferredLanguage) ];
      return this.data;

    },
    set: function (localeId, ev) {
      // Set the new idiom
      $translate.use(localeId);
      // save a reference for the current language
      this.data.selected = this.data.available[localeId];
      // finally toggle dropdown
      this.data.listIsOpen = ! this.data.listIsOpen;
    }
  };

  return Language;
}]);