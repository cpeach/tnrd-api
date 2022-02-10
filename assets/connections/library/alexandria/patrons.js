
module.exports = {
  init : {
    
  },
  get : {
   
    id : function(r,p,c){
      var b = p[0];
      var q = `SELECT pv.record_num as pid, pv.barcode as barcode FROM 
sierra_view.patron_view pv
WHERE pv.barcode = '`+b+`'
LIMIT 1`;
      
      r.alexandria.query(r,[q],function(p){
        c(p);
      })
    }
  }
} 

/*alex.init(alex);
alex.query(alex,['select NOW()'],function(p){console.log(p[0][0].now)});*/

