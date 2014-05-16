/* The deKardashianier
 * This is the code that does all the work on HuffingtonPost pages to remove things you might not want to keep up with
 * The names of the elements would need to be changed for this code to work on other sites
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
 * Elements that show up in individual article pages but not in category or home pages (things get messy here)
 *
 * span.entrytag                            span.entrytag
 * section.around-the-web                   p
 * li.hp_carousel_item                      li.hp_carousel_item
 * li.grv_article                           li.grv_article
 *
 * Most things are well contained except for that last one where a subhead containing links to other articles
 * is stuffed into the bottom of a div.entry
 *
 * In individual articles the "entry" class is combined with "wrapper" or "column" but these should NOT be removed
 */

console.log("dekardashianizer.js");

var Kards = 0; // How many things we remove. Will be an overestimate since there could be multiple elements with a common ancestor
var Keywords=[]; // initialize here to establish scope
var dbg = false; // debugging flag

$('body').keyup( function(e){ // Extra goodie, bind ESC key to close any open lightbox
  if (e.keyCode==27){         // This has nothing to do with deKardashinizing but it's a feature that HuffPo needs :)
    $('div.qr_close_a').trigger('click');
  }
});

$.expr[":"].cicontains = $.expr.createPseudo(function(arg) { // extend jQuery with a case insensitive contains function
  return function( elem ) {
    return $(elem).text().toLowerCase().indexOf(arg.toLowerCase()) >= 0;
  };
});

$.fn.nuke = function(){ // extend jQuery with a function that removes offending elements
  Kards += this.length; // increment the removal counter.
  // Right here would be a good place to update the counter on the page action icon
  if (dbg){
    if (this.length>0) { console.log(this); }
    this.css("background-color","red"); // wonderful for debugging as an alternative to .remove()
  }
  else {
    this.remove();
  }
}

function scanner(element, index, array){ // the function that actually examines elements and decides which to nuke
  var matchOn = ":cicontains("+element+")"; // set up case insensitive matching
  var divEntry = "div.entry:not('div.wrapper,div.column')"; // qualified div.entry

  var selector = "li"+matchOn; // menu items
  $('div.menu').find(selector).nuke();

  $('div.mp_cycle').find(selector).nuke(); // Most popular articles (also a list)

  selector = "div"+matchOn;
  $('td').find(selector).nuke(); // weird 3rd party articles in right column which use tables for layout. It's 2014 people!

  selector = "h4"+matchOn; // "more" teasers that are unfortunately stuffed into the bottom of div.entry elements
  $(divEntry).find(selector).nuke();

  selector = "p"+matchOn; // "around the web" items, these are in paragraphs inside a section
  $('section.around-the-web').find(selector).nuke();

  var HTMLelements = [ // various possible elements that could contain the keywords we're looking for
    "span.entrytag",
    "li.hp_carousel_item",
    "li.grv_article",
    "div.related_news_item",
    "div.most_popular_entry_wrapper",
    "div.snp_most_popular_entry",
    "div.big_news_pages_story",
    "div.big_news_pages_story-fp",
    "div.trc_spotlight_item",
    "article:not('article.entry')",
    divEntry
  ];       // ORDER MATTERS! We want to delete from small to big to avoid over-eager deletions

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

function deKardashianize(){ // This is just the supervisor function
  console.log('DeKardashianizing!');
  Kards = 0;
  Keywords.forEach(scanner);
  console.log('Removed '+Kards+' things I didn\'t need to keep up with!'); // eventually want to show a count on the pageAction icon
}
