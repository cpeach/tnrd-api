
const excelJS = require("exceljs");

module.exports = { 
 

	
//	INIT
	init : function(r){
		return r;
	},

    
    make : (r,p)=>{

        let cells = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        const workbook = new excelJS.Workbook();  
		const worksheet = workbook.addWorksheet(p.name);
        
        p.header.columns.unshift("");
        worksheet.columns = p.header.columns.map(item=>({width:30}));	
        worksheet.getColumn(1).width   = 40;
        worksheet.getRow(1).height = 0;

        let sub_header       = worksheet.addRow(p.header.columns);
        sub_header.height    = 75;
        sub_header.width     = 30;
        sub_header.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
        sub_header.border = {top: {style:'thin'},right: {style:'thin',argb:'ffffff'},left: {style:'thin',argb:'ffffff'},bottom: {style:'thin'}};
        sub_header.fill   = {type: 'pattern',pattern:'solid',fgColor:{argb:'759e2e'},}
        sub_header.font   = {color: {argb:'ffffff'}};

        var row_count = 3;

        // categories
        for(let i=0;i<p.categories.length;i++){
            var category = p.categories[i];
            let cat_row = worksheet.addRow([category.data.name]);
            cat_row.height = 60;
            cat_row.fill   = {type: 'pattern',pattern:'solid',fgColor:{argb:'fafafa'}}
            cat_row.border = {bottom: {style:'thin',color:{argb:'c8c8c8'}}};
            cat_row.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
            row_count++;
            for(let j=0;j<category.items.length;j++){
                let item = category.items[j];
                let item_row = worksheet.addRow([item.data.name]);
                item_row.height = 35;
                item_row.border = {bottom: {style:'thin',color:{argb:'c8c8c8'}}};
                item_row.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
                for(let k=0;k<item.values.length;k++){
                    worksheet.getCell(cells.charAt(k+1)+row_count).value = item.values[k];
                }
                row_count++;
            }           
        }
        return workbook;

    },

    _make : (r,p)=>{

        let cells = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        const workbook = new excelJS.Workbook();  
		const worksheet = workbook.addWorksheet(p.title);
       
        p.columns.push({ label: 'Item Totals', key: '__$1' })
        p.columns.unshift("");
        worksheet.columns = p.columns.map(item=>({width:30}));	
        worksheet.getColumn(p.columns.length).width   = 40;
        worksheet.getColumn(1).width   = 40;
        worksheet.getRow(1).height = 0;

        let sub_header       = worksheet.addRow(p.columns.map(item=>item.label));
        sub_header.height    = 75;
        sub_header.width     = 30;
        sub_header.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
        sub_header.border = {top: {style:'thin'},right: {style:'thin',argb:'ffffff'},left: {style:'thin',argb:'ffffff'},bottom: {style:'thin'}};
        sub_header.fill   = {type: 'pattern',pattern:'solid',fgColor:{argb:'759e2e'},}
        sub_header.font   = {color: {argb:'ffffff'}};
        
        sub_header.getCell(p.columns.length).font = {italic: true,bold: true,color: {argb:'ffffff'}}

        var row_count = 3;
        p.columns.shift("");
        

        console.log(p)
    //  add categories
        p.categories.map(category=>{
            let cat_row = worksheet.addRow([category.label]);
            cat_row.height = 60;
            cat_row.fill   = {type:'pattern',pattern:'solid',fgColor:{argb:'fafafa'}}
            cat_row.border = {bottom: {style:'thin',color:{argb:'c8c8c8'}}};
            cat_row.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
            row_count++;
        
        //  add items    
            let col_totals = [];
            p.items.map((item,i)=>{
                
                if(category.key === item.parent){
                    let item_row = worksheet.addRow([item.label]);
                    item_row.height = 35;
                    item_row.border = {bottom: {style:'thin',color:{argb:'c8c8c8'}}};
                    item_row.alignment = { vertical: 'middle', horizontal: 'left',indent:1 };
                    
                 
                //  add values
                    let total = 0;
                    p.columns.map((column,c)=>{
                        let cell = worksheet.getCell(cells.charAt(c+1)+row_count);
                        cell.value = 0;
                        //col_totals[c] = 0;
                        p.values.map((value,v)=>{
                            if(column.key==="__$1"){
                                 cell.value = total;
                                 cell.font = {italic: true}
                                 col_totals[c] = 0;
                            }else{
                                if(item.key === value.parent && column.key === value.column){
                                    cell.value = value.label;
                                    total = parseInt(value.label) + total;
                                    col_totals[c] = parseInt(value.label) + (col_totals[c]||0); 
                                }                                
                            }

                        })
                    }); 
                      
                    row_count++;
                }
            });

            let totals_row = worksheet.addRow(["Totals"]);
            totals_row.height = 45;
            totals_row.border = {bottom: {style:'thin',color:{argb:'c8c8c8'}}};
            totals_row.alignment = { vertical: 'middle', horizontal: 'left',indent:1 }; 
            
            let sum = 0;
            let cell;
            
            col_totals.map((item,i)=>{
                sum += item;
                cell = worksheet.getCell(cells.charAt(i+1)+row_count);
                if(i<col_totals.length-1){
                    cell.value = item;   
                    cell.font = {italic: true,color:{argb:'646464'}}
                }else{
                    cell.value = sum;   
                    cell.font = {italic:true,bold:true,color:{argb:'646464'}}
                }
                
                   
            })

            row_count++;
        })


        return workbook;

    },


    
	
//	delete
	delete : function(r,p,c){
	
			
	},

	
}

