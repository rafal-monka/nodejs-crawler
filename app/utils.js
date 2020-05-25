exports.replaceHtmlEntites = (str) => {
  return str.replaceHtmlEntites();
}
String.prototype.replaceHtmlEntites = function() {
    var s = this.trim().replace(/<[^>]*>?/gm, '').replace(/\s\s+/g, ' ');
    var translate_re = /&(nbsp|amp|quot|lt|gt|apos);/g;
    var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">", "apos": "\""};
    return ( s.replace(translate_re, function(match, entity) {
      return translate[entity];
    }) );
};