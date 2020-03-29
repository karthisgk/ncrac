jQuery(document).ready(function($) {
  "use strict";

  const gToken = function(n = 10){
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };

    return (rand()+rand()+rand()+rand()+rand()+rand()+rand()+rand()
      +rand()+rand()+rand()+rand()+rand()+rand()+rand()
      +rand()+rand()+rand()+rand()+rand()+rand()+rand()
      +rand()+rand()+rand()+rand()+rand()+rand()+rand()).substr(0,n);
  };

  //Contact
  $('form.contactForm').submit(function(e) {
    e.preventDefault();
    var f = $(this).find('.form-group'),
      ferror = false,
      emailExp = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    var inputs = {};
    f.children('input').each(function() { // run all inputs

      var i = $(this); // current input
      var rule = i.attr('data-rule');
      if(i.attr('type') != 'file')
        inputs[i.attr('data-field')] = i.val();
      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;

          case 'email':
            if (!emailExp.test(i.val())) {
              ferror = ierror = true;
            }
            break;

          case 'checked':
            if (! i.is(':checked')) {
              ferror = ierror = true;
            }
            break;

          case 'regexp':
            exp = new RegExp(exp);
            if (!exp.test(i.val())) {
              ferror = ierror = true;
            }
            break;
        }
        i.next('.validation').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
        if(!ierror)
          i.next('.validation').hide();
      }
    });
    f.children('textarea').each(function() { // run all inputs

      var i = $(this); // current input
      var rule = i.attr('data-rule');

      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;
        }
        i.next('.validation').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
      }
    });
    if (ferror) return false;
    else var str = $(this).serialize();

    var progress = $('#uploader');
    var $button = $(this).find('button[type="submit"]');
    var file = $('#abstract-paper')[0].files;

    if(file.length == 0){      
      $('#abstract-paper').after('<div class="validation" style="display: block;">must upload file!</div>');
      return false;
    }
    file = file[0];

    const afterSuccess = (inputs) => {
      firebase.database().ref('abstract/' + gToken()).set(inputs);
      var message = 'Abstract submit sucessfull';
      $button.after('<p class="success">'+message+'</p>');
      $button.remove();      
      f.hide();
      progress.hide();
    };    
    progress.show();
    $('.validation').hide();
    $button.prop('disabled', true);
    inputs.fileName = 'ncrac2k20_' + inputs.abstractEmail.split('@')[0] +'_'+ file.name;
    console.log(inputs);
    var task = firebase.storage().ref('/abstract/' + inputs.fileName).put(file);
    task.on('state_changed', (snapshot) => {
      var p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progress.val(p);
    }, (error) => {
      $('#abstract-paper').after('<div class="validation" style="display: block;">error file upload!</div>');
      $button.prop('disabled', false);
    }, () => afterSuccess(inputs));
    return false;
  });

});
