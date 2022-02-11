//ILS

const probe = require('probe-image-size');

const sierra = require('/var/server/assets/connections/library/sierra/index.js');
const alexandria = require('/var/server/assets/connections/library/alexandria/index.js');
const programs = require('/var/server/assets/connections/library/alexandria/programs.js');
const patrons = require('/var/server/assets/connections/library/alexandria/patrons.js');
const libcal = require('/var/server/assets/connections/library/libcal/index.js');
const accounts = require('/var/server/assets/endpoints/accounts/index.js');
const geocode = require('/var/server/assets/connections/google/geocode.js');
const moment = require('moment');
const mongoose = require('mongoose');

// MODELS

const models = require('./models.js');
 
module.exports = {
	
	data : {
		application : process.env.library_ils_application,
		role : process.env.library_ils_role,
		path : process.env.library_ils_path,
    libcal_path : '/1.1'
	}, 
	
	init : function(r,p){
    
   r.db = mongoose.createConnection(process.env.mongo'+tnrl-patron-reg',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
    
    
    r.models = {};
    r.models.patron_registration = models.patron_registration(r.db);
		r.sierra     = sierra;
		r.alexandria = alexandria;
		r.programs   = programs;
		r.patrons   = patrons;
		r.accounts   = accounts;
    r.geocode = geocode;
    r.libcal = libcal;
    r.libcal.init(r.libcal);
		r.sierra.init(r.sierra);
		r.alexandria.init(r.alexandria);
		r.accounts.init(r.accounts);
    r.geocode.init(r.geocode);
		 
		//r.alexandria.query(r,['SELECT NOW()'],function(p){console.log(p)})
	},

	
	
//	PROFILES
	profiles : {
		
		validate : function(r,p,c){
			var b = p.user;
			var p = p.pass;
			var o = {method:'POST',path:r.data.path+'/patrons/validate',body:{barcode:b,pin:p}};

			r.sierra.request(r.sierra,[o],function(p){
				p = p[0];
				var result = {code:0,action:0,message:"",obj:{}}
				if(p === ''){
					result.code = 1;
					
					r.get.patron.info(r,[{barcode:b}],function(p){
						var patron = p;
						var pid = patron.id;
					//  see if user exists in accounts
						
						r.accounts.users.query(r.accounts,{"username":pid},function(p){
						//r.accounts.users.query(r.accounts,{"application":r.data.application,"profile":pid},function(p){
							
							var user = p[0];
							if(p.length===0){
								
								var ran  = Math.floor(1000 + Math.random() * 9000);
								var pass = parseInt(Date.now()+''+ran).toString(36);
								 
								var params = {
									"username": pid.toString(),
									"password": pass,
									"profile": {"application": r.data.application},
									"application": {
										"id": r.data.application,"role": r.data.role,
										"meta": {pid:pid,barcode:b}
									},
									"hidden":{ref:pass}
								}

								
								/*
								var params = {
									application:r.data.application,
									data:{ref:pass,pid:pid,barcode:b},
									profile:{pid:pid,barcode:b},
									role:r.data.role,
									username:pid.toString(),
									password:pass
								}*/
								r.accounts.signup(r.accounts,params,function(p){
									
									var val = {
										application:params.application,
										user:params.username,pass:params.password
									}
									/*
									r.accounts.signin(r.accounts,val,function(p){
										result.obj  = p;
										result.profile = patron;
										result.message = "New user has been created and signed in. See console log";
										result.action  = 2; 
										result.code    = 1; 
										result.pid     = params.username;
										c(result);
									});*/
								});	

							}else{
								r.accounts.signin(r.accounts,{application:user.profile.application._id,user:pid.toString(),pass:user.hidden.ref},function(p){
									
									result.obj  = p;
									result.profile = patron;
									result.code = 1;
									result.action = 1;
									result.pid = pid;
									result.message = "User has been signed in. See console log";
									c(result);
								});
							}



						});
						//r.accounts.users.get()
						//if no then register number
						//if yes then sign in user


															
					});

				}else{
					result.code = 0;
					result.message = p.description
					c(result)
				}
			});



		},
		get : function(r,p,c){
			c({});
		},
		insert : function(r,p,c){
			var pid = p.pid;
			r.patrons.get.id(r,[pid],function(p){
				c({code:1,message:"User Predefined in Sierra",id:pid,obj:p});
			});
		},
		update : function(r,p,c){c({code:0,message:"Function not available",id:pid,obj:p});},
		delete : function(r,p,c){c({code:0,message:"Function not available",id:pid,obj:p});},
	},
	
	
	
	
/*	SET*/	
	set : {
		
	/*	Test*/
		test : {
			connection : {
        alexandria : function(r,p,c){
          r.alexandria.query(r,['SELECT NOW()'],function(p){return c(p[0]);})
        },
        libcal : function(r,p,c){
          var o = {method:'GET',path:r.data.libcal_path+'/calendars'};
          r.libcal.request(r.libcal,[o],function(p){
            c(p);
          });
        }
      } 
		},
    
    patron : {
      record : {
        temporary : async function(r,p,c){
          var frmObject = p[0];
          //check if patron potentially exists.
          // this could possibly be done with the patron query directly through sierra API

          var query = `
          SELECT
	DISTINCT ON (pr.id)
	pr.id AS id,
	pr.barcode,
	pr.birth_date_gmt AS birth_date,
  pname.*,
  rm.*
FROM sierra_view.patron_view pr
Left JOIN sierra_view.patron_record_address pa ON pa.patron_record_id = pr.id
LEFT JOIN sierra_view.patron_record_fullname pname ON pname.patron_record_id = pr.id
LEFT JOIN sierra_view.record_metadata rm ON pr.record_num = rm.record_num

WHERE LOWER(pname.first_name) = LOWER('`+frmObject.first_name+`')
AND LOWER(pname.last_name ) = LOWER('`+frmObject.last_name+`')
AND pr.birth_date_gmt = '`+new Date(frmObject.birthdate).toISOString().split('T')[0]+`'
ORDER BY pr.id, rm.record_last_updated_gmt DESC
LIMIT 100
;
          `;

          r.alexandria.query(r,[query],function(p){

          if(p[0].length > 0){
            return c({code:12,message:'Existing Account'});
          }

          var ran = Math.random().toString().slice(2,11);
          var barcode = '28222' + ran;
          var pin = frmObject.phone.substr(-4);
          //check if random barcode is unique. If not, try again.
          r.get.patron.info(r,[{barcode:barcode}],function(p){
            if(!p){
               var patron = {
                  "emails" : [frmObject.email],
                  "names" : [frmObject.last_name + ', ' + frmObject.first_name],
                  "addresses" : [
                    {
                      "lines":[frmObject.address,frmObject.city + ' ' + frmObject.prov + ', ' + frmObject.postal],
                      "type":"a"
                    }
                  ],
                  "phones": [{
                    "number":frmObject.phone,
                    "type":"t"
                  }],
                  "pin":pin,
                  "barcodes":[barcode],
                  "varFields": [],
                  "patronType" : 12,
                  "birthDate":new Date(frmObject.birthdate).toISOString().split('T')[0],
                  "expirationDate": new Date(Date.now() + 12096e5).toISOString().split('T')[0],
                  "homeLibraryCode" : frmObject.home_lib
                }

               if(frmObject.guardian != 'NULL'){
                 patron.varFields[patron.varFields.length] = {
                      "fieldTag":"g",
                      "content":frmObject.guardian
                 }
               }

               if(patron.varFields.length == 0){
                delete patron.varFields;
               }

              r.set.patron.record.insert_temp_patron(r,{patron:patron},function(p){
               
                if(p instanceof mongoose.Error){
                  c({code:13,message:false});
                } else {
                  c({code:1,patron:p._id});
                }
              });

            } else {
              console.log('Barcode Exists - Retrying')
              r.set.patron.record.temporary(r,[frmObject],function(p){
                c(p[0]);
              });
            }


          });
         });


        },
        permanent : function(r,p,c){
          
        },
        confirm_temp_patron : async function(r,p,c){
          if (!mongoose.Types.ObjectId.isValid(p[0].id)){
              c({patron:3});
          }

          var mongo_patron = await r.models.patron_registration.findById(p[0].id).lean();
          if(!mongo_patron){
            c({patron:1});
          } else if (mongo_patron.expiry > Date.now()){ 

            //check if random barcode is unique. If not, try again.
          r.get.patron.info(r,[{barcode:mongo_patron.patron.barcodes[0]}],function(p){
              if(p){ 
                return c({patron:'Duplicate Barcode'});
              }

              var o = {method:'POST',path:r.data.path+'/patrons/', body : mongo_patron.patron};
              r.sierra.request(r.sierra,[o],function(p){
                
                if(p[0].httpStatus){
                  c({patron:2});
                } else {
                  c({patron:{email:mongo_patron.patron.emails,barcode:mongo_patron.patron.barcodes,expiry:mongo_patron.patron.expirationDate}});
                }
                
              });
              
            });
          } else {
              c({patron:'expired'});
          }
        },
        insert_temp_patron : async function(r,p,c){
          var temp_patron = p;
          temp_patron.created = Date.now();
          temp_patron.expiry = Date.now() + (10 * 60 * 1000);
          temp_patron.key = Math.random().toString().slice(2,11);
          var res = new r.models.patron_registration(temp_patron);
          res.save(function (e) {e ? c(e) : c(res);});
		    },

      },
      info :{
        address : function(r,p,c){
          var pid = p[0].pid;
          var address = p[0].address; // object
          var patronPatch = {
            addresses : address
          };
          
          var o = {method:'PUT',path:r.data.path+'/patrons/'+pid, body : patronPatch};
          r.sierra.request(r.sierra,[o],function(p){
            if (p[0] == ''){
              return c({pid:pid,updated:patronPatch});
            } else {
              return c({pid:pid,updated:false,error:p[0]});
            }
          });
        }
      }
    }
		
	
	},
	
/*	GET*/		
	get : {
    
    patron :{
      libcal_validate : function(r,p,c){
        var b = p[0].username;
        var p = p[0].password;
        var o = {method:'POST',path:r.data.path+'/patrons/validate',body : {barcode : b, pin : p}};
				r.sierra.request(r.sierra,[o],function(p){
          if(p[0] != ''){ return c({"auth": false }); }
          r.get.patron.info(r,[{barcode:b}],function(p){
            return c({
              "auth": true,
              "firstname": "Joe",
              "lastname": "Smith",
              "email": "j.smith@school.edu"
              });
           });
        }); 
        
      },
      validate : function(r,p,c){
        var b = p[0].barcode;
        var p = p[0].pin;
        var o = {method:'POST',path:r.data.path+'/patrons/validate',body : {barcode : b, pin : p}};
				r.sierra.request(r.sierra,[o],function(p){
          //catching if there was a login error
          //this step is crucial
          if(p[0] != ''){ return c(p[0]); }
          r.get.patron.info(r,[{barcode:b}],function(p){
            return c({barcode:b,patron:p});
          });
          
        });
      },
      query : function(r,p,c){
        var l = p[0].limit;
        var off = p[0].offset;
        var body = p[0].body;
        var o = {method:'POST',path:r.data.path+'/patrons/query?limit='+l+'&offset='+off+'',body : body};
				r.sierra.request(r.sierra,[o],function(p){
          var patrons = JSON.parse(p);
          r.get.patron.iterate_query(r,[patrons], function(data){
            c(data);
          });
        });
      },
      iterate_query(r,p,c){
          var patrons = p[0];
          var key = p[1]?p[1]:0;
          var link = patrons.entries[key].link;
          var arr = link.split("/");
          var pid = arr[arr.length - 1];
            r.get.patron.info(r,[{pid:pid}], function(data){
              patrons.entries[key] = data;
              if (key == patrons.entries.length - 1){
                c(patrons);
              } else {
                r.get.patron.iterate_query(r,[patrons,key + 1],c);
              }
            });
      },
      list : function(r,p,c){
        var l = p[0].limit?p[0].limit:false; 
        var off = p[0].offset;
        var o = {method:'GET',path:r.data.path+'/patrons/?limit='+l+'&offset='+off+'&fields=default,fixedFields,varFields&deleted=false'};
				r.sierra.request(r.sierra,[o],function(p){
         return c(p[0]);
        });
      },
      list_by_id : function(r,p,c){
        var ids = p[0].ids;
         var o = {method:'GET',path:r.data.path+'/patrons/?id='+ids+'&fields=default,fixedFields,varFields&deleted=false'};
				r.sierra.request(r.sierra,[o],function(p){
         return c(p[0]);
        });
      },
      list_by_postal_code : function(r,p,c){
        var limit = p[0].limit;
        var valid = p[0].valid;
        var ignored = p[0].ignored?p[0].ignored:false;

          var where = ` WHERE pa.region !~ '([a-zA-Z]\\\d[a-zA-Z] *?\\\d[a-zA-Z]\\\d)' AND pa.region != '***' `;

          if (valid) {
            where = ` WHERE pa.region ~ '([a-zA-Z]\\\d[a-zA-Z] *?\\\d[a-zA-Z]\\\d)' `;
          }

          if (ignored){
            where = ` WHERE pa.region = '***' `;
          }

         var query = `
         SELECT DISTINCT ON(pr.id)
	pr.id AS id,
	pr.record_num,
	concat(pr.record_type_code, pr.record_num) AS patron_code,
	pr.barcode,
	pa.addr1 AS addr1,
   pa.city AS city,
   pa.region AS region,
   pr.expiration_date_gmt AS expiration_date,
   pa.patron_record_address_type_id,
   addr1_2,
   city_2,
   region_2,
   type_2
	FROM sierra_view.patron_view pr
Left JOIN sierra_view.patron_record_address pa ON pa.patron_record_id = pr.id
LEFT JOIN sierra_view.record_metadata rm ON pr.record_num = rm.record_num
LEFT JOIN (SELECT DISTINCT ON (pr1.id)
	pr1.id AS id_2,
	pa1.addr1 AS addr1_2,
   pa1.city AS city_2,
   pa1.region AS region_2,
   pa1.patron_record_address_type_id AS type_2
	FROM sierra_view.patron_view pr1
Left JOIN sierra_view.patron_record_address pa1 ON pa1.patron_record_id = pr1.id
LEFT JOIN sierra_view.record_metadata rm1 ON pr1.record_num = rm1.record_num
WHERE pa1.patron_record_address_type_id = 2
ORDER BY pr1.id, pr1.record_num DESC 
) AS t2 ON t2.id_2 = pr.id `;

          query += where;

          query += ` AND pr.expiration_date_gmt > now() - '3 years' :: INTERVAL
AND pa.patron_record_address_type_id = 1
ORDER BY pr.id, pr.record_num DESC `

        if (limit){
          query += ` LIMIT ` + limit ;
        }
          r.alexandria.query(r,[query],function(p){
            c(p[0]);
          });

      },
      info : function(r,p,c){
        
        var b = p[0].barcode?p[0].barcode:null;
        if(b == null){
          if(p[0].pid){
            var pid = p[0].pid;
            var o = {method:'GET',path:r.data.path+'/patrons/'+pid+'?&fields=default,fixedFields,varFields'};
          } else if (p[0].patrons){
            var patrons = p[0].patrons;
            if(!Array.isArray(patrons)){
              patrons = Object.values(patrons);
            }
            var o = {method:'GET',path:r.data.path+'/patrons/?limit=1000&id='+patrons.join()+'&fields=default,fixedFields,varFields'};
          }
          r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
            
        } else {
          r.patrons.get.id(r,[b],function(p){
            if(p[0] === undefined || p[0].length == 0){
              return c(false);
            }
            var o = {method:'GET',path:r.data.path+'/patrons/'+p[0][0].pid+'?&fields=default,fixedFields,varFields'};
            r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
          });
        }

      },
      find : async function (r,p,c){
        var o = {method:'GET',path:r.data.path+'/patrons/find?varFieldTag='+p.varFieldTag+'&varFieldContent='+p.varFieldContent};
        r.sierra.request(r.sierra,[o],function(p){
          return c?c(p[0]):p[0];
        });
      },
      formatted_address : async function(r,p,c){
        var params = {};
        var address = p[0].replace(/ /g, "+").replace(/,/g, "+");
        var o = {method:'GET',path:'/maps/api/geocode/json?address='+address};
				r.geocode.request(r.geocode,[o,params],function(p){
          if(p[0].status != 'OK'){
            p[0] = {code:100,error:'Error'};
          }
          c(p[0]);
        });
      }
    },
		
	/*	SEARCH*/
		search : {
			
		/*	TITLE*/		
			text : function(r,p,c){
        var l = p[0].limit;
        var t = p[0].text;
				var o = {method:'GET',path:r.data.path+'/bibs/search?text='+t+'&fields=default,fixedFields,varFields&limit='+l};
				r.sierra.request(r.sierra,[o],function(p){
          var res = p[0];
          if(res.count == 0){
            return c(res);  
          }

           r.get.cover.iterate(r,[res.entries,0],function(p){
             res.entries = p;
             return c(res);
          });
        });
			}
		},
    /*
    item : function(r,p,c){
      var o = {method:'GET',path:r.data.path+'/items/'+p[0]+'?fields=default,fixedFields,varFields'};
				r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
    },*/
    item :{
      info : async function(r,p,c){
        if(Array.isArray(p[0])){
          var recordids = p[0]?p[0]:null;
          var o = {method:'GET',path:r.data.path+'/items/?limit=1000&id='+recordids.join()+'&fields=default,fixedFields,varFields'};
          r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
        } else {
          var recordid = p[0].recordid?p[0].recordid:null;
          var o = {method:'GET',path:r.data.path+'/items/'+recordid+'?&fields=default,fixedFields,varFields'};
          r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
        }
        
      },
      query : async function(r,p,c){
        var l = p[0].limit
        var off = p[0].offset;
        var body = p[0].body;
        var o = {method:'POST',path:r.data.path+'/items/query?limit='+l+'&offset='+off+'',body : body};
        //console.log(JSON.stringify(body,null,2));
				r.sierra.request(r.sierra,[o],function(p){
          var items = JSON.parse(p);
          //console.log(items);
          if(items.entries.length < 1){
            return c?c(items):items;
          }
          r.get.item.iterate_query(r,[items], function(data){
            return c?c(data):data;
          });
        });
      },
      iterate_query : async function(r,p,c){
          var items = p[0];
          var key = p[1]?p[1]:0;
          var link = items.entries[key].link;
          var arr = link.split("/");
          var recordid = arr[arr.length - 1];
        
          items.entries[key] = recordid;
        
          if (key == items.entries.length - 1){
            await r.get.item.info(r,[items.entries], function(data){
              c(data);
            });
          } else {
            r.get.item.iterate_query(r,[items,key + 1],c);
          }
      },
    },
    bib : function(r,p,c){
      var o = {method:'GET',path:r.data.path+'/bibs/'+p[0]+'?fields=default,fixedFields,varFields'};
				r.sierra.request(r.sierra,[o],function(p){
          var bib = p[0];
          r.get.cover.process(r,[bib],function(p){
            bib.coverimage = p;
            return c(bib);
          });
        });
    },
    bibs : {
      info :  function(r,p,c){
        var recordids = p[0]?p[0]:null;
        var o = {method:'GET',path:r.data.path+'/bibs/?limit=1000&id='+recordids.join()+'&fields=default,fixedFields,varFields'};
        r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
      }
    },
    marc : function(r,p,c){
      var bib = p[0].bib;
      var o = {method:'GET',path:r.data.path+'/bibs/'+bib+'/marc'};
      o.headers = {};
      o.headers['Accept']  = 'application/marc-json';
				r.sierra.request(r.sierra,[o],function(p){return c(p[0]);});
    },
    cover : {
      iterate : function (r,p,c){
          var bibs = p[0];
          var key = p[1]?p[1]:0;
            r.get.cover.process(r,[bibs[key].bib], function(data){
              bibs[key].bib.coverImage = data;

              if (key == bibs.length - 1){
                c(bibs);
              } else {
                r.get.cover.iterate(r,[bibs,key + 1],c);
              }
            });
      },
      process : async function (r,p,c){
        var bib = p[0];
        var isbnKey = Object.keys(bib.varFields).find(key => bib.varFields[key].fieldTag === 'i');
        var regex = /\d{13}/g;
        var match = (isbnKey)? bib.varFields[isbnKey].subfields[0].content.match(regex) : null;
        var isbn = (match !== null)? match[0] : null;

        if(isbn){
          bib.coverimage = 'https://contentcafe2.btol.com/ContentCafe/Jacket.aspx?UserID=SITK85065&Password=CC36698&Return=1&Type=M&Value='+isbn+'&erroroverride=1';
        } else {
          bib.coverimage = false;
        }
        
        if(bib.coverimage){
          var img = await probe(bib.coverimage);
          if(img.height == 1 && img.width == 1){;
            c(false);
          } else {
            c(bib.coverimage);
          }
        } else {
          c(bib.coverimage);
        }


      }
    },
    mobile_library : {
      stops : {
        upcoming : {
          all : async function(r,p,c){
            var df = p[0].df?p[0].df:moment().format('YYYY-MM-DD');
            var dt = p[0].dt?p[0].dt:moment(df).add(3, 'M').endOf('month').format('YYYY-MM-DD');
            var ml_id = p[0].ml_id?p[0].ml_id:'7622';
            var url = '/api'+r.data.libcal_path+'/hours/'+ml_id+'?&from='+df+'&to='+dt;
            console.log(url);
            var o = {method:'GET',path:encodeURI(url)};
            r.libcal.request(r.libcal,[o],function(p){
              c(p);
            }); 
          },
          byId : async function(r,p,c){

          }
        }
      }
    },
    programs : {
      time : function(r,p,c){
        r.programs.get.time(r,[p[0]],function(p){return c(p[0]);});
      },
      program : function(r,p,c){
        r.programs.get.program(r,[p[0]],function(p){return c(p[0]);});
      },
      sessions : function(r,p,c){
        r.programs.get.sessions(r,[p[0]],function(p){return c(p[0]);});
      },
      sections : function(r,p,c){
        r.programs.get.sections(r,[p[0]],function(p){return c(p[0]);});
      },
      month : function(r,p,c){
        r.programs.get.month(r,[p[0]],function(p){return c(p[0]);});
      },
      upcoming : function(r,p,c){

        var days = p[0].days?p[0].days:30;
        var cats = p[0].category?p[0].category:null; //array
        var audience = p[0].audience?p[0].audience:null; //array
        var calid = p[0].calid?p[0].calid:7935;
        var url = r.data.libcal_path+'/events?days='+days+'&cal_id='+calid;
        if (cats !== null){
          url += '&category='+cats.join(',');
        }
        if (audience !== null){
          url += '&audience='+audience.join(',');
        }
        var o = {method:'GET',path:url};
        r.libcal.request(r.libcal,[o],function(p){
            c(p);
        }); 
      }
    }
    
    
	},
	
/*	LET*/	
	let : {}
	
}