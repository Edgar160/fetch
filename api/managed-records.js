import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

const PRIMARY_COLORS = ["red", "blue", "yellow"];
const OPEN_DISPOSITION = "open";
const CLOSE_DISPOSITION = "closed";

// Your retrieve function plus any additional functions go here ...
function retrieve(args = {}){
    const [page, colors] = [(args.page || 1),(args.colors || [])];
    if(typeof page !=="number"){
        return console.log("Page parameter must be a number")
    }
    const limit = 10;
    const offset = (limit * page) - limit;
    const url = URI(window.path).search({offset,limit:limit+1, "color[]":colors});
    return fetch(url.toString()).then((res)=>mapResponse(res,page)).catch((error)=>{
        console.log(error);
    });
}
async function mapResponse(response, page){
    let json = await response.json();
    const totalResults = json.length;
    json = json.slice(0, 10);
    return json.reduce((object, iteration)=>{
        const open = object.open;
        if(iteration.disposition===OPEN_DISPOSITION){
            iteration.isPrimary = PRIMARY_COLORS.includes(iteration.color) ? true : false
            open.push(iteration);
        }else if(iteration.disposition===CLOSE_DISPOSITION && PRIMARY_COLORS.includes(iteration.color)){
            object.closedPrimaryCount++;
        }
        return {
            ...object,
            ids:[...object.ids,iteration.id],
            open
        }
    },{
        ids:[],
        open:[],
        closedPrimaryCount:0,
        previousPage:(page <= 1) ? null : page-1,
        nextPage: (totalResults < 11) ? null : page+1
    });
}

export default retrieve;
