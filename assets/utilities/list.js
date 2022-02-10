

const moment = require("moment");

var list = {
	
//  SEARCH

    query : async(r,p)=>{

        let query = {};
        if(p.search && p.search.value && p.search.value.trim()!==''){
            let fields = r.fields(r,{value:p.search.value||'',fields:p.search.fields});
            query  = {'$or':fields};
        }
        
        if(p.search.links){
            p.search.links.map(async(item,i)=>{
                fields = r.fields(r,{value:p.search.value,fields:item.fields});
                let _res = await item.model.find({'$or':fields}).select('_id').lean();
                query['$or'].push({[item.reference]:{'$in':_res.map(q=>(q._id+""))}});
            })
        }
        query = p.filters ? await r.filters(r,{query:query,filters:p.filters}) : query;

        let results = await p.search.model.find(query).lean();

        if(p.joins && p.joins.length>0){
            results = r.joins(r,[results,p.joins]);
        }

        return results
    },    
 

//  FILTERS

    filters : async(r,p)=>{

        let value;
        for(let i=0;i<p.filters.length;i++){
            // ** note, this currently filters on arrays only, but will need to be expanded to support other 
            //    types such as  booleans. 
            value = p.filters[i].value  
            switch(typeof value){
                case 'string':
                    p.query[p.filters[i].reference] = value
                    break;
                case 'object':
                    if(Array.isArray(value)){
                        //  DATE RANGE
                        if(value.length===2 && typeof value[0].getMonth === 'function'){
                            p.query[p.filters[i].reference] = {'$gte':value[0],'$lt':value[1]};
                        //  ARRAY
                        }else{
                            value.length>0?p.query[p.filters[i].reference] = {'$in':value}:null;
                        }
                    //  DATE    
                    }else if(typeof value.getMonth === 'function'){
                        p.query[p.filters[i].reference] = {'$gte':value,'$lt':moment(value).add(1,'days').toDate()};
                    }
                    break;
            }
        }
        return p.query;
    },
    
//  FIELDS

    fields : (r,p)=>{
        let fields = p.fields.map(item=>(
            { [item]: { $regex: p.value, $options: "i" }}
        ))
        return fields;
    },

    //  JOINS

    joins : async(r,p)=>{
        var items = p[0];
        var joins = p[1];
       
        for(var j=0;j<joins.length;j++){
            for(var i=0;i<items.length;i++){
                if(joins[j].field){
                    items[i][joins[j].reference] = await joins[j].model.find({[joins[j].field]:items[i]._id.toString()})
                }else{
                    items[i][joins[j].reference] = await joins[j].model.findById(items[i][joins[j].reference])
                }
            }
        }
        return items;
    }  
}


module.exports = list;