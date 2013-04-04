// ==UserScript==
// @name        BackBeat
// @namespace   backbeat
// @description An HTML snarfer for music data
// @include     http*
// @require http://code.jquery.com/jquery-1.9.1.min.js
// @require http://code.jquery.com/ui/1.10.2/jquery-ui.js
// @require https://gitorious.org/microdatajs/microdatajs/blobs/raw/master/jquery.microdata.js
// @require https://gitorious.org/microdatajs/microdatajs/blobs/raw/master/jquery.microdata.json.js
// @require http://jsonpath.googlecode.com/svn/trunk/src/js/jsonpath.js
// @grant none
// @version     1
// ==/UserScript==

var items = $.microdata.json($(document).items(), function(o) { return o;});
var artists = {};
var match = false;
var nextIsItem = false;
if(items.items.length > 0)
{
  var item;
  for(item in items.items)
  {
    var types = jsonPath(items.items[item], '$..[?(@.type)]');
    if(types)
    {
      for(var i =0; i < types.length; i++)
      {
        //console.log(types[i]);
        if(types[i].type && types[i].type[0] === "http://schema.org/MusicAlbum" || nextIsItem)
        {
          match = true;
          if(types[i].properties)
          {
            if(!artists[types[i].properties.byArtist[0].properties.name[0]])
            {
              artists[types[i].properties.byArtist[0].properties.name[0]] = {};
            }
            if(!artists[types[i].properties.byArtist[0].properties.name[0]][types[i].properties.name[0]])
            {
              artists[types[i].properties.byArtist[0].properties.name[0]][types[i].properties.name[0]] = [];
            }
          } else {
            if(!artists[types[i].byArtist[0].properties.name[0]])
            {
              artists[types[i].byArtist[0].properties.name[0]] = {};
            }
            if(!artists[types[i].byArtist[0].properties.name[0]][types[i].name[0]])
            {
              artists[types[i].byArtist[0].properties.name[0]][types[i].name[0]] = [];
            } 
          }
          nextIsItem = false;
          // $('body').prepend('<a href="http://backbeat.herokuapp.com/' + encodeURIComponent(types[i].properties.byArtist[0].properties.name[0]) + '/' + encodeURIComponent(types[i].properties.name[0]) + '" target="_blank">BackBeat!</a>');
          //console.log("ALBUM: " + types[i].properties.name[0] + " By:" + types[i].properties.byArtist[0].properties.name[0]);
          // console.log(types[i].properties.byArtist[0].properties.name[0]);
        } else if(types[i][0] == "http://schema.org/MusicAlbum")
        {
          nextIsItem = true;
        }
      }
    }
  }
}
//console.log(items);
if(match)
{
  // GM_addStyle("#GM_BackBeatMenu { position: absolute; left: 1px; top: 50%; }");
  $('head').append('<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css" />');
  $('body').append('<ul id="GM_BackBeatMenu"><li>Backbeat!<ul id="GM_BackBeatArtistMenu"></ul></li></ul>');
  var artCnt = 0;
  for(artist in artists)
  {
    $('#GM_BackBeatArtistMenu').append('<li id="GM_BackBeatArtist_' +artCnt + '"><a href="http://backbeat.herokuapp.com/' + encodeURIComponent(artist) + '" target="_blank">' + artist + '</a></li>');
    if(Object.keys(artists[artist]).length > 0)
    {
        $('#GM_BackBeatArtist_' +artCnt).append('<ul id="GM_BackBeatArtist_' +artCnt + '_Albums"></ul>');
    }
    for(album in artists[artist])
    {
      $('#GM_BackBeatArtist_' +artCnt + '_Albums').append('<li><a href="http://backbeat.herokuapp.com/' + encodeURIComponent(artist) + '/' + encodeURIComponent(album) + '" target="_blank">' + album + '</a></li>');
    }
    artCnt++;
  }
  
  $('#GM_BackBeatMenu').css({'position': 'absolute', 'left':'1px', 'top':'50%'});
  $("#GM_BackBeatMenu").menu();
  
}