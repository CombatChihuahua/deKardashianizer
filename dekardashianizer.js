/* The deKardashianier
 * This is the code that does all the work on HuffingtonPost pages to remove things you might not want to keep up with
 * Most of the logic could be used on other sites with changes to the element names
 * Of course changes to the HuffPo site could break some or all of the patterns I've coded to
 *
 * Description of patterns in HuffPo pages:
 *
 * Containing Element                       Elements to Match On
 * -------------------------------------------------------------
 * #center_entries_container                div.entry
 * #rc_lower                                div.entry
 * #recent-blogs-overflow-container-right   div.entry
 * div.widget_children                      div.related_news_item
 * div.most_popular_entry_wrapper           div.most_popular_entry_wrapper
 * div.snp_most_popular_entry               div.snp_most_popular_entry
 * div.big_news_pages_story                 div.big_news_pages_story
 * div.big_news_pages_story-fp              div.big_news_pages_story-fp
 * div.menu                                 li
 * div.mp_cycle                             li
 * td                                       div
 * article                                  article
 * div.entry                                h4.subhead
 *
 * Most things are well contained except for that last one where a subhead containing links to other articles
 * is stuffed into the bottom of a div.entry
 */

console.log("dekardashianizer.js");

var Kards = 0; // How many things we remove. Will be an overestimate since there could be multiple elements with a common ancestor
var Keywords=[]; // initialize here to establish scope

$.expr[":"].cicontains = $.expr.createPseudo(function(arg) {
  return function( elem ) {
    return $(elem).text().toLowerCase().indexOf(arg.toLowerCase()) >= 0;
  };
});

$.fn.nuke = function(){ // extend jQuery with a function that removes offending elements
  Kards += this.length; // increment the removal counter.
  // Right here would be a good place to update the counter on the page action icon
  this.remove();
  //this.css("background-color","red"); // wonderful for debugging as an alternative to .remove()
}

function scanner(element, index, array){
  var matchOn = ":cicontains("+element+")"; // set up case insensitive matching

  var selector = "li"+matchOn; // menu items
  $('div.menu').find(selector).nuke();

  $('div.mp_cycle').find(selector).nuke(); // Most popular (also a list)

  selector = "div"+matchOn;
  $('td').find(selector).nuke(); // weird 3rd party articles in right column which use tables for layout. It's 2014 people!

  selector = "h4".matchOn; // "more" teasers that are unfortunately stuffed into the bottom of div.entry elements
  $('div.entry').find(selector).nuke();

  var HTMLelements = ["div.entry","div.related_news_item","div.most_popular_entry_wrapper",           // various possible elements that could
    "div.snp_most_popular_entry","article","div.big_news_pages_story","div.big_news_pages_story-fp"]; // contain the keywords we're looking for
  for (var i = 0; i < HTMLelements.length; i++) {
    selector = HTMLelements[i]+matchOn;
    $(selector).nuke(); // select and nuke!
  }
  return;
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) { // this listener is required to get the Keywords over from 
  console.log("Received keywords from background script.");                     // localStorage in the context of the popup and background script 
  Keywords = request.Keywords;
  console.log(Keywords);
  if ( typeof(Keywords)=="object" && Keywords.length>0 ){
    deKardashianize();
  }
  else if ( itypeof(Keywords)=="object" && Keywords.length==0 ) {
    console.log("List of Keywords is empty!");
  }
  else {
    console.log("'Keywords' is of type "+typeof(Keywords)+" should be 'object'");
  }
  return;
});

function deKardashianize(){ // This does the work of calling all the above defined functions
  console.log('DeKardashianizing!');
  Kards = 0;
  Keywords.forEach(scanner);
  console.log('Removed '+Kards+' things I didn\'t need to keep up with!'); // eventually want to show a count on the pageAction icon
}
