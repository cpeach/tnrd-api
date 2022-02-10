
//Sierra

module.exports = {

	request : async function(p){
		var host     = 'https://rhodes.tnrl.ca'
		var ses_path ='/iii/sierra-api/v6/token';
		var req_path ='/iii/sierra-api/v6'
		var client=process.env.sierra_client;
		
		var session_params = {method:'POST',headers:{'Content-Type':'application/json','Authorization' : 'Basic '+client}}
		var session = await fetch(host+ses_path,session_params)
		var session_res = await session.json();

		var request_params  = {method:p.method,headers:{'Content-type':'application/json','Authorization' : ' Bearer '+session_res.access_token}}
		request_params.body = typeof p.body==='object'?JSON.stringify(p.body):p.body || null;
	
		var request = await fetch(host+req_path+p.path,request_params);
		return request.status===200?await request.json():await request.text();

	}


	
}