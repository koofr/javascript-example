var apiBase = 'https://app.koofr.net';
var clientId = 'NGH3EJSMNB7IXFILTWYPJRV5W2A4ULHL';
var redirectUri = window.location.origin + '/javascript-example/koofrcallback.html';
var scope = 'public';

var uploadPath = '/';

$(function() {
  var accessToken = null;
  var mountId = null;

  $('#login-button').click(function() {
    window.open(apiBase + '/oauth2/auth?client_id=' + clientId + '&response_type=token&scope=' + scope + '&redirect_uri=' + encodeURIComponent(redirectUri), 'oauth-window', 'height=500,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes');
  });

  window.koofrOauthCallback = function(token) {
    $('#login').hide();

    accessToken = token;

    $.get(apiBase + '/api/v2/mounts?access_token=' + accessToken).then(function(res) {
      var primaryMount = _.find(res.mounts, function(x) {
        return x.isPrimary;
      });

      if (primaryMount) {
        mountId = primaryMount.id;

        $('#upload').show();
      }
    });
  };

  $('#fileupload').fileupload({
    dataType: 'json',
    autoUpload: false
  }).on('fileuploadadd', function(e, data) {
    var filename = data.files[0].name;

    data.url = apiBase + '/content/api/v2/mounts/' + mountId + '/files/put?path=' + encodeURIComponent(uploadPath) + '&info=true&filename=' + encodeURIComponent(filename) + '&access_token=' + accessToken;

    data.submit();
  }).on('fileuploadprogressall', function(e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);

    $('#progress .progress-bar').css('width', progress + '%');
  }).on('fileuploaddone', function(e, data) {
    var path = uploadPath + '/' + data.result.name;

    $.ajax({
      method: 'POST',
      url: apiBase + '/api/v2/mounts/' + mountId + '/links?access_token=' + accessToken,
      data: JSON.stringify({
        path: path
      }),
      contentType: 'application/json'
    }).then(function(res) {
      var linkContentUrl = apiBase + '/content/links/' + res.id + '/files/get?path='

      $('#result').append($('<p>').append($('<a>').attr('href', linkContentUrl).attr('target', '_blank').text(res.name)));
    });
  }).on('fileuploadfail', function(e, data) {
    alert('File upload failed.');
  })
});
