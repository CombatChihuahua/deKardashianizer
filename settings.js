document.addEventListener('DOMContentLoaded', function(){
  var dkcb = document.getElementById('dkcb');
  var kw = document.getElementById('kw');

  // set the initial state of the checkbox
  console.log(localStorage["dekardashianize"]);
  dkcb.checked = JSON.parse(localStorage["dekardashianize"]);
  kw.value = JSON.parse(localStorage["dekardashianizer_keywords"]);

  dkcb.addEventListener("change", function(){
    console.log("checkbox changed to "+dkcb.checked);
    localStorage["dekardashianize"] = JSON.stringify(dkcb.checked);
   });

  kw.addEventListener("keyup", function(){ // we save on keyup here since we're not guaranteed to get a change event on a textarea
    console.log("Keywords changed to"+kw.value);
    Keywords = kw.value.split(",");
    for (var j=0; j<Keywords.length; j++){ // trim the user's inputs
      Keywords[j]=Keywords[j].trim();
    }
    console.log(typeof(Keywords));
    localStorage["dekardashianizer_keywords"]=JSON.stringify(Keywords);
  });
});
