
module.exports = {
  init : {
    
  },
  get : {
    time: function(r,p,c){
      var q = `select NOW()`;
      r.alexandria.query(r,[q],function(p){
        c(p);
      })
    },
    month : function(r,p,c){
      var start = p[0].start;
      var end = p[0].end;
      var cat = p[0].category;
      //var location = p[0].location;
      var q = `SELECT
pv.id as id,
pv.program_name AS prog_name,
srs.start_date AS date,
locn.name AS location,
srs.duration_minutes AS duration,
status_code AS status_code,
gpmu.name  AS prog_type,
pv.record_num AS record_num
FROM sierra_view.program_view pv
LEFT JOIN sierra_view.program_record pr ON pv.id = pr.id
LEFT JOIN sierra_view.section_view sv ON pv.id = sv.program_record_id
LEFT JOIN sierra_view.section_record_session srs ON sv.id = srs.section_record_id
LEFT JOIN sierra_view.gtype_property_myuser gpmu ON pr.program_type_code = gpmu.code
LEFT JOIN sierra_view.location loc ON loc.code = location_code
LEFT JOIN sierra_view.location_name locn ON locn.location_id = loc.id
WHERE 
srs.start_date >= '`+start+`' AND start_date <= '`+end+`'
ORDER BY srs.start_date
LIMIT 500`;
      
      r.alexandria.query(r,[q],function(p){
        c(p);
      })
    },
    upcoming : function (r,p,c){
      var d = p[0].date;
      var cat = p[0].category;
      var q = `SELECT * FROM (
SELECT
DISTINCT ON (pv.program_name) pv.program_name,
	pv.id as id,
	srs.start_date AS start_date,
	locn.name AS location,
	srs.duration_minutes AS duration,
	status_code AS status_code,
	gpmu.name  AS program_type,
	pv.record_num
FROM sierra_view.program_view pv
	LEFT JOIN sierra_view.program_record pr ON pv.id = pr.id
	LEFT JOIN sierra_view.section_view sv ON pv.id = sv.program_record_id
	LEFT JOIN sierra_view.section_record_session srs ON sv.id = srs.section_record_id
	LEFT JOIN sierra_view.gtype_property_myuser gpmu ON pr.program_type_code = gpmu.code
	LEFT JOIN sierra_view.location loc ON loc.code = location_code
	LEFT JOIN sierra_view.location_name locn ON locn.location_id = loc.id
	WHERE
	srs.start_date >= '`+d+`'`;
  
    if(cat != 'All'){q += ` AND gpmu.name = '`+cat+`'`;}
  
	q += ` ORDER BY pv.program_name, srs.start_date
	LIMIT 500
) AS q ORDER BY q.start_date
`;
      
      r.alexandria.query(r,[q],function(p){
        c(p);
      })
    },
    program : function(r,p,c){
      var pid = p[0].program;
      var q = `SELECT
pv.id as id,
pv.program_name AS prog_name,
varf.field_content AS prog_description,
--srs.start_date AS start_date,
locn.name AS prog_location,
sv.location_code AS location_code,
srs.duration_minutes AS duration,
status_code AS status_code,
gpmu.name  AS prog_type,
sv.program_record_id,
pr.reg_allowed_code AS reg_allowed_code
FROM sierra_view.program_view pv
LEFT JOIN sierra_view.program_record pr ON pv.id = pr.id
LEFT JOIN sierra_view.section_view sv ON pv.id = sv.program_record_id
LEFT JOIN sierra_view.gtype_property_myuser gpmu ON pr.program_type_code = gpmu.code
LEFT JOIN sierra_view.section_record_session srs ON sv.id = srs.section_record_id
LEFT JOIN sierra_view.location loc ON loc.code = sv.location_code
LEFT JOIN sierra_view.location_name locn ON locn.location_id = loc.id
LEFT JOIN (
	SELECT record_id, field_content FROM sierra_view.varfield vf WHERE vf.varfield_type_code = 'r'
) varf ON varf.record_id = sv.program_record_id
WHERE 
pv.record_num = '`+pid+`'
LIMIT 1`;
      
      r.alexandria.query(r,[q],function(p){
        c(p);
      })
    },
    sections : function(r,p,c){
      var pid = p[0].program;
      var q = `SELECT
DISTINCT ON (sv.record_num) sv.record_num,
sv.id,
min_seats,
max_seats,
reg_per_patron,
reg_open_date_gmt,
reg_close_date_gmt,
reg_allowed_code,
sd.start_date AS next_session
FROM sierra_view.program_view pv
LEFT JOIN sierra_view.section_view sv ON pv.id = sv.program_record_id
LEFT JOIN (
	SELECT
	srs2.start_date AS start_date,
	sv2.record_num AS record_num
	FROM sierra_view.program_view pv2
	LEFT JOIN sierra_view.program_record pr2 ON pv2.id = pr2.id
	LEFT JOIN sierra_view.section_view sv2 ON pv2.id = sv2.program_record_id
	LEFT JOIN sierra_view.section_record_session srs2 ON sv2.id = srs2.section_record_id
	WHERE
	start_date > NOW()
	ORDER BY srs2.start_date
) sd ON sd.record_num = sv.record_num
WHERE 
pv.record_num = '`+pid+`'
LIMIT 500`;
      
       r.alexandria.query(r,[q],function(p){
        c(p);
      })
    },
    sessions : function(r,p,c){
      var section = p[0].section;
      
      var q = `SELECT
pv.id as id,
pv.program_name AS prog_name,
srs.start_date AS start_date,
locn.name AS location,
srs.duration_minutes AS duration,
status_code AS status_code,
gpmu.name  AS program_type
FROM sierra_view.program_view pv
LEFT JOIN sierra_view.program_record pr ON pv.id = pr.id
LEFT JOIN sierra_view.section_view sv ON pv.id = sv.program_record_id
LEFT JOIN sierra_view.gtype_property_myuser gpmu ON pr.program_type_code = gpmu.code
LEFT JOIN sierra_view.section_record_session srs ON sv.id = srs.section_record_id
LEFT JOIN sierra_view.location loc ON loc.code = location_code
LEFT JOIN sierra_view.location_name locn ON locn.location_id = loc.id
WHERE 
sv.record_num = '`+section+`'
ORDER BY srs.start_date
LIMIT 500`;
      
       r.alexandria.query(r,[q],function(p){
        c(p);
      })
    }
  }
} 

/*alex.init(alex);
alex.query(alex,['select NOW()'],function(p){console.log(p[0][0].now)});*/

