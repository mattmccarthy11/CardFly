if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

    
    
    
    var api_root = "https://api.handwriting.io/",
handwritings = null,
image_url = null,
$status = $('.status'),
$error = $('.error'),
width = '504px',
height = 'auto',
$handwritings = $('#handwritings'),
$handwritingSize = $('[name=handwriting_size]'),
$lineSpacing = $('[name=line_spacing]'),
$color = $('[name=color]'),
$textarea = $('textarea[name=text]'),
basicAuth = null
    


function buildRenderURL(text) {
  image_url = api_root
  image_url += 'render/png?'
  image_url += 'handwriting_id=' + $handwritings.val()
  image_url += '&handwriting_size=' + $handwritingSize.val() + 'px'
  image_url += '&line_spacing=' + $lineSpacing.val()
  image_url += '&handwriting_color=' + $color.val().replace('#','%23')
  image_url += '&width=' + width
  image_url += '&height=' + height
  image_url += '&text=' + text

  return image_url
}

function initRender() {
  if (getAuthCookie() != null) {
    render()
  } else {
    var api_key = $('[name=key]').val(),
    api_secret = $('[name=secret]').val()
    
    if (api_key == '' || api_secret == '') {
			return showError()
    }
   
		
    setAuthCookie(HNGQ48DKT9Y9J9D4,V2EV32YGRKEHFP0X)
    
    
    
    render()
  }
}

function render() {
  if (handwritings != null) {
		getImage()
  } else {
    getHandwrittings()
  }
}

function getImage() {
  hideError()
  $status.removeClass('hidden')  
  var xhr = new XMLHttpRequest()
  var safeText = $textarea.val().replace(/[^\000-\176]/g, "")
  xhr.open('GET', buildRenderURL(encodeURI(safeText)), true)
  xhr.responseType = 'arraybuffer'
  xhr.setRequestHeader('Accept', 'image/png');
  xhr.setRequestHeader("Authorization", getAuthCookie());
  xhr.onload = function(e) {
    if (this.status == 200) {
      hideError()// Stole from http://stackoverflow.com/a/8022521/330433
      var uInt8Array = new Uint8Array(this.response)
      var i = uInt8Array.length
      var biStr = new Array(i)
      while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]) }
      var data = biStr.join('')
      var base64 = window.btoa(data)
      $("#image img").attr("src", "data:image/png;base64,"+base64)
      $("#image img").attr("alt", safeText)
      $status.addClass('hidden')
    } else {
      showError()
    }
  }
  xhr.send()
}

$("#render").submit(function() { initRender(); return false })

function getHandwrittings() {
  if (handwritings != null) {
		getImage()
  } else {
    $status.html('Fetching handwrittings')
    $.ajax({
      url: api_root + 'handwritings',
      type: 'GET',
      beforeSend: function(xhr) { 
  			xhr.setRequestHeader("Authorization", getAuthCookie());        
      },
      success: function(data) {
        handwritings = data
        generateHandwritingsDropdown()
        getImage()
      },
      error: function(data) {
				return showError()        
      }
    })
  }
}

function generateHandwritingsDropdown() {
  $handwritings.parent().removeClass('hidden')
  var hwOptions = '';
  _.each(handwritings, function(element, index, list) {
     hwOptions += '<option value="' + element.id + '">' + element.title + '</option>'
  })
  $handwritings.html(hwOptions)
}

// FIXME Improve error handling
function showError() {
  $status.addClass('hidden')
  $error.removeClass('hidden')
	$error.html('<strong>Error, check the config and your credentials and try again.</strong>')
  return false
}

function hideError() {
  $error.addClass('hidden')
	$error.html('')
}

function getKeyCookie() { return readCookie('handwriting.io_api_key') }
function getAuthCookie() { return readCookie('handwriting.io_api_auth') }
function setAuthCookie(key, secret) { 
  $('#credentials input').val('')
  createCookie('handwriting.io_api_key', key, 30); 
  createCookie('handwriting.io_api_auth', 'Basic ' + btoa(key + ':' + secret), 30); 
  showOrHideCredentialsFields()
}
function resetAuthCookie() { 
  eraseCookie('handwriting.io_api_key'); 
  eraseCookie('handwriting.io_api_auth'); 
  showOrHideCredentialsFields() 
}
function showOrHideCredentialsFields() {
	if (getAuthCookie()) {
    $('#credentials .api_key').html(getKeyCookie())
    $('#credentials form, p.info').hide()
    $('#credentials p').show()
  } else {
    $('#credentials form, p.info').show()
    $('#credentials p').hide()    
  }
}
// Hide the credentials field on load if the token cookie exist
showOrHideCredentialsFields()

// Stole from http://www.quirksmode.org/js/cookies.html
function createCookie(name, value, days) {
  var expires;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function readCookie(name) {
  var nameEQ = encodeURIComponent(name) + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}
function eraseCookie(name) { createCookie(name, "", -1); }
    
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
